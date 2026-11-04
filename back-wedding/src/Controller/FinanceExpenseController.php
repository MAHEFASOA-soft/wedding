<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\FinanceExpense;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class FinanceExpenseController extends AbstractController
{

        #[Route('/expenses', name: 'api_expenses', methods: ['GET'])]
        public function getExpenses(EntityManagerInterface $entityManager): JsonResponse
        {
            $expenses = $entityManager->getRepository(FinanceExpense::class)->findAll();
            return $this->json(array_map(fn (FinanceExpense $expense) => [
                'id' => $expense->getId(),
                'number' => $expense->getNumber(),
                'date' => $expense->getDate(),
                'category' => $expense->getCategory(),
                'description' => $expense->getDescription(),
                'supplier' => $expense->getSupplier(),
                'eventId' => $expense->getEventId(),
                'eventName' => $expense->getEventName(),
                'amount' => $expense->getAmount(),
                'paymentMethod' => $expense->getPaymentMethod(),
                'comment' => $expense->getComment(),
            ], $expenses));
        }

        #[Route('/expenses', name: 'api_create_expense', methods: ['POST'])]
        public function createExpense(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $event = null;
            if (isset($payload['eventId']) && $payload['eventId'] !== '') {
                $event = is_string($payload['eventId'])
                    ? $entityManager->getRepository(Event::class)->find($payload['eventId'])
                    : null;
                if (!$event) return $this->json(['error' => 'Event not found'], 422);
            }
            $expense = new FinanceExpense();
            $expense->setId($payload['id'] ?? uniqid('exp-', true));
            $expense->setNumber((string) ($payload['number'] ?? 'DEP-'.date('YmdHis')));
            $expense->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $expense->setCategory((string) ($payload['category'] ?? 'Aliments'));
            $expense->setDescription((string) ($payload['description'] ?? ''));
            $expense->setSupplier((string) ($payload['supplier'] ?? ''));
            $expense->setEvent($event);
            $expense->setEventName(array_key_exists('eventName', $payload) ? $payload['eventName'] : null);
            $expense->setAmount((int) ($payload['amount'] ?? 0));
            $expense->setPaymentMethod((string) ($payload['paymentMethod'] ?? 'Virement bancaire'));
            $expense->setComment(array_key_exists('comment', $payload) ? $payload['comment'] : null);
            $entityManager->persist($expense);
            $entityManager->flush();
            return $this->json($this->serializeExpense($expense), 201);
        }

    #[Route('/expenses/{id}', name: 'api_update_expense', methods: ['PUT', 'PATCH'])]
        public function updateExpense(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $expense = $entityManager->getRepository(FinanceExpense::class)->find($id);
            if (!$expense) {
                return $this->json(['error' => 'Expense not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
    
            if (isset($payload['number'])) $expense->setNumber((string) $payload['number']);
            if (isset($payload['date'])) $expense->setDate((string) $payload['date']);
            if (isset($payload['category'])) $expense->setCategory((string) $payload['category']);
            if (isset($payload['description'])) $expense->setDescription((string) $payload['description']);
            if (isset($payload['supplier'])) $expense->setSupplier((string) $payload['supplier']);
            if (array_key_exists('eventId', $payload)) {
                $event = null;
                if ($payload['eventId'] !== null && $payload['eventId'] !== '') {
                    $event = is_string($payload['eventId'])
                        ? $entityManager->getRepository(Event::class)->find($payload['eventId'])
                        : null;
                    if (!$event) return $this->json(['error' => 'Event not found'], 422);
                }
                $expense->setEvent($event);
            }
            if (array_key_exists('eventName', $payload)) $expense->setEventName($payload['eventName']);
            if (isset($payload['amount'])) $expense->setAmount((int) $payload['amount']);
            if (isset($payload['paymentMethod'])) $expense->setPaymentMethod((string) $payload['paymentMethod']);
            if (array_key_exists('comment', $payload)) $expense->setComment($payload['comment']);
    
            $entityManager->flush();
    
            return $this->json($this->serializeExpense($expense));
        }

        #[Route('/expenses/{id}', name: 'api_delete_expense', methods: ['DELETE'])]
        public function deleteExpense(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $expense = $entityManager->getRepository(FinanceExpense::class)->find($id);
            if (!$expense) {
                return $this->json(['error' => 'Expense not found'], 404);
            }
            $entityManager->remove($expense);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeExpense(FinanceExpense $expense): array
        {
            return [
                'id' => $expense->getId(),
                'number' => $expense->getNumber(),
                'date' => $expense->getDate(),
                'category' => $expense->getCategory(),
                'description' => $expense->getDescription(),
                'supplier' => $expense->getSupplier(),
                'eventId' => $expense->getEventId(),
                'eventName' => $expense->getEventName(),
                'amount' => $expense->getAmount(),
                'paymentMethod' => $expense->getPaymentMethod(),
                'comment' => $expense->getComment(),
            ];
        }
}
