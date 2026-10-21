<?php

namespace App\Controller;

use App\Entity\Service;
use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ServiceController extends AbstractController
{

        #[Route('/services', name: 'api_services', methods: ['GET'])]
        public function getServices(EntityManagerInterface $entityManager): JsonResponse
        {
            $services = $entityManager->getRepository(Service::class)->findAll();

            return $this->json(array_map(fn (Service $service) => $this->serializeService($service), $services));
        }

        #[Route('/services', name: 'api_create_service', methods: ['POST'])]
        public function createService(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) {
                return $payload;
            }

            $data = $this->normalizePayload($payload);
            if ($data instanceof JsonResponse) {
                return $data;
            }

            $service = new Service();
            $service->setId('srv-'.bin2hex(random_bytes(16)));
            $this->applyPayload($service, $data);

            $entityManager->persist($service);
            $entityManager->flush();

            return $this->json($this->serializeService($service), 201);
        }

        #[Route('/services/{id}', name: 'api_update_service', methods: ['PUT', 'PATCH'])]
        public function updateService(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $service = $entityManager->getRepository(Service::class)->find($id);
            if (!$service) {
                return $this->json(['error' => 'Service not found'], 404);
            }
    
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) {
                return $payload;
            }

            $data = $this->normalizePayload($payload, true);
            if ($data instanceof JsonResponse) {
                return $data;
            }
            $this->applyPayload($service, $data);

            $entityManager->flush();

            return $this->json($this->serializeService($service));
        }

        #[Route('/services/{id}', name: 'api_delete_service', methods: ['DELETE'])]
        public function deleteService(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $service = $entityManager->getRepository(Service::class)->find($id);
            if (!$service) {
                return $this->json(['error' => 'Service not found'], 404);
            }

            foreach ($entityManager->getRepository(Event::class)->findAll() as $event) {
                if (in_array($id, $event->getIncludedServices(), true)) {
                    return $this->json(['error' => 'Service is used by an event'], 409);
                }
            }

            $entityManager->remove($service);
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

        private function normalizePayload(array $payload, bool $partial = false): array|JsonResponse
        {
            $data = [];
            foreach (['name', 'category', 'description', 'unit'] as $field) {
                if (!array_key_exists($field, $payload)) {
                    if (!$partial && in_array($field, ['name', 'category'], true)) {
                        return $this->json(['error' => sprintf('%s is required', $field)], 400);
                    }
                    continue;
                }
                if (!is_string($payload[$field]) && !is_numeric($payload[$field])) {
                    return $this->json(['error' => sprintf('%s must be a string', $field)], 400);
                }

                $value = trim((string) $payload[$field]);
                if (in_array($field, ['name', 'category'], true) && $value === '') {
                    return $this->json(['error' => sprintf('%s is required', $field)], 400);
                }
                $data[$field] = $value;
            }

            if (array_key_exists('unitPrice', $payload)) {
                $price = filter_var($payload['unitPrice'], FILTER_VALIDATE_INT);
                if ($price === false || $price < 0) {
                    return $this->json(['error' => 'unitPrice must be a non-negative integer'], 400);
                }
                $data['unitPrice'] = $price;
            } elseif (!$partial) {
                return $this->json(['error' => 'unitPrice is required'], 400);
            }

            if (array_key_exists('isPopular', $payload)) {
                if (!is_bool($payload['isPopular'])) {
                    return $this->json(['error' => 'isPopular must be a boolean'], 400);
                }
                $data['isPopular'] = $payload['isPopular'];
            }

            foreach (['image', 'duration'] as $field) {
                if (!array_key_exists($field, $payload)) continue;
                if ($payload[$field] !== null && !is_string($payload[$field])) {
                    return $this->json(['error' => sprintf('%s must be a string or null', $field)], 400);
                }
                $value = trim((string) ($payload[$field] ?? ''));
                $data[$field] = $value !== '' ? $value : null;
            }

            if (array_key_exists('features', $payload)) {
                if (!is_array($payload['features'])) {
                    return $this->json(['error' => 'features must be an array'], 400);
                }
                foreach ($payload['features'] as $feature) {
                    if (!is_string($feature)) {
                        return $this->json(['error' => 'features must contain only strings'], 400);
                    }
                }
                $data['features'] = array_values(array_filter(array_map('trim', $payload['features'])));
            }

            return $data;
        }

        private function applyPayload(Service $service, array $data): void
        {
            if (array_key_exists('name', $data)) $service->setName($data['name']);
            if (array_key_exists('category', $data)) $service->setCategory($data['category']);
            if (array_key_exists('description', $data)) $service->setDescription($data['description']);
            if (array_key_exists('unitPrice', $data)) $service->setUnitPrice($data['unitPrice']);
            if (array_key_exists('unit', $data)) $service->setUnit($data['unit']);
            if (array_key_exists('isPopular', $data)) $service->setIsPopular($data['isPopular']);
            if (array_key_exists('image', $data)) $service->setImage($data['image']);
            if (array_key_exists('features', $data)) $service->setFeatures($data['features']);
            if (array_key_exists('duration', $data)) $service->setDuration($data['duration']);
        }

        private function serializeService(Service $service): array
        {
            return [
                'id' => $service->getId(),
                'name' => $service->getName(),
                'category' => $service->getCategory(),
                'description' => $service->getDescription(),
                'unitPrice' => $service->getUnitPrice(),
                'unit' => $service->getUnit(),
                'isPopular' => $service->isPopular() ?? false,
                'image' => $service->getImage() ?? '',
                'features' => $service->getFeatures(),
                'duration' => $service->getDuration() ?? '',
            ];
        }
}
