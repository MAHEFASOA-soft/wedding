<?php

namespace App\Controller;

use App\Entity\Reservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ReservationController extends AbstractController
{

        #[Route('/reservations', name: 'api_reservations', methods: ['GET'])]
        public function getReservations(EntityManagerInterface $entityManager): JsonResponse
        {
            $reservations = $entityManager->getRepository(Reservation::class)->findAll();
    
            return $this->json(array_map(fn (Reservation $reservation) => [
                'id' => $reservation->getId(),
                'code' => $reservation->getCode(),
                'clientName' => $reservation->getClientName(),
                'eventType' => $reservation->getEventType(),
                'requestedDate' => $reservation->getRequestedDate(),
                'guestCount' => $reservation->getGuestCount(),
                'estimatedBudget' => $reservation->getEstimatedBudget(),
                'contactPhone' => $reservation->getContactPhone(),
                'contactEmail' => $reservation->getContactEmail(),
                'status' => $reservation->getStatus(),
                'notes' => $reservation->getNotes(),
                'createdAt' => $reservation->getCreatedAt(),
            ], $reservations));
        }

        #[Route('/reservations', name: 'api_create_reservation', methods: ['POST'])]
        public function createReservation(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
    
            $reservation = new Reservation();
            $reservation->setId($payload['id'] ?? uniqid('res-', true));
            $reservation->setCode((string) ($payload['code'] ?? 'RES-'.date('YmdHis')));
            $reservation->setClientName((string) ($payload['clientName'] ?? ''));
            $reservation->setEventType((string) ($payload['eventType'] ?? 'Mariage'));
            $reservation->setRequestedDate((string) ($payload['requestedDate'] ?? date('Y-m-d')));
            $reservation->setGuestCount((int) ($payload['guestCount'] ?? 0));
            $reservation->setEstimatedBudget((int) ($payload['estimatedBudget'] ?? 0));
            $reservation->setContactPhone((string) ($payload['contactPhone'] ?? ''));
            $reservation->setContactEmail((string) ($payload['contactEmail'] ?? ''));
            $reservation->setStatus((string) ($payload['status'] ?? 'En attente'));
            $reservation->setNotes(array_key_exists('notes', $payload) && $payload['notes'] !== null ? (string) $payload['notes'] : null);
            $reservation->setCreatedAt((string) ($payload['createdAt'] ?? date('Y-m-d')));
    
            $entityManager->persist($reservation);
            $entityManager->flush();
    
            return $this->json([
                'id' => $reservation->getId(),
                'code' => $reservation->getCode(),
                'clientName' => $reservation->getClientName(),
                'eventType' => $reservation->getEventType(),
                'requestedDate' => $reservation->getRequestedDate(),
                'guestCount' => $reservation->getGuestCount(),
                'estimatedBudget' => $reservation->getEstimatedBudget(),
                'contactPhone' => $reservation->getContactPhone(),
                'contactEmail' => $reservation->getContactEmail(),
                'status' => $reservation->getStatus(),
                'notes' => $reservation->getNotes(),
                'createdAt' => $reservation->getCreatedAt(),
            ], 201);
        }

        #[Route('/reservations/{id}', name: 'api_update_reservation', methods: ['PUT', 'PATCH'])]
        public function updateReservation(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $reservation = $entityManager->getRepository(Reservation::class)->find($id);
            if (!$reservation) {
                return $this->json(['error' => 'Reservation not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
            if (isset($payload['code'])) $reservation->setCode((string) $payload['code']);
            if (isset($payload['clientName'])) $reservation->setClientName((string) $payload['clientName']);
            if (isset($payload['eventType'])) $reservation->setEventType((string) $payload['eventType']);
            if (isset($payload['requestedDate'])) $reservation->setRequestedDate((string) $payload['requestedDate']);
            if (isset($payload['guestCount'])) $reservation->setGuestCount((int) $payload['guestCount']);
            if (isset($payload['estimatedBudget'])) $reservation->setEstimatedBudget((int) $payload['estimatedBudget']);
            if (isset($payload['contactPhone'])) $reservation->setContactPhone((string) $payload['contactPhone']);
            if (isset($payload['contactEmail'])) $reservation->setContactEmail((string) $payload['contactEmail']);
            if (isset($payload['status'])) $reservation->setStatus((string) $payload['status']);
            if (array_key_exists('notes', $payload)) $reservation->setNotes($payload['notes'] !== null ? (string) $payload['notes'] : null);
            if (isset($payload['createdAt'])) $reservation->setCreatedAt((string) $payload['createdAt']);
    
            $entityManager->flush();
    
            return $this->json([
                'id' => $reservation->getId(),
                'code' => $reservation->getCode(),
                'clientName' => $reservation->getClientName(),
                'eventType' => $reservation->getEventType(),
                'requestedDate' => $reservation->getRequestedDate(),
                'guestCount' => $reservation->getGuestCount(),
                'estimatedBudget' => $reservation->getEstimatedBudget(),
                'contactPhone' => $reservation->getContactPhone(),
                'contactEmail' => $reservation->getContactEmail(),
                'status' => $reservation->getStatus(),
                'notes' => $reservation->getNotes(),
                'createdAt' => $reservation->getCreatedAt(),
            ]);
        }

        #[Route('/reservations/{id}', name: 'api_delete_reservation', methods: ['DELETE'])]
        public function deleteReservation(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $reservation = $entityManager->getRepository(Reservation::class)->find($id);
            if (!$reservation) {
                return $this->json(['error' => 'Reservation not found'], 404);
            }
    
            $entityManager->remove($reservation);
            $entityManager->flush();
    
            return $this->json(['success' => true]);
        }
}
