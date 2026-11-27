<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class HealthController extends AbstractController
{

        #[Route('/health', name: 'api_health', methods: ['GET'])]
        public function health(): JsonResponse
        {
            return $this->json([
                'status' => 'ok',
                'app' => 'efficiency-wedding',
                'environment' => $this->getParameter('kernel.environment'),
            ]);
        }
}
