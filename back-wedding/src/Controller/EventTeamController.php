<?php

namespace App\Controller;

use App\Entity\EventTeam;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class EventTeamController extends AbstractController
{
    #[Route('/event-teams', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        return $this->json(array_map(fn (EventTeam $team) => $this->serialize($team), $em->getRepository(EventTeam::class)->findAll()));
    }

    #[Route('/event-teams', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        if (trim((string) ($data['name'] ?? '')) === '') return $this->json(['error' => 'Le nom de l’équipe est requis.'], 422);
        $team = new EventTeam();
        $team->setId((string) ($data['id'] ?? bin2hex(random_bytes(12))));
        $this->apply($team, $data);
        $em->persist($team);
        $em->flush();
        return $this->json($this->serialize($team), 201);
    }

    #[Route('/event-teams/{id}', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $team = $em->getRepository(EventTeam::class)->find($id);
        if (!$team) return $this->json(['error' => 'Équipe introuvable.'], 404);
        $this->apply($team, json_decode($request->getContent(), true) ?? []);
        $em->flush();
        return $this->json($this->serialize($team));
    }

    #[Route('/event-teams/{id}', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $em): JsonResponse
    {
        $team = $em->getRepository(EventTeam::class)->find($id);
        if (!$team) return $this->json(['error' => 'Équipe introuvable.'], 404);
        $em->remove($team);
        $em->flush();
        return $this->json(['success' => true]);
    }

    private function apply(EventTeam $team, array $data): void
    {
        if (isset($data['name'])) $team->setName((string) $data['name']);
        if (isset($data['description'])) $team->setDescription((string) $data['description']);
        if (isset($data['specialization'])) $team->setSpecialization((string) $data['specialization']);
        if (isset($data['leaderId'])) $team->setLeaderId((string) $data['leaderId']);
        if (isset($data['memberIds'])) $team->setMemberIds((array) $data['memberIds']);
        if (isset($data['assignedEventIds'])) $team->setAssignedEventIds((array) $data['assignedEventIds']);
        if (isset($data['status'])) $team->setStatus((string) $data['status']);
        if (isset($data['color'])) $team->setColor((string) $data['color']);
        if (isset($data['notes'])) $team->setNotes((string) $data['notes']);
    }

    private function serialize(EventTeam $team): array
    {
        return [
            'id' => $team->getId(), 'name' => $team->getName(), 'description' => $team->getDescription(),
            'specialization' => $team->getSpecialization(), 'leaderId' => $team->getLeaderId(), 'memberIds' => $team->getMemberIds(),
            'assignedEventIds' => $team->getAssignedEventIds(), 'status' => $team->getStatus(), 'color' => $team->getColor(), 'notes' => $team->getNotes(),
        ];
    }
}