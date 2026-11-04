<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\PricingPack;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/pricing-packs')]
class PricingPackController extends AbstractController
{
    #[Route('', name: 'api_pricing_packs', methods: ['GET'])]
    public function getPacks(EntityManagerInterface $entityManager): JsonResponse
    {
        $packs = $entityManager->getRepository(PricingPack::class)->findBy([], ['category' => 'ASC', 'name' => 'ASC']);

        return $this->json(array_map(fn (PricingPack $pack) => $this->serializePack($pack), $packs));
    }

    #[Route('', name: 'api_create_pricing_pack', methods: ['POST'])]
    public function createPack(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $data = $this->normalizePayload($payload);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $referenceError = $this->validateReference(null, $data['referencePackId'] ?? null, $entityManager);
        if ($referenceError) {
            return $referenceError;
        }

        $pack = new PricingPack();
        $pack->setId('pack-'.bin2hex(random_bytes(16)));
        $this->applyPayload($pack, $data, $entityManager);
        $entityManager->persist($pack);
        $entityManager->flush();

        return $this->json($this->serializePack($pack), 201);
    }

    #[Route('/{id}', name: 'api_update_pricing_pack', methods: ['PUT', 'PATCH'])]
    public function updatePack(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $pack = $entityManager->getRepository(PricingPack::class)->find($id);
        if (!$pack) {
            return $this->json(['error' => 'Pricing pack not found'], 404);
        }

        $payload = $this->decodePayload($request);
        if ($payload instanceof JsonResponse) {
            return $payload;
        }

        $data = $this->normalizePayload($payload, true);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $referencePackId = array_key_exists('referencePackId', $data)
            ? $data['referencePackId']
            : $pack->getReferencePackId();
        $referenceError = $this->validateReference($id, $referencePackId, $entityManager);
        if ($referenceError) {
            return $referenceError;
        }

        $this->applyPayload($pack, $data, $entityManager);
        foreach ($entityManager->getRepository(Event::class)->findBy(['pack' => $pack]) as $event) {
            $event->setPackName($pack->getName());
        }
        $entityManager->flush();

        return $this->json($this->serializePack($pack));
    }

    #[Route('/{id}', name: 'api_delete_pricing_pack', methods: ['DELETE'])]
    public function deletePack(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $pack = $entityManager->getRepository(PricingPack::class)->find($id);
        if (!$pack) {
            return $this->json(['error' => 'Pricing pack not found'], 404);
        }

        $eventRepository = $entityManager->getRepository(Event::class);
        if ($eventRepository->count(['pack' => $pack]) > 0) {
            return $this->json(['error' => 'Pricing pack is used by an event'], 409);
        }
        if ($entityManager->getRepository(PricingPack::class)->count(['referencePack' => $pack]) > 0) {
            return $this->json(['error' => 'Pricing pack is referenced by another pack'], 409);
        }

        $entityManager->remove($pack);
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
        foreach (['name', 'category', 'description'] as $field) {
            if (!array_key_exists($field, $payload)) {
                if (!$partial && $field !== 'description') {
                    return $this->json(['error' => sprintf('%s is required', $field)], 400);
                }
                continue;
            }
            if (!is_string($payload[$field])) {
                return $this->json(['error' => sprintf('%s must be a string', $field)], 400);
            }

            $data[$field] = trim($payload[$field]);
            if (in_array($field, ['name', 'category'], true) && $data[$field] === '') {
                return $this->json(['error' => sprintf('%s is required', $field)], 400);
            }
        }

        if (array_key_exists('basePrice', $payload)) {
            $basePrice = filter_var($payload['basePrice'], FILTER_VALIDATE_INT);
            if ($basePrice === false || $basePrice < 0) {
                return $this->json(['error' => 'basePrice must be a non-negative integer'], 400);
            }
            $data['basePrice'] = $basePrice;
        } elseif (!$partial) {
            return $this->json(['error' => 'basePrice is required'], 400);
        }

        if (array_key_exists('popular', $payload)) {
            if (!is_bool($payload['popular'])) {
                return $this->json(['error' => 'popular must be a boolean'], 400);
            }
            $data['popular'] = $payload['popular'];
        }

        foreach (['badge', 'referencePackId', 'referenceText', 'extraInfo'] as $field) {
            if (!array_key_exists($field, $payload)) {
                continue;
            }
            if ($payload[$field] !== null && !is_string($payload[$field])) {
                return $this->json(['error' => sprintf('%s must be a string or null', $field)], 400);
            }
            $value = trim((string) ($payload[$field] ?? ''));
            $data[$field] = $value !== '' ? $value : null;
        }

        if (array_key_exists('includedItems', $payload)) {
            if (!is_array($payload['includedItems'])) {
                return $this->json(['error' => 'includedItems must be an array'], 400);
            }
            foreach ($payload['includedItems'] as $item) {
                if (!is_string($item)) {
                    return $this->json(['error' => 'includedItems must contain only strings'], 400);
                }
            }
            $data['includedItems'] = array_values(array_filter(array_map('trim', $payload['includedItems'])));
        } elseif (!$partial) {
            return $this->json(['error' => 'includedItems is required'], 400);
        }

        if (array_key_exists('pricingGrid', $payload)) {
            $grid = $this->normalizeGrid($payload['pricingGrid']);
            if ($grid instanceof JsonResponse) {
                return $grid;
            }
            $data['pricingGrid'] = $grid;
        }

        return $data;
    }

    private function normalizeGrid(mixed $value): array|null|JsonResponse
    {
        if ($value === null) {
            return null;
        }
        if (!is_array($value) || !isset($value['headers'], $value['rows']) || !is_array($value['headers']) || !is_array($value['rows'])) {
            return $this->json(['error' => 'pricingGrid must contain headers and rows arrays'], 400);
        }

        $headers = array_values($value['headers']);
        if ($headers === []) {
            return $this->json(['error' => 'pricingGrid must have at least one header'], 400);
        }
        foreach ($headers as $header) {
            if (!is_string($header) || trim($header) === '') {
                return $this->json(['error' => 'pricingGrid headers must be non-empty strings'], 400);
            }
        }

        $rows = array_values($value['rows']);
        if ($rows === []) {
            return $this->json(['error' => 'pricingGrid must have at least one row'], 400);
        }
        foreach ($rows as &$row) {
            if (!is_array($row) || !isset($row['label'], $row['values']) || !is_string($row['label']) || trim($row['label']) === '' || !is_array($row['values']) || count($row['values']) !== count($headers)) {
                return $this->json(['error' => 'Each pricingGrid row needs a label and one price per header'], 400);
            }
            foreach ($row['values'] as &$price) {
                $price = filter_var($price, FILTER_VALIDATE_INT);
                if ($price === false || $price < 0) {
                    return $this->json(['error' => 'Grid prices must be non-negative integers'], 400);
                }
            }
            unset($price);
            $row['label'] = trim($row['label']);
            $row['values'] = array_values($row['values']);
        }
        unset($row);

        return ['headers' => $headers, 'rows' => $rows];
    }

    private function validateReference(?string $packId, ?string $referencePackId, EntityManagerInterface $entityManager): ?JsonResponse
    {
        if ($referencePackId === null) {
            return null;
        }
        if ($packId !== null && $packId === $referencePackId) {
            return $this->json(['error' => 'A pack cannot reference itself'], 400);
        }

        $repository = $entityManager->getRepository(PricingPack::class);
        $visited = $packId === null ? [] : [$packId => true];
        $currentId = $referencePackId;
        while ($currentId !== null) {
            if (isset($visited[$currentId])) {
                return $this->json(['error' => 'Circular pack reference detected'], 400);
            }
            $visited[$currentId] = true;
            $current = $repository->find($currentId);
            if (!$current) {
                return $this->json(['error' => 'Referenced pricing pack not found'], 400);
            }
            $currentId = $current->getReferencePackId();
        }

        return null;
    }

    private function applyPayload(PricingPack $pack, array $data, EntityManagerInterface $entityManager): void
    {
        if (array_key_exists('name', $data)) $pack->setName($data['name']);
        if (array_key_exists('category', $data)) $pack->setCategory($data['category']);
        if (array_key_exists('description', $data)) $pack->setDescription($data['description']);
        if (array_key_exists('badge', $data)) $pack->setBadge($data['badge']);
        if (array_key_exists('popular', $data)) $pack->setPopular($data['popular']);
        if (array_key_exists('basePrice', $data)) $pack->setBasePrice($data['basePrice']);
        if (array_key_exists('referencePackId', $data)) {
            $referencePack = $data['referencePackId'] === null
                ? null
                : $entityManager->getRepository(PricingPack::class)->find($data['referencePackId']);
            $pack->setReferencePack($referencePack);
        }
        if (array_key_exists('referenceText', $data)) $pack->setReferenceText($data['referenceText']);
        if (array_key_exists('includedItems', $data)) $pack->setIncludedItems($data['includedItems']);
        if (array_key_exists('pricingGrid', $data)) $pack->setPricingGrid($data['pricingGrid']);
        if (array_key_exists('extraInfo', $data)) $pack->setExtraInfo($data['extraInfo']);
    }

    private function serializePack(PricingPack $pack): array
    {
        return [
            'id' => $pack->getId(),
            'category' => $pack->getCategory(),
            'name' => $pack->getName(),
            'description' => $pack->getDescription(),
            'badge' => $pack->getBadge(),
            'popular' => $pack->isPopular(),
            'basePrice' => $pack->getBasePrice(),
            'referencePackId' => $pack->getReferencePackId(),
            'referenceText' => $pack->getReferenceText(),
            'includedItems' => $pack->getIncludedItems(),
            'pricingGrid' => $pack->getPricingGrid(),
            'extraInfo' => $pack->getExtraInfo(),
        ];
    }
}