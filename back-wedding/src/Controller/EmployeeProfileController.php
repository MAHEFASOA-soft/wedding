<?php

namespace App\Controller;

use App\Entity\EmployeeProfile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/employee-profiles')]
class EmployeeProfileController extends AbstractController
{
    #[Route('', name: 'api_employee_profiles', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $profiles = $entityManager->getRepository(EmployeeProfile::class)->findAll();
        return $this->json(array_map(fn (EmployeeProfile $profile) => $this->serialize($profile), $profiles));
    }

    #[Route('', name: 'api_create_employee_profile', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $payload = json_decode($request->getContent(), true) ?? [];
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') return $this->json(['error' => 'Un identifiant de personnel est requis.'], 422);
        if ($entityManager->getRepository(EmployeeProfile::class)->find($id)) {
            return $this->json(['error' => 'Ce profil existe déjà.'], 409);
        }

        $profile = new EmployeeProfile();
        $profile->setId($id);
        $this->apply($profile, $payload);
        $entityManager->persist($profile);
        $entityManager->flush();
        return $this->json($this->serialize($profile), 201);
    }

    #[Route('/{id}', name: 'api_update_employee_profile', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id);
        $created = false;
        if (!$profile) {
            $profile = new EmployeeProfile();
            $profile->setId($id);
            $entityManager->persist($profile);
            $created = true;
        }
        $this->apply($profile, json_decode($request->getContent(), true) ?? []);
        $entityManager->flush();
        return $this->json($this->serialize($profile), $created ? 201 : 200);
    }

    #[Route('/{id}', name: 'api_delete_employee_profile', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $profile = $entityManager->getRepository(EmployeeProfile::class)->find($id);
        if (!$profile) return $this->json(['error' => 'Profil introuvable.'], 404);
        $entityManager->remove($profile);
        $entityManager->flush();
        return $this->json(['success' => true]);
    }

    private function apply(EmployeeProfile $profile, array $payload): void
    {
        if (isset($payload['employeeType'])) $profile->setEmployeeType((string) $payload['employeeType']);
        if (isset($payload['department'])) $profile->setDepartment((string) $payload['department']);
        if (isset($payload['experience'])) $profile->setExperience((string) $payload['experience']);
        if (isset($payload['skills'])) $profile->setSkills((array) $payload['skills']);
        if (isset($payload['hireDate'])) $profile->setHireDate((string) $payload['hireDate']);
        if (isset($payload['availability'])) $profile->setAvailability((string) $payload['availability']);
        if (isset($payload['teamIds'])) $profile->setTeamIds((array) $payload['teamIds']);
        if (isset($payload['assignedEventIds'])) $profile->setAssignedEventIds((array) $payload['assignedEventIds']);
        if (isset($payload['notes'])) $profile->setNotes((string) $payload['notes']);
        if (isset($payload['languages'])) $profile->setLanguages((array) $payload['languages']);
        if (array_key_exists('emergencyContact', $payload)) {
            $profile->setEmergencyContact($payload['emergencyContact'] !== null ? (string) $payload['emergencyContact'] : null);
        }
    }

    private function serialize(EmployeeProfile $profile): array
    {
        return [
            'id' => $profile->getId(),
            'employeeType' => $profile->getEmployeeType(),
            'department' => $profile->getDepartment(),
            'experience' => $profile->getExperience(),
            'skills' => $profile->getSkills(),
            'hireDate' => $profile->getHireDate(),
            'availability' => $profile->getAvailability(),
            'teamIds' => $profile->getTeamIds(),
            'assignedEventIds' => $profile->getAssignedEventIds(),
            'notes' => $profile->getNotes(),
            'languages' => $profile->getLanguages(),
            'emergencyContact' => $profile->getEmergencyContact(),
        ];
    }
}