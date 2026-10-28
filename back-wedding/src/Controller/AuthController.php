<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $this->json(['error' => 'Requête invalide.'], 400);
        }

        if (!is_array($payload)) {
            return $this->json(['error' => 'Requête invalide.'], 400);
        }

        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user || $user->getStatus() !== 'active' || !password_verify($password, $user->getPasswordHash() ?? '')) {
            return $this->json(['error' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user->setLastLogin(new \DateTimeImmutable());
        $entityManager->flush();

        $session = $request->getSession();
        $session->migrate(true);
        $session->set('auth_user_id', $user->getId());

        return $this->json(['user' => $this->serializeUser($user)]);
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $userId = $request->getSession()->get('auth_user_id');
        $user = $userId ? $entityManager->getRepository(User::class)->find($userId) : null;

        if (!$user || $user->getStatus() !== 'active') {
            $request->getSession()->invalidate();
            return $this->json(['error' => 'Session invalide.'], 401);
        }

        return $this->json(['user' => $this->serializeUser($user)]);
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $request->getSession()->invalidate();

        return $this->json(['success' => true]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'lastLogin' => $user->getLastLogin()?->format(DATE_ATOM),
        ];
    }
}