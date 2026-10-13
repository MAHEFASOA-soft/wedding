<?php

namespace App\DataFixtures;

use App\Entity\EmployeeProfile;
use App\Entity\ServerStaff;
use App\Entity\TeamMember;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class TeamFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['team'];
    }

    public function load(ObjectManager $manager): void
    {
        $this->loadTeamMembers($manager);
        $this->loadServers($manager);
        $this->loadProfiles($manager);
        $manager->flush();
    }

    private function loadTeamMembers(ObjectManager $manager): void
    {
        $rows = [
            ['tm-1', 'Miora Randria', 'Fondatrice & Directrice Générale', 'Direction & Wedding Planning', '+261 34 11 000 01', 'direction@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', null],
            ['tm-2', 'Arnaud Rabe', 'Directeur Artistique & Designer Scénographe', 'Décoration & Art de table', '+261 34 22 000 02', 'design@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', null],
            ['tm-3', 'Tahina Andriam', 'Chef Régie & Responsable Logistique', 'Logistique, Flotte & Transport', '+261 34 33 000 03', 'logistique@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', null],
            ['tm-4', 'Santatra Razanadahy', 'Responsable Relation Clients & Devis', 'Administration & Facturation', '+261 34 44 000 04', 'contact@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', null],
            ['tm-5', 'Rivo Rakotomalala', 'Maître d’Hôtel & Superviseur de Salle', 'Opérations & Service', '+261 33 52 000 05', 'rivo.supervision@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', null],
            ['tm-6', 'Lova Razafindramboa', 'Coordinatrice Événementielle', 'Wedding Planning & Coordination', '+261 34 63 000 06', 'lova.planning@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80', null],
        ];

        foreach ($rows as [$id, $name, $role, $department, $phone, $email, $status, $avatar, $monthlySalary]) {
            if ($manager->getRepository(TeamMember::class)->find($id)) continue;
            $member = new TeamMember();
            $member->setId($id);
            $member->setName($name)->setRole($role)->setDepartment($department)->setPhone($phone)
                ->setEmail($email)->setStatus($status)->setAvatar($avatar)->setMonthlySalary($monthlySalary);
            $manager->persist($member);
        }
    }

    private function loadServers(ObjectManager $manager): void
    {
        $rows = [
            ['srv-1', 'Jean-Luc Rakotozafy', '+261 34 22 110 01', 'Maître d’hôtel', 'Assigné', 18000, 24, 4.9],
            ['srv-2', 'Fanja Rasoarimanana', '+261 33 15 443 21', 'Chef de rang', 'Assigné', 14000, 19, 4.8],
            ['srv-3', 'Andry Razafimanantsoa', '+261 32 88 776 54', 'Serveur', 'Disponible', 11000, 15, 4.7],
            ['srv-4', 'Nomena Randrianasolo', '+261 34 99 881 22', 'Serveur', 'Disponible', 11000, 12, 4.6],
            ['srv-5', 'Kanto Andriatsitohaina', '+261 33 77 665 44', 'Barman', 'Assigné', 13000, 18, 4.9],
            ['srv-6', 'Thierry Ramananjaona', '+261 32 55 443 32', 'Serveur', 'Assigné', 11000, 11, 4.5],
            ['srv-7', 'Soa Lalaina Rabemananjara', '+261 34 33 221 19', 'Chef de rang', 'Disponible', 14000, 16, 4.8],
            ['srv-8', 'Mamy Andriamahery', '+261 32 64 118 90', 'Serveur', 'Disponible', 10500, 9, 4.6],
            ['srv-9', 'Hasina Rakotondrabe', '+261 34 71 225 18', 'Hôtesse d’accueil', 'Disponible', 12000, 8, 4.7],
        ];

        foreach ($rows as [$id, $name, $phone, $role, $status, $hourlyRate, $assignedEventsCount, $rating]) {
            if ($manager->getRepository(ServerStaff::class)->find($id)) continue;
            $server = new ServerStaff();
            $server->setId($id);
            $server->setName($name)->setPhone($phone)->setRole($role)->setStatus($status)
                ->setHourlyRate($hourlyRate)->setAssignedEventsCount($assignedEventsCount)->setRating($rating);
            $manager->persist($server);
        }
    }

    private function loadProfiles(ObjectManager $manager): void
    {
        $rows = [
            ['tm-1', 'Permanent', 'Direction & Wedding Planning', '9 ans dans l’organisation de mariages et événements premium', ['Direction', 'Wedding planning', 'Négociation', 'Relation client VIP'], '2017-02-01', 'Affecté', ['team-planning'], ['evt-1', 'evt-2', 'evt-4'], 'Supervise les événements stratégiques et valide les décisions importantes.', ['Français', 'Malgache', 'Anglais'], '+261 34 90 111 11'],
            ['tm-2', 'Permanent', 'Décoration & Art de table', '7 ans en scénographie événementielle', ['Scénographie', 'Fleurs', 'Art de table', 'Moodboard'], '2019-05-06', 'Affecté', ['team-decoration'], ['evt-1', 'evt-2', 'evt-4'], 'Responsable de la direction artistique et de la cohérence visuelle.', ['Français', 'Malgache'], '+261 33 90 222 22'],
            ['tm-3', 'Permanent', 'Logistique, Flotte & Transport', '8 ans en régie et logistique événementielle', ['Logistique', 'Transport', 'Régie', 'Sécurité opérationnelle'], '2018-08-13', 'Affecté', ['team-logistics'], ['evt-1', 'evt-2', 'evt-4', 'evt-5'], 'Coordonne les déplacements, installations et équipes techniques.', ['Français', 'Malgache'], '+261 34 90 333 33'],
            ['tm-4', 'Permanent', 'Administration & Facturation', '6 ans en administration et suivi commercial', ['Devis', 'Facturation', 'CRM', 'Relation client'], '2020-01-20', 'Disponible', ['team-planning'], ['evt-1', 'evt-2', 'evt-3'], 'Suit les dossiers clients, contrats, acomptes et facturation.', ['Français', 'Malgache'], null],
            ['tm-5', 'Permanent', 'Opérations & Service', '10 ans en restauration événementielle et service haut de gamme', ['Maître d’hôtel', 'Briefing équipe', 'Service VIP', 'Gestion de salle'], '2016-03-14', 'Affecté', ['team-service'], ['evt-1', 'evt-2', 'evt-4', 'evt-5'], 'Référent opérationnel pour les brigades de salle.', ['Français', 'Malgache'], '+261 32 90 444 44'],
            ['tm-6', 'Permanent', 'Wedding Planning & Coordination', '5 ans en coordination de mariages', ['Coordination', 'Planning jour J', 'Accueil client', 'Briefing prestataires'], '2021-06-07', 'Affecté', ['team-planning'], ['evt-2', 'evt-3', 'evt-6'], 'Coordonne les équipes sur site et assure le suivi du planning.', ['Français', 'Malgache', 'Anglais'], null],
            ['srv-1', 'Vacation', 'Service', '11 ans en hôtellerie et réceptions premium', ['Maître d’hôtel', 'Supervision', 'Service VIP', 'Briefing'], '2019-01-10', 'Affecté', ['team-service'], ['evt-1', 'evt-2', 'evt-4', 'evt-5'], 'Chef de brigade pour les grands événements.', ['Français', 'Malgache'], null],
            ['srv-2', 'Vacation', 'Service', '8 ans en restauration et banquets', ['Chef de rang', 'Service buffet', 'Dressage', 'Accueil'], '2020-02-17', 'Affecté', ['team-service'], ['evt-1', 'evt-2', 'evt-4', 'evt-5', 'evt-6'], 'Très à l’aise sur les buffets et les réceptions de grande capacité.', ['Français', 'Malgache'], null],
            ['srv-3', 'Vacation', 'Service', '6 ans en service événementiel', ['Service à table', 'Buffet', 'Débarrassage', 'Mise en place'], '2021-04-05', 'Affecté', ['team-service'], ['evt-1', 'evt-3', 'evt-5'], 'Profil polyvalent, disponible pour les événements du week-end.', ['Français', 'Malgache'], null],
            ['srv-4', 'Vacation', 'Service', '5 ans en restauration et événementiel', ['Service', 'Mise en place', 'Accueil', 'Cocktail'], '2021-09-12', 'Affecté', ['team-service', 'team-cocktail'], ['evt-2', 'evt-3', 'evt-5'], 'Polyvalent entre service de salle et cocktail.', ['Français', 'Malgache'], null],
            ['srv-5', 'Vacation', 'Cocktail & Bar', '7 ans en bar événementiel', ['Cocktails', 'Bar', 'Service VIP', 'Gestion stock bar'], '2020-11-23', 'Affecté', ['team-cocktail'], ['evt-1', 'evt-4', 'evt-6'], 'Responsable du poste bar et des cocktails d’accueil.', ['Français', 'Malgache'], null],
            ['srv-6', 'Vacation', 'Service', '4 ans en service de réception', ['Service', 'Buffet', 'Boissons', 'Mise en place'], '2022-02-14', 'Affecté', ['team-service'], ['evt-1', 'evt-4'], 'Profil fiable pour les brigades de taille moyenne.', ['Français', 'Malgache'], null],
            ['srv-7', 'Vacation', 'Service', '7 ans en banquets et hôtellerie', ['Chef de rang', 'Service VIP', 'Coordination de table'], '2020-07-18', 'Affecté', ['team-service'], ['evt-2', 'evt-5'], 'Chef de rang polyvalent pour les mariages et galas.', ['Français', 'Malgache'], null],
            ['srv-8', 'Extra', 'Service', '3 ans en restauration et événementiel', ['Service', 'Mise en place', 'Débarrassage'], '2023-01-09', 'Disponible', ['team-service'], [], 'Extra mobilisable en renfort sur les grandes réceptions.', ['Malgache', 'Français'], null],
            ['srv-9', 'Extra', 'Accueil & Protocole', '4 ans en accueil événementiel', ['Accueil', 'Orientation invités', 'Protocole', 'Vestiaire'], '2022-10-03', 'Disponible', ['team-service'], [], 'Renfort accueil et protocole pour événements VIP.', ['Français', 'Malgache', 'Anglais'], null],
        ];

        foreach ($rows as [$id, $employeeType, $department, $experience, $skills, $hireDate, $availability, $teamIds, $assignedEventIds, $notes, $languages, $emergencyContact]) {
            if ($manager->getRepository(EmployeeProfile::class)->find($id)) continue;
            $profile = new EmployeeProfile();
            $profile->setId($id);
            $profile->setEmployeeType($employeeType)->setDepartment($department)->setExperience($experience)
                ->setSkills($skills)->setHireDate($hireDate)->setAvailability($availability)->setTeamIds($teamIds)
                ->setAssignedEventIds($assignedEventIds)->setNotes($notes)->setLanguages($languages)
                ->setEmergencyContact($emergencyContact);
            $manager->persist($profile);
        }
    }
}