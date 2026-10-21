<?php

namespace App\Controller;

use App\Entity\SalaryRecord;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class SalaryController extends AbstractController
{

        #[Route('/salaries', name: 'api_salaries', methods: ['GET'])]
        public function getSalaries(EntityManagerInterface $entityManager): JsonResponse
        {
            $salaries = $entityManager->getRepository(SalaryRecord::class)->findAll();
            return $this->json(array_map(fn (SalaryRecord $salary) => [
                'id' => $salary->getId(),
                'employeeName' => $salary->getEmployeeName(),
                'role' => $salary->getRole(),
                'month' => $salary->getMonth(),
                'baseSalary' => $salary->getBaseSalary(),
                'bonus' => $salary->getBonus(),
                'deduction' => $salary->getDeduction(),
                'netPaid' => $salary->getNetPaid(),
                'paymentDate' => $salary->getPaymentDate(),
                'status' => $salary->getStatus(),
                'comment' => $salary->getComment(),
            ], $salaries));
        }

        #[Route('/salaries', name: 'api_create_salary', methods: ['POST'])]
        public function createSalary(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $salary = new SalaryRecord();
            $salary->setId($payload['id'] ?? uniqid('sal-', true));
            $salary->setEmployeeName((string) ($payload['employeeName'] ?? ''));
            $salary->setRole((string) ($payload['role'] ?? ''));
            $salary->setMonth((string) ($payload['month'] ?? ''));
            $salary->setBaseSalary((int) ($payload['baseSalary'] ?? 0));
            $salary->setBonus((int) ($payload['bonus'] ?? 0));
            $salary->setDeduction((int) ($payload['deduction'] ?? 0));
            $salary->setNetPaid((int) ($payload['netPaid'] ?? 0));
            $salary->setPaymentDate((string) ($payload['paymentDate'] ?? date('Y-m-d')));
            $salary->setStatus((string) ($payload['status'] ?? 'À payer'));
            $salary->setComment(array_key_exists('comment', $payload) ? $payload['comment'] : null);
            $entityManager->persist($salary);
            $entityManager->flush();
            return $this->json($this->serializeSalary($salary), 201);
        }

        #[Route('/salaries/{id}', name: 'api_update_salary', methods: ['PUT', 'PATCH'])]
        public function updateSalary(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $salary = $entityManager->getRepository(SalaryRecord::class)->find($id);
            if (!$salary) {
                return $this->json(['error' => 'Salary record not found'], 404);
            }
            $payload = json_decode($request->getContent(), true) ?? [];
            if (isset($payload['employeeName'])) $salary->setEmployeeName((string) $payload['employeeName']);
            if (isset($payload['role'])) $salary->setRole((string) $payload['role']);
            if (isset($payload['month'])) $salary->setMonth((string) $payload['month']);
            if (isset($payload['baseSalary'])) $salary->setBaseSalary((int) $payload['baseSalary']);
            if (isset($payload['bonus'])) $salary->setBonus((int) $payload['bonus']);
            if (isset($payload['deduction'])) $salary->setDeduction((int) $payload['deduction']);
            if (isset($payload['netPaid'])) $salary->setNetPaid((int) $payload['netPaid']);
            if (isset($payload['paymentDate'])) $salary->setPaymentDate((string) $payload['paymentDate']);
            if (isset($payload['status'])) $salary->setStatus((string) $payload['status']);
            if (array_key_exists('comment', $payload)) $salary->setComment($payload['comment']);
            $entityManager->flush();
            return $this->json($this->serializeSalary($salary));
        }

        #[Route('/salaries/{id}', name: 'api_delete_salary', methods: ['DELETE'])]
        public function deleteSalary(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $salary = $entityManager->getRepository(SalaryRecord::class)->find($id);
            if (!$salary) {
                return $this->json(['error' => 'Salary record not found'], 404);
            }
            $entityManager->remove($salary);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeSalary(SalaryRecord $salary): array
        {
            return [
                'id' => $salary->getId(),
                'employeeName' => $salary->getEmployeeName(),
                'role' => $salary->getRole(),
                'month' => $salary->getMonth(),
                'baseSalary' => $salary->getBaseSalary(),
                'bonus' => $salary->getBonus(),
                'deduction' => $salary->getDeduction(),
                'netPaid' => $salary->getNetPaid(),
                'paymentDate' => $salary->getPaymentDate(),
                'status' => $salary->getStatus(),
                'comment' => $salary->getComment(),
            ];
        }
}
