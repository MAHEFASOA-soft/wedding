<?php

namespace App\Controller;

use App\Entity\EquipmentItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class EquipmentController extends AbstractController
{

        #[Route('/equipment', name: 'api_equipment', methods: ['GET'])]
        public function getEquipment(EntityManagerInterface $entityManager): JsonResponse
        {
            $equipment = $entityManager->getRepository(EquipmentItem::class)->findAll();
            return $this->json(array_map(fn (EquipmentItem $item) => [
                'id' => $item->getId(),
                'name' => $item->getName(),
                'category' => $item->getCategory(),
                'quantity' => $item->getQuantity(),
                'availableQuantity' => $item->getAvailableQuantity(),
                'condition' => $item->getCondition(),
                'unitPrice' => $item->getUnitPrice(),
                'location' => $item->getLocation(),
            ], $equipment));
        }

        #[Route('/equipment', name: 'api_create_equipment', methods: ['POST'])]
        public function createEquipment(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $item = new EquipmentItem();
            $item->setId($payload['id'] ?? uniqid('equipment-', true));
            $item->setName((string) ($payload['name'] ?? ''));
            $item->setCategory((string) ($payload['category'] ?? ''));
            $item->setQuantity((int) ($payload['quantity'] ?? 0));
            $item->setAvailableQuantity((int) ($payload['availableQuantity'] ?? 0));
            $item->setCondition((string) ($payload['condition'] ?? 'Excellent'));
            $item->setUnitPrice((int) ($payload['unitPrice'] ?? 0));
            $item->setLocation((string) ($payload['location'] ?? ''));
            $entityManager->persist($item);
            $entityManager->flush();
            return $this->json($this->serializeEquipment($item), 201);
        }

    #[Route('/equipment/{id}', name: 'api_update_equipment', methods: ['PUT', 'PATCH'])]
        public function updateEquipment(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $item = $entityManager->getRepository(EquipmentItem::class)->find($id);
            if (!$item) {
                return $this->json(['error' => 'Equipment not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
    
            if (isset($payload['name'])) $item->setName((string) $payload['name']);
            if (isset($payload['category'])) $item->setCategory((string) $payload['category']);
            if (isset($payload['quantity'])) $item->setQuantity((int) $payload['quantity']);
            if (isset($payload['availableQuantity'])) $item->setAvailableQuantity((int) $payload['availableQuantity']);
            if (isset($payload['condition'])) $item->setCondition((string) $payload['condition']);
            if (isset($payload['unitPrice'])) $item->setUnitPrice((int) $payload['unitPrice']);
            if (isset($payload['location'])) $item->setLocation((string) $payload['location']);
    
            $entityManager->flush();
    
            return $this->json($this->serializeEquipment($item));
        }

        #[Route('/equipment/{id}', name: 'api_delete_equipment', methods: ['DELETE'])]
        public function deleteEquipment(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $item = $entityManager->getRepository(EquipmentItem::class)->find($id);
            if (!$item) {
                return $this->json(['error' => 'Equipment not found'], 404);
            }
            $entityManager->remove($item);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeEquipment(EquipmentItem $item): array
        {
            return [
                'id' => $item->getId(),
                'name' => $item->getName(),
                'category' => $item->getCategory(),
                'quantity' => $item->getQuantity(),
                'availableQuantity' => $item->getAvailableQuantity(),
                'condition' => $item->getCondition(),
                'unitPrice' => $item->getUnitPrice(),
                'location' => $item->getLocation(),
            ];
        }
}
