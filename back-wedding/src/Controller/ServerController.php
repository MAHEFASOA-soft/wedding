<?php

namespace App\Controller;

use App\Entity\ServerStaff;
use App\Entity\EmployeeProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ServerController extends AbstractController
{

        #[Route('/servers', name: 'api_servers', methods: ['GET'])]
        public function getServers(EntityManagerInterface $entityManager): JsonResponse
        {
            $servers = $entityManager->getRepository(ServerStaff::class)->findAll();
            return $this->json(array_map(fn (ServerStaff $server) => [
                'id' => $server->getId(),
                'name' => $server->getName(),
                'phone' => $server->getPhone(),
                'role' => $server->getRole(),
                'status' => $server->getStatus(),
                'hourlyRate' => $server->getHourlyRate(),
                'assignedEventsCount' => $server->getAssignedEventsCount(),
                'rating' => $server->getRating(),
                'dailyRate' => $server->getDailyRate(),
                'experience' => $server->getExperience(),
                'avatar' => $server->getAvatar(),
            ], $servers));
        }

        #[Route('/servers', name: 'api_create_server', methods: ['POST'])]
        public function createServer(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $server = new ServerStaff();
            $server->setId($payload['id'] ?? uniqid('srv-', true));
            $server->setName((string) ($payload['name'] ?? ''));
            $server->setPhone((string) ($payload['phone'] ?? ''));
            $server->setRole((string) ($payload['role'] ?? 'Serveur'));
            $server->setStatus((string) ($payload['status'] ?? 'Disponible'));
            $server->setHourlyRate((int) ($payload['hourlyRate'] ?? 0));
            $server->setAssignedEventsCount((int) ($payload['assignedEventsCount'] ?? 0));
            $server->setRating((float) ($payload['rating'] ?? 0));
            $server->setDailyRate(array_key_exists('dailyRate', $payload) ? $payload['dailyRate'] : null);
            $server->setExperience(array_key_exists('experience', $payload) ? $payload['experience'] : null);
            $server->setAvatar(array_key_exists('avatar', $payload) ? $payload['avatar'] : null);
            $entityManager->persist($this->createProfile($server));
            $entityManager->persist($server);
            $entityManager->flush();
            return $this->json($this->serializeServer($server), 201);
        }

        #[Route('/servers/{id}', name: 'api_update_server', methods: ['PUT', 'PATCH'])]
        public function updateServer(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $server = $entityManager->getRepository(ServerStaff::class)->find($id);
            if (!$server) {
                return $this->json(['error' => 'Server not found'], 404);
            }
            $payload = json_decode($request->getContent(), true) ?? [];
            if (isset($payload['name'])) $server->setName((string) $payload['name']);
            if (isset($payload['phone'])) $server->setPhone((string) $payload['phone']);
            if (isset($payload['role'])) $server->setRole((string) $payload['role']);
            if (isset($payload['status'])) $server->setStatus((string) $payload['status']);
            if (isset($payload['hourlyRate'])) $server->setHourlyRate((int) $payload['hourlyRate']);
            if (isset($payload['assignedEventsCount'])) $server->setAssignedEventsCount((int) $payload['assignedEventsCount']);
            if (isset($payload['rating'])) $server->setRating((float) $payload['rating']);
            if (array_key_exists('dailyRate', $payload)) $server->setDailyRate($payload['dailyRate']);
            if (array_key_exists('experience', $payload)) $server->setExperience($payload['experience']);
            if (array_key_exists('avatar', $payload)) $server->setAvatar($payload['avatar'] !== null ? (string) $payload['avatar'] : null);
            $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id) ?? $this->createProfile($server);
            $profile->setDepartment($this->getDepartment($server->getRole()))
                ->setExperience($server->getExperience() ?? '')
                ->setAvailability($this->getAvailability($server->getStatus()));
            $entityManager->persist($profile);
            $entityManager->flush();
            return $this->json($this->serializeServer($server));
        }

        #[Route('/servers/{id}', name: 'api_delete_server', methods: ['DELETE'])]
        public function deleteServer(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $server = $entityManager->getRepository(ServerStaff::class)->find($id);
            if (!$server) {
                return $this->json(['error' => 'Server not found'], 404);
            }
            $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id);
            if ($profile) $entityManager->remove($profile);
            $entityManager->remove($server);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeServer(ServerStaff $server): array
        {
            return [
                'id' => $server->getId(),
                'name' => $server->getName(),
                'phone' => $server->getPhone(),
                'role' => $server->getRole(),
                'status' => $server->getStatus(),
                'hourlyRate' => $server->getHourlyRate(),
                'assignedEventsCount' => $server->getAssignedEventsCount(),
                'rating' => $server->getRating(),
                'dailyRate' => $server->getDailyRate(),
                'experience' => $server->getExperience(),
                'avatar' => $server->getAvatar(),
            ];
        }

        private function createProfile(ServerStaff $server): EmployeeProfile
        {
            return (new EmployeeProfile())
                ->setId($server->getId())
                ->setEmployeeType('Vacation')
                ->setDepartment($this->getDepartment($server->getRole()))
                ->setExperience($server->getExperience() ?? '')
                ->setSkills([])
                ->setHireDate(date('Y-m-d'))
                ->setAvailability($this->getAvailability($server->getStatus()))
                ->setTeamIds([])
                ->setAssignedEventIds([])
                ->setNotes('')
                ->setLanguages([]);
        }

        private function getDepartment(string $role): string
        {
            return match ($role) {
                'Barman' => 'Cocktail & Bar',
                'Hôtesse d’accueil' => 'Accueil & Protocole',
                default => 'Service',
            };
        }

        private function getAvailability(string $status): string
        {
            return match ($status) {
                'Disponible' => 'Disponible',
                'En congé' => 'Indisponible',
                default => 'Affecté',
            };
        }
}
