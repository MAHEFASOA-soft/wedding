<?php

namespace App\Controller;

use App\Entity\FinanceReceipt;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class FinanceReceiptController extends AbstractController
{

        #[Route('/receipts', name: 'api_receipts', methods: ['GET'])]
        public function getReceipts(EntityManagerInterface $entityManager): JsonResponse
        {
            $receipts = $entityManager->getRepository(FinanceReceipt::class)->findAll();
            return $this->json(array_map(fn (FinanceReceipt $receipt) => [
                'id' => $receipt->getId(),
                'number' => $receipt->getNumber(),
                'date' => $receipt->getDate(),
                'client' => $receipt->getClient(),
                'eventId' => $receipt->getEventId(),
                'eventName' => $receipt->getEventName(),
                'description' => $receipt->getDescription(),
                'category' => $receipt->getCategory(),
                'amount' => $receipt->getAmount(),
                'paymentMethod' => $receipt->getPaymentMethod(),
                'comment' => $receipt->getComment(),
            ], $receipts));
        }

        #[Route('/receipts', name: 'api_create_receipt', methods: ['POST'])]
        public function createReceipt(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $receipt = new FinanceReceipt();
            $receipt->setId($payload['id'] ?? uniqid('rec-', true));
            $receipt->setNumber((string) ($payload['number'] ?? 'REC-'.date('YmdHis')));
            $receipt->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $receipt->setClient((string) ($payload['client'] ?? ''));
            $receipt->setEventId(array_key_exists('eventId', $payload) ? $payload['eventId'] : null);
            $receipt->setEventName(array_key_exists('eventName', $payload) ? $payload['eventName'] : null);
            $receipt->setDescription((string) ($payload['description'] ?? ''));
            $receipt->setCategory((string) ($payload['category'] ?? 'Paiement événement'));
            $receipt->setAmount((int) ($payload['amount'] ?? 0));
            $receipt->setPaymentMethod((string) ($payload['paymentMethod'] ?? 'Virement bancaire'));
            $receipt->setComment(array_key_exists('comment', $payload) ? $payload['comment'] : null);
            $entityManager->persist($receipt);
            $entityManager->flush();
            return $this->json($this->serializeReceipt($receipt), 201);
        }

    #[Route('/receipts/{id}', name: 'api_update_receipt', methods: ['PUT', 'PATCH'])]
        public function updateReceipt(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $receipt = $entityManager->getRepository(FinanceReceipt::class)->find($id);
            if (!$receipt) {
                return $this->json(['error' => 'Receipt not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
    
            if (isset($payload['number'])) $receipt->setNumber((string) $payload['number']);
            if (isset($payload['date'])) $receipt->setDate((string) $payload['date']);
            if (isset($payload['client'])) $receipt->setClient((string) $payload['client']);
            if (array_key_exists('eventId', $payload)) $receipt->setEventId($payload['eventId']);
            if (array_key_exists('eventName', $payload)) $receipt->setEventName($payload['eventName']);
            if (isset($payload['description'])) $receipt->setDescription((string) $payload['description']);
            if (isset($payload['category'])) $receipt->setCategory((string) $payload['category']);
            if (isset($payload['amount'])) $receipt->setAmount((int) $payload['amount']);
            if (isset($payload['paymentMethod'])) $receipt->setPaymentMethod((string) $payload['paymentMethod']);
            if (array_key_exists('comment', $payload)) $receipt->setComment($payload['comment']);
    
            $entityManager->flush();
    
            return $this->json($this->serializeReceipt($receipt));
        }

        #[Route('/receipts/{id}', name: 'api_delete_receipt', methods: ['DELETE'])]
        public function deleteReceipt(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $receipt = $entityManager->getRepository(FinanceReceipt::class)->find($id);
            if (!$receipt) {
                return $this->json(['error' => 'Receipt not found'], 404);
            }
            $entityManager->remove($receipt);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeReceipt(FinanceReceipt $receipt): array
        {
            return [
                'id' => $receipt->getId(),
                'number' => $receipt->getNumber(),
                'date' => $receipt->getDate(),
                'client' => $receipt->getClient(),
                'eventId' => $receipt->getEventId(),
                'eventName' => $receipt->getEventName(),
                'description' => $receipt->getDescription(),
                'category' => $receipt->getCategory(),
                'amount' => $receipt->getAmount(),
                'paymentMethod' => $receipt->getPaymentMethod(),
                'comment' => $receipt->getComment(),
            ];
        }
}
