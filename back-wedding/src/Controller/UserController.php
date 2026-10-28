<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\AccessRole;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class UserController extends AbstractController
{
    private const STATUSES = ['active', 'inactive'];

    #[Route('', name: 'api_users_index', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $users = $entityManager->getRepository(User::class)->findBy([], ['name' => 'ASC']);

        return $this->json(array_map(fn (User $user) => $this->serialize($user), $users));
    }

    #[Route('', name: 'api_users_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) return $payload;

        $error = $this->validatePayload($payload, true, $entityManager);
        if ($error) return $error;

        $email = strtolower(trim((string) $payload['email']));
        if ($entityManager->getRepository(User::class)->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Cette adresse email est déjà utilisée.'], 409);
        }

        $role = $entityManager->getRepository(AccessRole::class)->find((string) ($payload['role'] ?? 'staff'));
        if (!$role) return $this->json(['error' => 'Le rôle sélectionné est invalide.'], 422);

        $user = (new User())
            ->setId('USR-'.strtoupper(bin2hex(random_bytes(6))))
            ->setName(trim((string) $payload['name']))
            ->setEmail($email)
            ->setPhone(trim((string) ($payload['phone'] ?? '')) ?: null)
            ->setAccessRole($role)
            ->setStatus((string) ($payload['status'] ?? 'active'))
            ->setPasswordHash(password_hash((string) $payload['password'], PASSWORD_DEFAULT));

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($this->serialize($user), 201);
    }

    #[Route('/{id}', name: 'api_users_update', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['error' => 'Utilisateur introuvable.'], 404);

        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) return $payload;

        $replace = $request->getMethod() === 'PUT';
        $error = $this->validatePayload($payload, false, $entityManager, $replace);
        if ($error) return $error;

        if (array_key_exists('email', $payload)) {
            $email = strtolower(trim((string) $payload['email']));
            $existing = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
            if ($existing && $existing->getId() !== $user->getId()) {
                return $this->json(['error' => 'Cette adresse email est déjà utilisée.'], 409);
            }
            $user->setEmail($email);
        }
        if (array_key_exists('name', $payload)) $user->setName(trim((string) $payload['name']));
        if (array_key_exists('phone', $payload)) $user->setPhone(trim((string) $payload['phone']) ?: null);
        if (array_key_exists('role', $payload)) {
            $role = $entityManager->getRepository(AccessRole::class)->find((string) $payload['role']);
            if (!$role) return $this->json(['error' => 'Le rôle sélectionné est invalide.'], 422);
            $user->setAccessRole($role);
        }
        if (array_key_exists('status', $payload)) $user->setStatus((string) $payload['status']);
        if (!empty($payload['password'])) {
            $user->setPasswordHash(password_hash((string) $payload['password'], PASSWORD_DEFAULT));
        }

        $entityManager->flush();

        return $this->json($this->serialize($user));
    }

    #[Route('/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) return $this->json(['error' => 'Utilisateur introuvable.'], 404);

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json(['success' => true]);
    }

    private function decodePayload(Request $request): array|JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $this->json(['error' => 'Le corps de la requête doit être un JSON valide.'], 400);
        }

        if (!is_array($payload)) {
            return $this->json(['error' => 'Le corps de la requête est invalide.'], 400);
        }

        return $payload;
    }

    private function validatePayload(array $payload, bool $creating, EntityManagerInterface $entityManager, bool $requireAll = false): ?JsonResponse
    {
        foreach (['name', 'email'] as $field) {
            if (($creating || $requireAll || array_key_exists($field, $payload)) && trim((string) ($payload[$field] ?? '')) === '') {
                return $this->json(['error' => 'Le nom et une adresse email sont requis.'], 422);
            }
        }

        if (isset($payload['name']) && strlen(trim((string) $payload['name'])) > 255) {
            return $this->json(['error' => 'Le nom ne peut pas dépasser 255 caractères.'], 422);
        }
        if (isset($payload['email']) && (!filter_var(trim((string) $payload['email']), FILTER_VALIDATE_EMAIL) || strlen(trim((string) $payload['email'])) > 180)) {
            return $this->json(['error' => 'L’adresse email est invalide.'], 422);
        }
        if (isset($payload['phone']) && strlen(trim((string) $payload['phone'])) > 100) {
            return $this->json(['error' => 'Le téléphone ne peut pas dépasser 100 caractères.'], 422);
        }
        if (isset($payload['role']) && (!is_string($payload['role']) || !$entityManager->getRepository(AccessRole::class)->find($payload['role']))) {
            return $this->json(['error' => 'Le rôle sélectionné est invalide.'], 422);
        }
        if (isset($payload['status']) && !in_array($payload['status'], self::STATUSES, true)) {
            return $this->json(['error' => 'Le statut sélectionné est invalide.'], 422);
        }
        if (($creating || !empty($payload['password'])) && strlen((string) ($payload['password'] ?? '')) < 8) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 8 caractères.'], 422);
        }

        return null;
    }

    private function serialize(User $user): array
    {
        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'phone' => $user->getPhone(),
            'role' => $user->getRole(),
            'status' => $user->getStatus(),
            'lastLogin' => $user->getLastLogin()?->format(DATE_ATOM),
        ];
    }
}