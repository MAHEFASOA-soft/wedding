<?php

namespace App\DataFixtures;

use App\Entity\EventTeam;
use App\Entity\Place;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class PlaceTeamFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['place-team'];
    }

    public function load(ObjectManager $manager): void
    {
        $this->loadPlaces($manager);
        $this->loadEventTeams($manager);
        $manager->flush();
    }

    private function loadPlaces(ObjectManager $manager): void
    {
        $places = [
            [
                'id' => 'fixture-place-ravinala',
                'name' => 'Carlton Anosy — Salle Ravinala, Antananarivo',
                'type' => 'Salle',
                'address' => 'Anosy',
                'city' => 'Antananarivo',
                'district' => 'Anosy',
                'latitude' => -18.915,
                'longitude' => 47.516,
                'capacity' => 300,
                'pricePerDay' => 1800000,
                'phone' => '+261 34 00 000 01',
                'email' => '',
                'website' => '',
                'description' => 'Salle de réception adaptée aux mariages et événements professionnels.',
                'amenities' => ['Parking', 'Cuisine', 'Toilettes', 'Électricité', 'Climatisation'],
                'mainImage' => '',
                'gallery' => [],
                'status' => 'Disponible',
            ],
            [
                'id' => 'fixture-place-manerinerina',
                'name' => 'Domaine Manerinerina, Ambohimanga Rova',
                'type' => 'Domaine',
                'address' => 'Ambohimanga Rova',
                'city' => 'Antananarivo',
                'district' => 'Ambohimanga',
                'latitude' => -18.76,
                'longitude' => 47.56,
                'capacity' => 400,
                'pricePerDay' => 2200000,
                'phone' => '+261 34 00 000 02',
                'email' => '',
                'website' => '',
                'description' => 'Domaine avec jardin pour les réceptions et événements en plein air.',
                'amenities' => ['Parking', 'Cuisine', 'Toilettes', 'Électricité', 'Jardin', 'Sonorisation'],
                'mainImage' => '',
                'gallery' => [],
                'status' => 'Disponible',
            ],
            [
                'id' => 'fixture-place-yandi',
                'name' => 'Espace Yandi By-Pass, Antananarivo',
                'type' => 'Salle',
                'address' => 'By-Pass',
                'city' => 'Antananarivo',
                'district' => 'By-Pass',
                'latitude' => -18.95,
                'longitude' => 47.55,
                'capacity' => 250,
                'pricePerDay' => 1200000,
                'phone' => '+261 34 00 000 03',
                'email' => '',
                'website' => '',
                'description' => 'Espace modulable pour cérémonies, réceptions et événements privés.',
                'amenities' => ['Parking', 'Toilettes', 'Électricité', 'Sécurité'],
                'mainImage' => '',
                'gallery' => [],
                'status' => 'Disponible',
            ],
        ];

        foreach ($places as $data) {
            if ($manager->getRepository(Place::class)->find($data['id'])) {
                continue;
            }

            $place = new Place();
            $place->setId($data['id'])
                ->setName($data['name'])
                ->setType($data['type'])
                ->setAddress($data['address'])
                ->setCity($data['city'])
                ->setDistrict($data['district'])
                ->setLatitude($data['latitude'])
                ->setLongitude($data['longitude'])
                ->setCapacity($data['capacity'])
                ->setPricePerDay($data['pricePerDay'])
                ->setPhone($data['phone'])
                ->setEmail($data['email'])
                ->setWebsite($data['website'])
                ->setDescription($data['description'])
                ->setAmenities($data['amenities'])
                ->setMainImage($data['mainImage'])
                ->setGallery($data['gallery'])
                ->setStatus($data['status']);

            $manager->persist($place);
        }
    }

    private function loadEventTeams(ObjectManager $manager): void
    {
        foreach (['fixture-event-team-planning', 'fixture-event-team-service'] as $obsoleteId) {
            $obsoleteTeam = $manager->getRepository(EventTeam::class)->find($obsoleteId);
            if ($obsoleteTeam) {
                $manager->remove($obsoleteTeam);
            }
        }

        $teams = [
            [
                'id' => 'team-planning',
                'name' => 'Équipe Planning & Coordination',
                'description' => 'Pilotage des clients, planning, coordination jour J et suivi des prestataires.',
                'specialization' => 'Planning',
                'leaderId' => 'tm-1',
                'memberIds' => ['tm-1', 'tm-4', 'tm-6'],
                'assignedEventIds' => ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-6'],
                'status' => 'Affectée',
                'color' => 'amber',
                'notes' => 'Équipe principale de coordination des mariages.',
            ],
            [
                'id' => 'team-service',
                'name' => 'Brigade Service & Salle',
                'description' => 'Maîtres d’hôtel, chefs de rang et serveurs pour le service en salle.',
                'specialization' => 'Service',
                'leaderId' => 'tm-5',
                'memberIds' => ['tm-5', 'srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-6', 'srv-7', 'srv-8', 'srv-9'],
                'assignedEventIds' => ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6'],
                'status' => 'Affectée',
                'color' => 'blue',
                'notes' => 'Brigade modulable selon le nombre d’invités.',
            ],
            [
                'id' => 'team-logistics',
                'name' => 'Équipe Logistique & Régie',
                'description' => 'Transport, installation, matériel, régie et coordination technique.',
                'specialization' => 'Logistique',
                'leaderId' => 'tm-3',
                'memberIds' => ['tm-3'],
                'assignedEventIds' => ['evt-1', 'evt-2', 'evt-4', 'evt-5'],
                'status' => 'Affectée',
                'color' => 'emerald',
                'notes' => 'Renforts externes possibles selon les besoins techniques.',
            ],
            [
                'id' => 'team-decoration',
                'name' => 'Équipe Décoration & Scénographie',
                'description' => 'Direction artistique, décoration, fleurs, art de table et installation visuelle.',
                'specialization' => 'Décoration',
                'leaderId' => 'tm-2',
                'memberIds' => ['tm-2'],
                'assignedEventIds' => ['evt-1', 'evt-2', 'evt-4'],
                'status' => 'Affectée',
                'color' => 'purple',
                'notes' => 'Travaille à partir du brief client et du moodboard validé.',
            ],
            [
                'id' => 'team-cocktail',
                'name' => 'Équipe Cocktail & Bar',
                'description' => 'Cocktails d’accueil, bar, boissons et gestion du poste cocktail.',
                'specialization' => 'Cocktail',
                'leaderId' => 'srv-5',
                'memberIds' => ['srv-5', 'srv-4'],
                'assignedEventIds' => ['evt-1', 'evt-4', 'evt-6'],
                'status' => 'Affectée',
                'color' => 'rose',
                'notes' => 'Renfort possible avec des serveurs polyvalents.',
            ],
        ];

        foreach ($teams as $data) {
            $team = $manager->getRepository(EventTeam::class)->find($data['id']);
            if (!$team) {
                $team = new EventTeam();
                $team->setId($data['id']);
                $manager->persist($team);
            }

            $team->setName($data['name'])
                ->setDescription($data['description'])
                ->setSpecialization($data['specialization'])
                ->setLeaderId($data['leaderId'])
                ->setMemberIds($data['memberIds'])
                ->setAssignedEventIds($data['assignedEventIds'])
                ->setStatus($data['status'])
                ->setColor($data['color'])
                ->setNotes($data['notes']);
        }
    }
}