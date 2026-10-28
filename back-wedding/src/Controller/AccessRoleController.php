<?php

namespace App\Controller;

use App\Entity\AccessRole;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/roles')]
class AccessRoleController extends AbstractController
{
    private const MODULES = [
        'dashboard', 'events', 'clients', 'services', 'pricing', 'tasks', 'quotes',
        'invoices', 'payments', 'finances', 'planning', 'team', 'statistics', 'users', 'settings',
    ];
    private const COLORS = ['amber', 'blue', 'emerald', 'violet', 'slate'];

    #[Route('', name: 'api_roles_index', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $roles = $entityManager->getRepository(AccessRole::class)->findBy([], ['system' => 'DESC', 'name' => 'ASC']);

        return $this->json(array_map(fn (AccessRole $role) => $this->serialize($role), $roles));
    }

    #[Route('', name: 'api_roles_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) return $payload;

        $error = $this->validate($payload, true);
        if ($error) return $error;

        $name = trim((string) $payload['name']);
        if ($entityManager->getRepository(AccessRole::class)->findOneBy(['name' => $name])) {
            return $this->json(['error' => 'Un rôle portant ce nom existe déjà.'], 409);
        }

        $permissions = $this->normalizePermissions($payload['permissions'] ?? []);
        if ($permissions instanceof JsonResponse) return $permissions;

        $role = (new AccessRole())
            ->setId('role-'.strtoupper(bin2hex(random_bytes(8))))
            ->setName($name)
            ->setDescription(trim((string) ($payload['description'] ?? '')))
            ->setColor((string) ($payload['color'] ?? 'slate'))
            ->setSystem(false)
            ->setPermissions($permissions);

        $entityManager->persist($role);
        $entityManager->flush();

        return $this->json($this->serialize($role), 201);
    }

    #[Route('/{id}', name: 'api_roles_update', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $role = $entityManager->getRepository(AccessRole::class)->find($id);
        if (!$role) return $this->json(['error' => 'Rôle introuvable.'], 404);

        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) return $payload;

        $error = $this->validate($payload, false);
        if ($error) return $error;

        if (array_key_exists('name', $payload)) {
            $name = trim((string) $payload['name']);
            $existing = $entityManager->getRepository(AccessRole::class)->findOneBy(['name' => $name]);
            if ($existing && $existing->getId() !== $role->getId()) {
                return $this->json(['error' => 'Un rôle portant ce nom existe déjà.'], 409);
            }
            $role->setName($name);
        }
        if (array_key_exists('description', $payload)) $role->setDescription(trim((string) $payload['description']));
        if (array_key_exists('color', $payload)) $role->setColor((string) $payload['color']);
        if (array_key_exists('permissions', $payload)) {
            $permissions = $this->normalizePermissions($payload['permissions']);
            if ($permissions instanceof JsonResponse) return $permissions;
            $role->setPermissions($permissions);
        }

        $entityManager->flush();

        return $this->json($this->serialize($role));
    }

    #[Route('/{id}', name: 'api_roles_delete', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $role = $entityManager->getRepository(AccessRole::class)->find($id);
        if (!$role) return $this->json(['error' => 'Rôle introuvable.'], 404);
        if ($role->isSystem()) return $this->json(['error' => 'Un rôle système ne peut pas être supprimé.'], 409);

        if ($entityManager->getRepository(User::class)->findOneBy(['accessRole' => $role])) {
            return $this->json(['error' => 'Ce rôle est attribué à des utilisateurs et ne peut pas être supprimé.'], 409);
        }

        $entityManager->remove($role);
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

        if (!is_array($payload)) return $this->json(['error' => 'Le corps de la requête est invalide.'], 400);

        return $payload;
    }

    private function validate(array $payload, bool $creating): ?JsonResponse
    {
        if (($creating || array_key_exists('name', $payload)) && trim((string) ($payload['name'] ?? '')) === '') {
            return $this->json(['error' => 'Le nom du rôle est requis.'], 422);
        }
        if (isset($payload['name']) && strlen(trim((string) $payload['name'])) > 120) {
            return $this->json(['error' => 'Le nom ne peut pas dépasser 120 caractères.'], 422);
        }
        if (isset($payload['description']) && strlen((string) $payload['description']) > 10000) {
            return $this->json(['error' => 'La description est trop longue.'], 422);
        }
        if (isset($payload['color']) && !in_array($payload['color'], self::COLORS, true)) {
            return $this->json(['error' => 'La couleur sélectionnée est invalide.'], 422);
        }

        return null;
    }

    private function normalizePermissions(mixed $input): array|JsonResponse
    {
        if (!is_array($input)) return $this->json(['error' => 'Les permissions doivent être un objet.'], 422);

        $permissions = [];
        foreach (self::MODULES as $module) {
            $modulePermissions = $input[$module] ?? [];
            if (!is_array($modulePermissions)) {
                return $this->json(['error' => 'Les permissions du module '.$module.' sont invalides.'], 422);
            }
            $permissions[$module] = [];
            foreach (['view', 'create', 'edit', 'delete'] as $action) {
                $value = $modulePermissions[$action] ?? false;
                if (!is_bool($value)) {
                    return $this->json(['error' => 'Chaque permission doit être un booléen.'], 422);
                }
                $permissions[$module][$action] = $value;
            }
        }

        foreach (array_keys($input) as $module) {
            if (!in_array($module, self::MODULES, true)) {
                return $this->json(['error' => 'Le module '.$module.' est inconnu.'], 422);
            }
        }

        return $permissions;
    }

    private function serialize(AccessRole $role): array
    {
        return [
            'id' => $role->getId(),
            'name' => $role->getName(),
            'description' => $role->getDescription(),
            'color' => $role->getColor(),
            'system' => $role->isSystem(),
            'permissions' => $role->getPermissions(),
        ];
    }
}