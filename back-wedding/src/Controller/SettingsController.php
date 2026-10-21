<?php

namespace App\Controller;

use App\Entity\AgencySettings;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/settings')]
class SettingsController extends AbstractController
{
    #[Route('', name: 'api_settings_show', methods: ['GET'])]
    public function show(EntityManagerInterface $entityManager): JsonResponse
    {
        $settings = $entityManager->getRepository(AgencySettings::class)->find('main');
        if (!$settings) return $this->json(['error' => 'La configuration de l’agence est introuvable.'], 404);

        return $this->json($this->serialize($settings));
    }

    #[Route('', name: 'api_settings_update', methods: ['PUT', 'PATCH'])]
    public function update(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $this->json(['error' => 'Le corps de la requête doit être un JSON valide.'], 400);
        }
        if (!is_array($payload)) return $this->json(['error' => 'Le corps de la requête est invalide.'], 400);

        $settings = $entityManager->getRepository(AgencySettings::class)->find('main');
        if (!$settings) return $this->json(['error' => 'La configuration de l’agence est introuvable.'], 404);

        $fields = [
            'agencyName' => ['setter' => 'setAgencyName', 'max' => 180],
            'address' => ['setter' => 'setAddress', 'max' => 255],
            'phone' => ['setter' => 'setPhone', 'max' => 100],
            'email' => ['setter' => 'setEmail', 'max' => 180],
            'nif' => ['setter' => 'setNif', 'max' => 40],
            'stat' => ['setter' => 'setStat', 'max' => 60],
        ];

        foreach ($fields as $field => $definition) {
            if (!array_key_exists($field, $payload)) continue;
            if (!is_string($payload[$field])) {
                return $this->json(['error' => 'Le champ '.$field.' doit être une chaîne de caractères.'], 422);
            }
            $value = trim($payload[$field]);
            if (in_array($field, ['agencyName', 'address', 'phone', 'email'], true) && $value === '') {
                return $this->json(['error' => 'Le champ '.$field.' est obligatoire.'], 422);
            }
            if (strlen($value) > $definition['max']) {
                return $this->json(['error' => 'Le champ '.$field.' dépasse la longueur autorisée.'], 422);
            }
            if ($field === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['error' => 'L’adresse email est invalide.'], 422);
            }
            $settings->{$definition['setter']}($value);
        }

        if (array_key_exists('currency', $payload) && $payload['currency'] !== $settings->getCurrency()) {
            return $this->json(['error' => 'La devise principale ne peut pas être modifiée ici.'], 422);
        }

        $entityManager->flush();

        return $this->json($this->serialize($settings));
    }

    private function serialize(AgencySettings $settings): array
    {
        return [
            'agencyName' => $settings->getAgencyName(),
            'address' => $settings->getAddress(),
            'phone' => $settings->getPhone(),
            'email' => $settings->getEmail(),
            'nif' => $settings->getNif(),
            'stat' => $settings->getStat(),
            'currency' => $settings->getCurrency(),
        ];
    }
}