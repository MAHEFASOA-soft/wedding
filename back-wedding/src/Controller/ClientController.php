<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ClientController extends AbstractController
{

        #[Route('/clients', name: 'api_clients', methods: ['GET'])]
        public function getClients(EntityManagerInterface $entityManager): JsonResponse
        {
            $clients = $entityManager->getRepository(Client::class)->findAll();
            $eventStats = [];
            foreach ($entityManager->getRepository(Event::class)->findAll() as $event) {
                $clientId = $event->getClientId();
                $eventStats[$clientId] ??= ['eventsCount' => 0, 'totalSpent' => 0];
                $eventStats[$clientId]['eventsCount']++;
                $eventStats[$clientId]['totalSpent'] += $event->getTotalPrice();
            }

            return $this->json(array_map(
                fn (Client $client) => $this->serializeClient($client, $eventStats[$client->getId()] ?? []),
                $clients,
            ));
        }

        #[Route('/clients', name: 'api_create_client', methods: ['POST'])]
        public function createClient(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) {
                return $payload;
            }

            $name = trim((string) ($payload['name'] ?? ''));
            if ($name === '') {
                return $this->json(['error' => 'Client name is required'], 400);
            }

            $email = $this->optionalString($payload, 'email');
            if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['error' => 'Invalid email address'], 400);
            }

            $client = new Client();
            $client->setId('cli-'.bin2hex(random_bytes(16)));
            $client->setName($name);
            $client->setPhone($this->optionalString($payload, 'phone'));
            $client->setEmail($email);
            $client->setAddress($this->optionalString($payload, 'address'));
            $client->setNotes($this->optionalString($payload, 'notes'));
            $client->setEventsCount(0);
            $client->setTotalSpent(0);
            $client->setCreatedAt(date('Y-m-d'));

            $entityManager->persist($client);
            $entityManager->flush();

            return $this->json($this->serializeClient($client), 201);
        }

        #[Route('/clients/{id}', name: 'api_update_client', methods: ['PUT', 'PATCH'])]
        public function updateClient(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $client = $entityManager->getRepository(Client::class)->find($id);
            if (!$client) {
                return $this->json(['error' => 'Client not found'], 404);
            }
    
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) {
                return $payload;
            }

            if (array_key_exists('name', $payload)) {
                $name = trim((string) $payload['name']);
                if ($name === '') {
                    return $this->json(['error' => 'Client name is required'], 400);
                }
                $client->setName($name);
            }

            if (array_key_exists('email', $payload)) {
                $email = $this->optionalString($payload, 'email');
                if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return $this->json(['error' => 'Invalid email address'], 400);
                }
                $client->setEmail($email);
            }

            if (array_key_exists('phone', $payload)) $client->setPhone($this->optionalString($payload, 'phone'));
            if (array_key_exists('address', $payload)) $client->setAddress($this->optionalString($payload, 'address'));
            if (array_key_exists('notes', $payload)) $client->setNotes($this->optionalString($payload, 'notes'));

            $clientEvents = $entityManager->getRepository(Event::class)->findBy(['clientId' => $id]);
            foreach ($clientEvents as $event) {
                $event->setClientName($client->getName());
                $event->setClientPhone($client->getPhone());
            }

            $entityManager->flush();

            $totalSpent = array_sum(array_map(fn (Event $event) => $event->getTotalPrice(), $clientEvents));
            return $this->json($this->serializeClient($client, [
                'eventsCount' => count($clientEvents),
                'totalSpent' => $totalSpent,
            ]));
        }

        #[Route('/clients/{id}', name: 'api_delete_client', methods: ['DELETE'])]
        public function deleteClient(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $client = $entityManager->getRepository(Client::class)->find($id);
            if (!$client) {
                return $this->json(['error' => 'Client not found'], 404);
            }

            if ($entityManager->getRepository(Event::class)->count(['clientId' => $id]) > 0) {
                return $this->json(['error' => 'Client has associated events'], 409);
            }

            $entityManager->remove($client);
            $entityManager->flush();

            return $this->json(['success' => true]);
        }

        private function decodePayload(Request $request): array|JsonResponse
        {
            try {
                $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                return $this->json(['error' => 'Invalid JSON payload'], 400);
            }

            return is_array($payload)
                ? $payload
                : $this->json(['error' => 'JSON object is required'], 400);
        }

        private function optionalString(array $payload, string $key): ?string
        {
            if (!isset($payload[$key]) || !is_scalar($payload[$key])) {
                return null;
            }

            $value = trim((string) $payload[$key]);
            return $value !== '' ? $value : null;
        }

        private function serializeClient(Client $client, array $stats = []): array
        {
            return [
                'id' => $client->getId(),
                'name' => $client->getName(),
                'phone' => $client->getPhone() ?? '',
                'email' => $client->getEmail() ?? '',
                'address' => $client->getAddress() ?? '',
                'notes' => $client->getNotes() ?? '',
                'eventsCount' => $stats['eventsCount'] ?? 0,
                'totalSpent' => $stats['totalSpent'] ?? 0,
                'createdAt' => $client->getCreatedAt(),
            ];
        }
}
