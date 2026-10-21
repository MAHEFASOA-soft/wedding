<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\PricingPack;
use App\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class EventController extends AbstractController
{

        #[Route('/events', name: 'api_events', methods: ['GET'])]
        public function getEvents(EntityManagerInterface $entityManager): JsonResponse
        {
            $events = $entityManager->getRepository(Event::class)->findBy([], ['date' => 'ASC', 'startTime' => 'ASC']);
    
            return $this->json(array_map(fn (Event $event) => $this->serializeEvent($event), $events));
        }

        #[Route('/events', name: 'api_create_event', methods: ['POST'])]
        public function createEvent(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            $error = $this->validatePayload($payload, $entityManager, true);
            if ($error) return $error;

            $packId = trim((string) ($payload['packId'] ?? ''));
            $pack = $packId !== '' ? $entityManager->getRepository(PricingPack::class)->find($packId) : null;
    
            $event = new Event();
            $event->setId('evt-'.bin2hex(random_bytes(12)));
            $event->setCode($this->generateEventCode($entityManager));
            $event->setName(trim((string) $payload['name']));
            $event->setClientId(trim((string) ($payload['clientId'] ?? '')));
            $event->setClientName(trim((string) $payload['clientName']));
            $event->setClientPhone(trim((string) ($payload['clientPhone'] ?? '')) ?: null);
            $event->setDate((string) $payload['date']);
            $event->setStartTime((string) $payload['startTime']);
            $event->setEndTime((string) $payload['endTime']);
            $event->setLocation(trim((string) $payload['location']));
            $event->setType((string) $payload['type']);
            $event->setPackId($pack?->getId());
            $event->setPackName($pack?->getName());
            $event->setMealType($payload['mealType'] ?? null);
            $event->setIncludedServices($payload['includedServices'] ?? []);
            $event->setGuestCount((int) $payload['guestCount']);
            $event->setTotalPrice((int) $payload['totalPrice']);
            $event->setAmountReceived((int) ($payload['amountReceived'] ?? 0));
            $event->setStatus((string) ($payload['status'] ?? 'Planifié'));
            $event->setCoordinator(trim((string) ($payload['coordinator'] ?? '')) ?: null);
            $event->setAssignedServers($payload['assignedServers'] ?? []);
            $event->setNotes(trim((string) ($payload['notes'] ?? '')) ?: null);
            $event->setImage(isset($payload['image']) ? (string) $payload['image'] : null);
    
            $entityManager->persist($event);
            $entityManager->flush();
    
            return $this->json($this->serializeEvent($event), 201);
        }

        #[Route('/events/{id}', name: 'api_update_event', methods: ['PUT', 'PATCH'])]
        public function updateEvent(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $event = $entityManager->getRepository(Event::class)->find($id);
            if (!$event) {
                return $this->json(['error' => 'Event not found'], 404);
            }
    
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            $error = $this->validatePayload($payload, $entityManager, false);
            if ($error) return $error;

            if (array_key_exists('packId', $payload)) {
                $packId = trim((string) ($payload['packId'] ?? ''));
                $pack = $packId !== '' ? $entityManager->getRepository(PricingPack::class)->find($packId) : null;
                if ($packId !== '' && !$pack) {
                    return $this->json(['error' => 'Le pack sélectionné est introuvable.'], 422);
                }
                $event->setPackId($pack?->getId());
                $event->setPackName($pack?->getName());
            }
            if (isset($payload['name'])) $event->setName(trim((string) $payload['name']));
            if (isset($payload['clientId'])) $event->setClientId((string) $payload['clientId']);
            if (isset($payload['clientName'])) $event->setClientName(trim((string) $payload['clientName']));
            if (array_key_exists('clientPhone', $payload)) $event->setClientPhone($payload['clientPhone'] !== null ? (string) $payload['clientPhone'] : null);
            if (isset($payload['date'])) $event->setDate((string) $payload['date']);
            if (isset($payload['startTime'])) $event->setStartTime((string) $payload['startTime']);
            if (isset($payload['endTime'])) $event->setEndTime((string) $payload['endTime']);
            if (isset($payload['location'])) $event->setLocation(trim((string) $payload['location']));
            if (isset($payload['type'])) $event->setType((string) $payload['type']);
            if (array_key_exists('mealType', $payload)) $event->setMealType($payload['mealType'] !== null ? (string) $payload['mealType'] : null);
            if (array_key_exists('includedServices', $payload)) $event->setIncludedServices((array) $payload['includedServices']);
            if (isset($payload['guestCount'])) $event->setGuestCount((int) $payload['guestCount']);
            if (isset($payload['totalPrice'])) $event->setTotalPrice((int) $payload['totalPrice']);
            if (isset($payload['amountReceived'])) $event->setAmountReceived((int) $payload['amountReceived']);
            if (isset($payload['status'])) $event->setStatus((string) $payload['status']);
            if (array_key_exists('coordinator', $payload)) $event->setCoordinator(trim((string) ($payload['coordinator'] ?? '')) ?: null);
            if (array_key_exists('assignedServers', $payload)) $event->setAssignedServers((array) $payload['assignedServers']);
            if (array_key_exists('notes', $payload)) $event->setNotes(trim((string) ($payload['notes'] ?? '')) ?: null);
            if (array_key_exists('image', $payload)) $event->setImage($payload['image'] !== null ? (string) $payload['image'] : null);
    
            $entityManager->flush();
    
            return $this->json($this->serializeEvent($event));
        }

        #[Route('/events/{id}', name: 'api_delete_event', methods: ['DELETE'])]
        public function deleteEvent(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $event = $entityManager->getRepository(Event::class)->find($id);
            if (!$event) {
                return $this->json(['error' => 'Event not found'], 404);
            }
    
            $entityManager->remove($event);
            $entityManager->flush();
    
            return $this->json(['success' => true]);
        }

        private function serializeEvent(Event $event): array
        {
            return [
                'id' => $event->getId(),
                'code' => $event->getCode(),
                'name' => $event->getName(),
                'clientId' => $event->getClientId(),
                'clientName' => $event->getClientName(),
                'clientPhone' => $event->getClientPhone(),
                'date' => $event->getDate(),
                'startTime' => $event->getStartTime(),
                'endTime' => $event->getEndTime(),
                'location' => $event->getLocation(),
                'type' => $event->getType(),
                'packId' => $event->getPackId(),
                'packName' => $event->getPackName(),
                'mealType' => $event->getMealType(),
                'includedServices' => $event->getIncludedServices(),
                'guestCount' => $event->getGuestCount(),
                'totalPrice' => $event->getTotalPrice(),
                'amountReceived' => $event->getAmountReceived(),
                'status' => $event->getStatus(),
                'coordinator' => $event->getCoordinator(),
                'assignedServers' => $event->getAssignedServers(),
                'notes' => $event->getNotes(),
                'image' => $event->getImage(),
            ];
        }

        private function decodePayload(Request $request): array|JsonResponse
        {
            try {
                $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                return $this->json(['error' => 'Le corps de la requête doit être un JSON valide.'], 400);
            }

            if (!is_array($payload)) return $this->json(['error' => 'Le corps de la requête est invalide.'], 400);

            return $payload;
        }

        private function validatePayload(array $payload, EntityManagerInterface $entityManager, bool $creating): ?JsonResponse
        {
            $required = ['name', 'clientName', 'date', 'startTime', 'endTime', 'location', 'type', 'guestCount', 'totalPrice'];
            foreach ($required as $field) {
                if (($creating || array_key_exists($field, $payload)) && (!isset($payload[$field]) || $payload[$field] === '')) {
                    return $this->json(['error' => 'Le champ '.$field.' est obligatoire.'], 422);
                }
            }

            $limits = ['name' => 255, 'clientName' => 255, 'clientId' => 64, 'location' => 255, 'coordinator' => 255];
            foreach ($limits as $field => $maxLength) {
                if (isset($payload[$field]) && (!is_string($payload[$field]) || mb_strlen(trim($payload[$field])) > $maxLength)) {
                    return $this->json(['error' => 'Le champ '.$field.' est invalide ou trop long.'], 422);
                }
            }

            $types = ['Mariage', 'Fiançailles', 'Anniversaire', 'Cocktail / Réception', 'Gala / Soirée', 'Baptême'];
            if (isset($payload['type']) && !in_array($payload['type'], $types, true)) {
                return $this->json(['error' => 'Le type d’événement sélectionné est invalide.'], 422);
            }

            $statuses = ['Confirmé', 'En cours', 'Planifié', 'Terminé', 'Annulé'];
            if (isset($payload['status']) && !in_array($payload['status'], $statuses, true)) {
                return $this->json(['error' => 'Le statut sélectionné est invalide.'], 422);
            }

            if (isset($payload['date'])) {
                $date = is_string($payload['date']) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $payload['date']) : false;
                $dateErrors = \DateTimeImmutable::getLastErrors();
                if (!$date || ($dateErrors !== false && ($dateErrors['warning_count'] > 0 || $dateErrors['error_count'] > 0)) || $date->format('Y-m-d') !== $payload['date']) {
                    return $this->json(['error' => 'La date doit respecter le format AAAA-MM-JJ.'], 422);
                }
            }
            foreach (['startTime', 'endTime'] as $field) {
                if (isset($payload[$field]) && (!is_string($payload[$field]) || !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $payload[$field]))) {
                    return $this->json(['error' => 'Les horaires doivent respecter le format HH:MM.'], 422);
                }
            }

            foreach (['guestCount', 'totalPrice', 'amountReceived'] as $field) {
                if (isset($payload[$field]) && (filter_var($payload[$field], FILTER_VALIDATE_INT) === false || (int) $payload[$field] < ($field === 'guestCount' ? 1 : 0))) {
                    return $this->json(['error' => 'Le champ '.$field.' doit être un nombre positif valide.'], 422);
                }
            }

            if (isset($payload['clientPhone']) && (!is_string($payload['clientPhone']) || strlen($payload['clientPhone']) > 100)) {
                return $this->json(['error' => 'Le téléphone du client est invalide.'], 422);
            }

            if (isset($payload['mealType']) && !in_array($payload['mealType'], ['Service', 'Semi-buffet', 'Buffet'], true)) {
                return $this->json( ['error' => 'Le type de repas sélectionné est invalide.'], 422);
            }

            if (isset($payload['packId']) && trim((string) $payload['packId']) !== '' && !$entityManager->getRepository(PricingPack::class)->find($payload['packId'])) {
                return $this->json(['error' => 'Le pack sélectionné est introuvable.'], 422);
            }

            if (isset($payload['type']) && $payload['type'] === 'Mariage'
                && $creating && trim((string) ($payload['packId'] ?? '')) === '') {
                return $this->json(['error' => 'Un pack est obligatoire pour un mariage.'], 422);
            }

            if (array_key_exists('includedServices', $payload)) {
                if (!is_array($payload['includedServices'])) {
                    return $this->json(['error' => 'Les services sélectionnés sont invalides.'], 422);
                }
                foreach ($payload['includedServices'] as $serviceId) {
                    if (!is_string($serviceId) || !$entityManager->getRepository(Service::class)->find($serviceId)) {
                        return $this->json(['error' => 'Un service sélectionné est introuvable.'], 422);
                    }
                }
            }

            if (isset($payload['assignedServers']) && (!is_array($payload['assignedServers']) || array_filter($payload['assignedServers'], 'is_string') !== $payload['assignedServers'])) {
                return $this->json(['error' => 'Les membres assignés sont invalides.'], 422);
            }

            return null;
        }

        private function generateEventCode(EntityManagerInterface $entityManager): string
        {
            do {
                $code = 'EVT-'.date('Ymd').'-'.strtoupper(bin2hex(random_bytes(3)));
            } while ($entityManager->getRepository(Event::class)->findOneBy(['code' => $code]));

            return $code;
        }
}
