<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class RequireApiSessionSubscriber implements EventSubscriberInterface
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 8]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $path = $request->getPathInfo();

        if (!$event->isMainRequest() || !str_starts_with($path, '/api/') || $request->isMethod('OPTIONS')) {
            return;
        }

        if (in_array($path, ['/api/auth/login', '/api/auth/me', '/api/auth/logout'], true)) {
            return;
        }

        $userId = $request->getSession()->get('auth_user_id');
        $user = $userId ? $this->entityManager->getRepository(User::class)->find($userId) : null;

        if (!$user || $user->getStatus() !== 'active') {
            $event->setResponse(new JsonResponse(['error' => 'Authentification requise.'], 401));
        }
    }
}