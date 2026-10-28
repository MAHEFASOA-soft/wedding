<?php

namespace App\Controller;

use App\Entity\Invoice;
use App\Entity\FinanceReceipt;
use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class InvoiceController extends AbstractController
{

        #[Route('/invoices', name: 'api_invoices', methods: ['GET'])]
        public function getInvoices(EntityManagerInterface $entityManager): JsonResponse
        {
            $invoices = $entityManager->getRepository(Invoice::class)->findBy([], ['date' => 'DESC']);
            return $this->json(array_map(fn (Invoice $invoice) => $this->serializeInvoice($invoice), $invoices));
        }

        #[Route('/invoices', name: 'api_create_invoice', methods: ['POST'])]
        public function createInvoice(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            $validationError = $this->validateInvoiceContent($payload);
            if ($validationError) return $validationError;

            $total = (int) $payload['totalAmount'];
            $initialPayment = $payload['initialPayment'] ?? null;
            $paidAmount = is_array($initialPayment) ? (int) ($initialPayment['amount'] ?? 0) : 0;
            if ($paidAmount < 0 || $paidAmount > $total) {
                return $this->json(['error' => 'Initial payment must be between zero and the invoice total'], 400);
            }

            $invoice = new Invoice();
            $invoice->setId('fac-'.bin2hex(random_bytes(16)));
            $invoice->setInvoiceNumber($this->nextInvoiceNumber($entityManager));
            $invoice->setClientName((string) ($payload['clientName'] ?? ''));
            $invoice->setEventName((string) ($payload['eventName'] ?? ''));
            $invoice->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $invoice->setDueDate((string) ($payload['dueDate'] ?? date('Y-m-d')));
            $invoice->setTotalAmount($total);
            $invoice->setPaidAmount($paidAmount);
            $invoice->setStatus($this->resolveStatus($paidAmount, $total, (string) ($payload['dueDate'] ?? date('Y-m-d'))));
            $invoice->setItems((array) ($payload['items'] ?? []));
            $entityManager->persist($invoice);

            $receipt = null;
            if ($paidAmount > 0 && is_array($initialPayment)) {
                $paymentMethod = (string) ($initialPayment['paymentMethod'] ?? '');
                if (!$this->isPaymentMethodAllowed($paymentMethod)) {
                    return $this->json(['error' => 'Unsupported payment method'], 400);
                }
                $receipt = $this->createPaymentReceipt($invoice, $initialPayment, $paidAmount, $entityManager);
                $entityManager->persist($receipt);
            }

            $entityManager->flush();
            return $this->json([
                'invoice' => $this->serializeInvoice($invoice),
                'receipt' => $receipt ? $this->serializeReceipt($receipt) : null,
            ], 201);
        }

        #[Route('/invoices/{id}', name: 'api_update_invoice', methods: ['PUT', 'PATCH'])]
        public function updateInvoice(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $invoice = $entityManager->getRepository(Invoice::class)->find($id);
            if (!$invoice) {
                return $this->json(['error' => 'Invoice not found'], 404);
            }
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            if (array_key_exists('paidAmount', $payload) && (int) $payload['paidAmount'] !== $invoice->getPaidAmount()) {
                return $this->json(['error' => 'Paid amount can only be changed through the payment endpoint'], 409);
            }
            $lockedFields = ['clientName', 'eventName', 'date', 'totalAmount', 'items'];
            if ($invoice->getPaidAmount() > 0 && array_intersect($lockedFields, array_keys($payload))) {
                return $this->json(['error' => 'A partially or fully paid invoice cannot change its billed content'], 409);
            }

            if (isset($payload['clientName'])) $invoice->setClientName(trim((string) $payload['clientName']));
            if (isset($payload['eventName'])) $invoice->setEventName(trim((string) $payload['eventName']));
            if (isset($payload['date'])) $invoice->setDate((string) $payload['date']);
            if (isset($payload['dueDate'])) $invoice->setDueDate((string) $payload['dueDate']);
            if (isset($payload['totalAmount'])) {
                $total = filter_var($payload['totalAmount'], FILTER_VALIDATE_INT);
                if ($total === false || $total < 0) return $this->json(['error' => 'totalAmount must be a non-negative integer'], 400);
                $invoice->setTotalAmount($total);
            }
            if (array_key_exists('items', $payload)) {
                if (!is_array($payload['items'])) return $this->json(['error' => 'items must be an array'], 400);
                $invoice->setItems($payload['items']);
            }
            $invoice->setStatus($this->resolveStatus($invoice->getPaidAmount(), $invoice->getTotalAmount(), $invoice->getDueDate()));
            $entityManager->flush();
            return $this->json($this->serializeInvoice($invoice));
        }

        #[Route('/invoices/{id}/payments', name: 'api_record_invoice_payment', methods: ['POST'])]
        public function recordPayment(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $invoice = $entityManager->getRepository(Invoice::class)->find($id);
            if (!$invoice) return $this->json(['error' => 'Invoice not found'], 404);

            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;
            $amount = filter_var($payload['amount'] ?? null, FILTER_VALIDATE_INT);
            $paymentMethod = (string) ($payload['paymentMethod'] ?? '');
            if ($amount === false || $amount <= 0) return $this->json(['error' => 'Payment amount must be a positive integer'], 400);
            if (!$this->isPaymentMethodAllowed($paymentMethod)) return $this->json(['error' => 'Unsupported payment method'], 400);

            $newPaidAmount = $invoice->getPaidAmount() + $amount;
            if ($newPaidAmount > $invoice->getTotalAmount()) {
                return $this->json(['error' => 'Payment exceeds the remaining balance'], 400);
            }

            $invoice->setPaidAmount($newPaidAmount);
            $invoice->setStatus($this->resolveStatus($newPaidAmount, $invoice->getTotalAmount(), $invoice->getDueDate()));
            $receipt = $this->createPaymentReceipt($invoice, $payload, $amount, $entityManager);
            $entityManager->persist($receipt);
            $entityManager->flush();

            return $this->json([
                'invoice' => $this->serializeInvoice($invoice),
                'receipt' => $this->serializeReceipt($receipt),
            ]);
        }

        #[Route('/invoices/{id}', name: 'api_delete_invoice', methods: ['DELETE'])]
        public function deleteInvoice(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $invoice = $entityManager->getRepository(Invoice::class)->find($id);
            if (!$invoice) {
                return $this->json(['error' => 'Invoice not found'], 404);
            }
            if ($invoice->getPaidAmount() > 0) {
                return $this->json(['error' => 'A paid invoice cannot be deleted'], 409);
            }
            $entityManager->remove($invoice);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeInvoice(Invoice $invoice): array
        {
            return [
                'id' => $invoice->getId(),
                'invoiceNumber' => $invoice->getInvoiceNumber(),
                'clientName' => $invoice->getClientName(),
                'eventName' => $invoice->getEventName(),
                'date' => $invoice->getDate(),
                'dueDate' => $invoice->getDueDate(),
                'totalAmount' => $invoice->getTotalAmount(),
                'paidAmount' => $invoice->getPaidAmount(),
                'status' => $invoice->getStatus(),
                'items' => $invoice->getItems(),
            ];
        }

        private function decodePayload(Request $request): array|JsonResponse
        {
            try {
                $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                return $this->json(['error' => 'Invalid JSON payload'], 400);
            }

            return is_array($payload) ? $payload : $this->json(['error' => 'JSON object is required'], 400);
        }

        private function validateInvoiceContent(array $payload): ?JsonResponse
        {
            foreach (['clientName', 'eventName', 'date', 'dueDate'] as $field) {
                if (!isset($payload[$field]) || !is_string($payload[$field]) || trim($payload[$field]) === '') {
                    return $this->json(['error' => sprintf('%s is required', $field)], 400);
                }
            }
            $total = filter_var($payload['totalAmount'] ?? null, FILTER_VALIDATE_INT);
            if ($total === false || $total < 0) return $this->json(['error' => 'totalAmount must be a non-negative integer'], 400);
            if (!isset($payload['items']) || !is_array($payload['items'])) return $this->json(['error' => 'items must be an array'], 400);
            return null;
        }

        private function resolveStatus(int $paid, int $total, string $dueDate): string
        {
            if ($paid >= $total && $total > 0) return 'Payée';
            if ($paid > 0) return 'Partiellement payée';
            if ($dueDate < date('Y-m-d')) return 'En retard';
            return 'En attente';
        }

        private function isPaymentMethodAllowed(string $method): bool
        {
            return in_array($method, ['Mobile Money', 'Virement bancaire', 'Espèces', 'Autre'], true);
        }

        private function createPaymentReceipt(Invoice $invoice, array $payload, int $amount, EntityManagerInterface $entityManager): FinanceReceipt
        {
            $now = date('Y-m-d');
            $newPaidAmount = $invoice->getPaidAmount();
            $event = $entityManager->getRepository(Event::class)->findOneBy([
                'clientName' => $invoice->getClientName(),
                'name' => $invoice->getEventName(),
            ]);
            $receipt = new FinanceReceipt();
            $receipt->setId('rec-'.bin2hex(random_bytes(16)));
            $receipt->setNumber($this->nextReceiptNumber($entityManager));
            $receipt->setDate((string) ($payload['date'] ?? $now));
            $receipt->setClient($invoice->getClientName());
            $receipt->setEvent($event);
            $receipt->setEventName($invoice->getEventName());
            $receipt->setDescription(sprintf('Règlement facture %s', $invoice->getInvoiceNumber()));
            $receipt->setCategory($newPaidAmount >= $invoice->getTotalAmount() ? 'Solde événement' : 'Acompte');
            $receipt->setAmount($amount);
            $receipt->setPaymentMethod((string) ($payload['paymentMethod'] ?? 'Virement bancaire'));
            $receipt->setComment(isset($payload['comment']) ? (string) $payload['comment'] : null);
            return $receipt;
        }

        private function nextInvoiceNumber(EntityManagerInterface $entityManager): string
        {
            $year = date('Y');
            $highest = 0;
            foreach ($entityManager->getRepository(Invoice::class)->findAll() as $invoice) {
                if (preg_match('/^FAC-'.$year.'-(\d+)$/', $invoice->getInvoiceNumber(), $matches)) {
                    $highest = max($highest, (int) $matches[1]);
                }
            }
            return sprintf('FAC-%s-%03d', $year, $highest + 1);
        }

        private function nextReceiptNumber(EntityManagerInterface $entityManager): string
        {
            $year = date('Y');
            $highest = 0;
            foreach ($entityManager->getRepository(FinanceReceipt::class)->findAll() as $receipt) {
                if (preg_match('/^REC-'.$year.'-(\d+)$/', $receipt->getNumber(), $matches)) {
                    $highest = max($highest, (int) $matches[1]);
                }
            }
            return sprintf('REC-%s-%03d', $year, $highest + 1);
        }

        private function serializeReceipt(FinanceReceipt $receipt): array
        {
            return [
                'id' => $receipt->getId(),
                'number' => $receipt->getNumber(),
                'date' => $receipt->getDate(),
                'client' => $receipt->getClient(),
                'eventId' => $receipt->getEventId(),
                'eventName' => $receipt->getEventName() ?? '',
                'description' => $receipt->getDescription(),
                'category' => $receipt->getCategory(),
                'amount' => $receipt->getAmount(),
                'paymentMethod' => $receipt->getPaymentMethod(),
                'comment' => $receipt->getComment() ?? '',
            ];
        }
}
