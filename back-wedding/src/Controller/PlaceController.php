<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\Place;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class PlaceController extends AbstractController
{
    #[Route('/places', name: 'api_places', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $places = $entityManager->getRepository(Place::class)->findAll();
        return $this->json(array_map(fn (Place $place) => $this->serializePlace($place, $entityManager), $places));
    }

    #[Route('/places/available', name: 'api_available_places', methods: ['GET'])]
    public function available(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $startDate = (string) $request->query->get('startDate', '');
        $endDate = (string) $request->query->get('endDate', $startDate);
        if (!$this->validDate($startDate) || !$this->validDate($endDate) || $startDate > $endDate) {
            return $this->json(['error' => 'Indiquez une période valide.'], 400);
        }

        $events = $entityManager->getRepository(Event::class)->findAll();
        $busyLocations = [];
        foreach ($events as $event) {
            if ($event->getStatus() !== 'Annulé' && $event->getDate() >= $startDate && $event->getDate() <= $endDate) {
                $busyLocations[mb_strtolower(trim($event->getLocation()))] = true;
            }
        }
        $places = $entityManager->getRepository(Place::class)->findBy(['status' => 'Disponible']);
        $available = array_filter($places, fn (Place $place) => !isset($busyLocations[mb_strtolower(trim($place->getName()))]));
        return $this->json(array_map(fn (Place $place) => $this->serializePlace($place, $entityManager), array_values($available)));
    }

    #[Route('/places', name: 'api_create_place', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $payload = json_decode($request->getContent(), true) ?? [];
        if (!$this->validPayload($payload)) return $this->json(['error' => 'Nom, adresse, ville, capacité et tarif valides requis.'], 422);
        $place = new Place();
        $place->setId((string) ($payload['id'] ?? bin2hex(random_bytes(12))));
        $this->applyPayload($place, $payload);
        $entityManager->persist($place);
        $entityManager->flush();
        return $this->json($this->serializePlace($place, $entityManager), 201);
    }

    #[Route('/places/{id}', name: 'api_update_place', methods: ['PUT', 'PATCH'])]
    public function update(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $place = $entityManager->getRepository(Place::class)->find($id);
        if (!$place) return $this->json(['error' => 'Lieu introuvable.'], 404);
        $payload = json_decode($request->getContent(), true) ?? [];
        if (!$this->validPayload($payload, true)) return $this->json(['error' => 'Capacité ou tarif invalide.'], 422);
        $this->applyPayload($place, $payload, true);
        $entityManager->flush();
        return $this->json($this->serializePlace($place, $entityManager));
    }

    #[Route('/places/{id}', name: 'api_delete_place', methods: ['DELETE'])]
    public function delete(string $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $place = $entityManager->getRepository(Place::class)->find($id);
        if (!$place) return $this->json(['error' => 'Lieu introuvable.'], 404);
        $entityManager->remove($place);
        $entityManager->flush();
        return $this->json(['success' => true]);
    }

    private function serializePlace(Place $place, EntityManagerInterface $entityManager): array
    {
        $events = $entityManager->getRepository(Event::class)->findBy(['location' => $place->getName()]);
        return [
            'id' => $place->getId(), 'name' => $place->getName(), 'type' => $place->getType(),
            'address' => $place->getAddress(), 'city' => $place->getCity(), 'district' => $place->getDistrict(),
            'latitude' => $place->getLatitude(), 'longitude' => $place->getLongitude(), 'capacity' => $place->getCapacity(),
            'pricePerDay' => $place->getPricePerDay(), 'phone' => $place->getPhone(), 'email' => $place->getEmail(),
            'website' => $place->getWebsite(), 'description' => $place->getDescription(), 'amenities' => $place->getAmenities(),
            'mainImage' => $place->getMainImage(), 'gallery' => $place->getGallery(), 'status' => $place->getStatus(),
            'events' => array_map(fn (Event $event) => [
                'id' => $event->getId(), 'name' => $event->getName(), 'date' => $event->getDate(),
                'startTime' => $event->getStartTime(), 'endTime' => $event->getEndTime(),
                'client' => $event->getClientName(), 'guests' => $event->getGuestCount(), 'status' => $event->getStatus(),
            ], $events),
        ];
    }

    private function applyPayload(Place $place, array $payload, bool $partial = false): void
    {
        $fields = [
            'name' => fn ($value) => $place->setName((string) $value), 'type' => fn ($value) => $place->setType((string) $value),
            'address' => fn ($value) => $place->setAddress((string) $value), 'city' => fn ($value) => $place->setCity((string) $value),
            'district' => fn ($value) => $place->setDistrict((string) $value), 'latitude' => fn ($value) => $place->setLatitude((float) $value),
            'longitude' => fn ($value) => $place->setLongitude((float) $value), 'capacity' => fn ($value) => $place->setCapacity((int) $value),
            'pricePerDay' => fn ($value) => $place->setPricePerDay((int) $value), 'phone' => fn ($value) => $place->setPhone((string) $value),
            'email' => fn ($value) => $place->setEmail((string) $value), 'website' => fn ($value) => $place->setWebsite((string) $value),
            'description' => fn ($value) => $place->setDescription((string) $value), 'amenities' => fn ($value) => $place->setAmenities((array) $value),
            'mainImage' => fn ($value) => $place->setMainImage((string) $value), 'gallery' => fn ($value) => $place->setGallery((array) $value),
            'status' => fn ($value) => $place->setStatus((string) $value),
        ];
        foreach ($fields as $key => $setter) if (array_key_exists($key, $payload)) $setter($payload[$key]);
    }

    private function validPayload(array $payload, bool $partial = false): bool
    {
        foreach (['name', 'address', 'city'] as $field) if (!$partial && trim((string) ($payload[$field] ?? '')) === '') return false;
        if (isset($payload['capacity']) && (int) $payload['capacity'] < 1) return false;
        if (isset($payload['pricePerDay']) && (int) $payload['pricePerDay'] < 0) return false;
        return $partial || (isset($payload['capacity'], $payload['pricePerDay']) && (int) $payload['capacity'] > 0);
    }

    private function validDate(string $date): bool
    {
        $parsed = \DateTimeImmutable::createFromFormat('!Y-m-d', $date);
        return $parsed !== false && $parsed->format('Y-m-d') === $date;
    }
}