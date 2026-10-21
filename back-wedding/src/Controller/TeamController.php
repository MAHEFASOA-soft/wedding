<?php

namespace App\Controller;

use App\Entity\TeamMember;
use App\Entity\EmployeeProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class TeamController extends AbstractController
{

        #[Route('/team', name: 'api_team', methods: ['GET'])]
        public function getTeam(EntityManagerInterface $entityManager): JsonResponse
        {
            $team = $entityManager->getRepository(TeamMember::class)->findAll();
            return $this->json(array_map(fn (TeamMember $member) => [
                'id' => $member->getId(),
                'name' => $member->getName(),
                'role' => $member->getRole(),
                'department' => $member->getDepartment(),
                'phone' => $member->getPhone(),
                'email' => $member->getEmail(),
                'status' => $member->getStatus(),
                'avatar' => $member->getAvatar(),
                'monthlySalary' => $member->getMonthlySalary(),
            ], $team));
        }

        #[Route('/team', name: 'api_create_team', methods: ['POST'])]
        public function createTeamMember(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $member = new TeamMember();
            $member->setId($payload['id'] ?? uniqid('team-', true));
            $member->setName((string) ($payload['name'] ?? ''));
            $member->setRole((string) ($payload['role'] ?? ''));
            $member->setDepartment((string) ($payload['department'] ?? ''));
            $member->setPhone((string) ($payload['phone'] ?? ''));
            $member->setEmail((string) ($payload['email'] ?? ''));
            $member->setStatus((string) ($payload['status'] ?? 'Actif'));
            $member->setAvatar(array_key_exists('avatar', $payload) ? $payload['avatar'] : null);
            $member->setMonthlySalary(array_key_exists('monthlySalary', $payload) ? (int) $payload['monthlySalary'] : null);
            $entityManager->persist($this->createProfile($member));
            $entityManager->persist($member);
            $entityManager->flush();
            return $this->json($this->serializeTeamMember($member), 201);
        }

    #[Route('/team/{id}', name: 'api_update_team', methods: ['PUT', 'PATCH'])]
        public function updateTeamMember(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $member = $entityManager->getRepository(TeamMember::class)->find($id);
            if (!$member) {
                return $this->json(['error' => 'Team member not found'], 404);
            }
    
            $payload = json_decode($request->getContent(), true) ?? [];
    
            if (isset($payload['name'])) $member->setName((string) $payload['name']);
            if (isset($payload['role'])) $member->setRole((string) $payload['role']);
            if (isset($payload['department'])) $member->setDepartment((string) $payload['department']);
            if (isset($payload['phone'])) $member->setPhone((string) $payload['phone']);
            if (isset($payload['email'])) $member->setEmail((string) $payload['email']);
            if (isset($payload['status'])) $member->setStatus((string) $payload['status']);
            if (array_key_exists('avatar', $payload)) $member->setAvatar($payload['avatar']);
            if (array_key_exists('monthlySalary', $payload)) {
                $member->setMonthlySalary($payload['monthlySalary'] !== null ? (int) $payload['monthlySalary'] : null);
            }

            $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id) ?? $this->createProfile($member);
            $profile->setDepartment($member->getDepartment())
                ->setAvailability($member->getStatus() === 'Actif' ? 'Disponible' : 'Affecté');
            $entityManager->persist($profile);
    
            $entityManager->flush();
    
            return $this->json($this->serializeTeamMember($member));
        }

        #[Route('/team/{id}', name: 'api_delete_team', methods: ['DELETE'])]
        public function deleteTeamMember(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $member = $entityManager->getRepository(TeamMember::class)->find($id);
            if (!$member) {
                return $this->json(['error' => 'Team member not found'], 404);
            }
            $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id);
            if ($profile) $entityManager->remove($profile);
            $entityManager->remove($member);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeTeamMember(TeamMember $member): array
        {
            return [
                'id' => $member->getId(),
                'name' => $member->getName(),
                'role' => $member->getRole(),
                'department' => $member->getDepartment(),
                'phone' => $member->getPhone(),
                'email' => $member->getEmail(),
                'status' => $member->getStatus(),
                'avatar' => $member->getAvatar(),
                'monthlySalary' => $member->getMonthlySalary(),
            ];
        }

        private function createProfile(TeamMember $member): EmployeeProfile
        {
            return (new EmployeeProfile())
                ->setId($member->getId())
                ->setEmployeeType('Permanent')
                ->setDepartment($member->getDepartment())
                ->setExperience('')
                ->setSkills([])
                ->setHireDate(date('Y-m-d'))
                ->setAvailability($member->getStatus() === 'Actif' ? 'Disponible' : 'Affecté')
                ->setTeamIds([])
                ->setAssignedEventIds([])
                ->setNotes('')
                ->setLanguages([]);
        }
}
