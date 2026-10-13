<?php

namespace App\Controller;

use App\Entity\Appointment;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AppointmentController extends AbstractController
{

        #[Route('/appointments', name: 'api_appointments', methods: ['GET'])]
        public function getAppointments(EntityManagerInterface $entityManager): JsonResponse
        {
            $appointments = $entityManager->getRepository(Appointment::class)->findAll();
    
            return $this->json(array_map(fn (Appointment $appointment) => [
                'id' => $appointment->getId(),
                'clientName' => $appointment->getClientName(),
                'clientPhone' => $appointment->getClientPhone(),
                'date' => $appointment->getDate(),
                'time' => $appointment->getTime(),
                'purpose' => $appointment->getPurpose(),
                'location' => $appointment->getLocation(),
                'status' => $appointment->getStatus(),
                'notes' => $appointment->getNotes(),
            ], $appointments));
        }

        #[Route('/appointments', name: 'api_create_appointment', methods: ['POST'])]
        public function createAppointment(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
    
            $appointment = new Appointment();
            $appointment->setId($payload['id'] ?? uniqid('apt-', true));
            $appointment->setClientName((string) ($payload['clientName'] ?? ''));
            $appointment->setClientPhone((string) ($payload['clientPhone'] ?? ''));
            $appointment->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $appointment->setTime((string) ($payload['time'] ?? '09:00'));
            $appointment->setPurpose((string) ($payload['purpose'] ?? 'Première consultation'));
            $appointment->setLocation((string) ($payload['location'] ?? ''));
            $appointment->setStatus((string) ($payload['status'] ?? 'À venir'));
            $appointment->setNotes(array_key_exists('notes', $payload) && $payload['notes'] !== null ? (string) $payload['notes'] : null);
    
            $entityManager->persist($appointment);
            $entityManager->flush();
    
            return $this->json([
                'id' => $appointment->getId(),
                'clientName' => $appointment->getClientName(),
                'clientPhone' => $appointment->getClientPhone(),
                'date' => $appointment->getDate(),
                'time' => $appointment->getTime(),
                'purpose' => $appointment->getPurpose(),
                'location' => $appointment->getLocation(),
                'status' => $appointment->getStatus(),
                'notes' => $appointment->getNotes(),
            ], 201);
        }

        #[Route('/appointments/{id}', name: 'api_update_appointment', methods: ['PUT', 'PATCH'])]
        public function updateAppointment(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $appointment = $entityManager->getRepository(Appointment::class)->find($id);
            if (!$appointment) {
                return $this->json(['error' => 'Appointment not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
            if (isset($payload['clientName'])) $appointment->setClientName((string) $payload['clientName']);
            if (isset($payload['clientPhone'])) $appointment->setClientPhone((string) $payload['clientPhone']);
            if (isset($payload['date'])) $appointment->setDate((string) $payload['date']);
            if (isset($payload['time'])) $appointment->setTime((string) $payload['time']);
            if (isset($payload['purpose'])) $appointment->setPurpose((string) $payload['purpose']);
            if (isset($payload['location'])) $appointment->setLocation((string) $payload['location']);
            if (isset($payload['status'])) $appointment->setStatus((string) $payload['status']);
            if (array_key_exists('notes', $payload)) $appointment->setNotes($payload['notes'] !== null ? (string) $payload['notes'] : null);
    
            $entityManager->flush();
    
            return $this->json([
                'id' => $appointment->getId(),
                'clientName' => $appointment->getClientName(),
                'clientPhone' => $appointment->getClientPhone(),
                'date' => $appointment->getDate(),
                'time' => $appointment->getTime(),
                'purpose' => $appointment->getPurpose(),
                'location' => $appointment->getLocation(),
                'status' => $appointment->getStatus(),
                'notes' => $appointment->getNotes(),
            ]);
        }

        #[Route('/appointments/{id}', name: 'api_delete_appointment', methods: ['DELETE'])]
        public function deleteAppointment(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $appointment = $entityManager->getRepository(Appointment::class)->find($id);
            if (!$appointment) {
                return $this->json(['error' => 'Appointment not found'], 404);
            }
    
            $entityManager->remove($appointment);
            $entityManager->flush();
    
            return $this->json(['success' => true]);
        }
}
