<?php

namespace App\DataFixtures;

use App\Entity\AccessRole;
use App\Entity\AgencySettings;
use App\Entity\Appointment;
use App\Entity\Client;
use App\Entity\EmployeeProfile;
use App\Entity\EquipmentItem;
use App\Entity\Event;
use App\Entity\EventTeam;
use App\Entity\FinanceExpense;
use App\Entity\FinanceReceipt;
use App\Entity\Invoice;
use App\Entity\Place;
use App\Entity\PricingPack;
use App\Entity\Quote;
use App\Entity\Reservation;
use App\Entity\SalaryRecord;
use App\Entity\ServerStaff;
use App\Entity\Service;
use App\Entity\TaskItem;
use App\Entity\TeamMember;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $this->loadReferenceData($manager);

        $clients = [
            ['cli-1', 'M. Hery Rakotoarisoa & Sitraka', '+261 34 12 345 67', 'hery.rakoto@gmail.com', 'Lot IV R Ivandry, Antananarivo', 'Couple très attentif aux détails floraux et au timing du cortège.', 1, 32000000, '2026-02-15'],
            ['cli-2', 'Faly Rasoanaivo & Miora', '+261 32 45 678 90', 'faly.rasoanaivo@orange.mg', 'Ambatobe Résidence, Antananarivo', 'Mariage champêtre chic, ambiance lumineuse féerique demandée.', 1, 26500000, '2026-03-10'],
            ['cli-3', 'Tojo Ramanantsoa & Haingo', '+261 33 21 987 65', 'tojo.haingo@gmail.com', 'Ankadimbahoaka, Antananarivo', 'Fiançailles traditionnelles (Vodiondry) puis cocktail dinatoire.', 1, 14000000, '2026-04-22'],
            ['cli-4', 'Rado Randriamalala & Fitia', '+261 34 56 789 01', 'rado.fitia@moov.mg', 'Ambohibao Antehiroka, Antananarivo', 'Mariage prestige 150 personnes avec cortège limousine et feu d’artifice.', 1, 28000000, '2026-05-04'],
            ['cli-5', 'Dr. Patrick Razafindrakoto & Vololona', '+261 32 11 223 34', 'dr.patrick.razaf@yahoo.fr', 'Isoraka, Antananarivo', 'Client VIP régulier - Célébration 50 ans avec orchestre jazz.', 2, 22500000, '2026-01-18'],
            ['cli-6', 'M. Andrianina & Rova', '+261 34 88 990 01', 'andrianina.rova@gmail.com', 'Alarobia, Antananarivo', 'Recherche formule tout compris clé en main pour fin d’année.', 0, 0, '2026-08-14'],
        ];

        foreach ($clients as [$id, $name, $phone, $email, $address, $notes, $eventsCount, $totalSpent, $createdAt]) {
            $client = new Client();
            $client->setId($id)->setName($name)->setPhone($phone)->setEmail($email)->setAddress($address)->setNotes($notes)->setEventsCount($eventsCount)->setTotalSpent($totalSpent)->setCreatedAt($createdAt);
            $manager->persist($client);
        }

        $events = [
            ['evt-1', 'EVT-2026-001', 'Mariage Princier Hery & Sitraka', 'cli-1', 'M. Hery Rakotoarisoa & Sitraka', '+261 34 12 345 67', '2026-09-12', '10:00', '22:00', 'Carlton Anosy — Salle Ravinala, Antananarivo', 'Mariage', 280, 32000000, 24000000, 'En cours', 'Miora Randria (Lead Planner)', ['srv-1', 'srv-2', 'srv-3', 'srv-5', 'srv-6'], 'Entrée des mariés avec violoniste solo. Décoration or et blanc nacré.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'],
            ['evt-2', 'EVT-2026-002', 'Mariage Champêtre Chic Faly & Miora', 'cli-2', 'Faly Rasoanaivo & Miora', '+261 32 45 678 90', '2026-09-26', '11:30', '21:00', 'Domaine Manerinerina, Ambohimanga Rova', 'Mariage', 200, 26500000, 18500000, 'Confirmé', 'Arnaud Rabe (Directeur Artistique)', ['srv-1', 'srv-2', 'srv-4', 'srv-7'], 'Arche florale en bois flotté, guirlandes guinguettes et espace photobooth.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80'],
            ['evt-3', 'EVT-2026-003', 'Vodiondry Traditionnel Tojo & Haingo', 'cli-3', 'Tojo Ramanantsoa & Haingo', '+261 33 21 987 65', '2026-10-03', '13:00', '19:00', 'Espace Yandi By-Pass, Antananarivo', 'Fiançailles', 120, 14000000, 10000000, 'Planifié', 'Tahina Andriam (Logistique)', ['srv-3', 'srv-4'], 'Cérémonie protocolaire malagasy respectée avec Kabary et cocktail soigné.', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80'],
            ['evt-4', 'EVT-2026-004', 'Mariage Glamour Rado & Fitia', 'cli-4', 'Rado Randriamalala & Fitia', '+261 34 56 789 01', '2026-10-20', '10:30', '23:00', 'Le Hintsy Ambohimanambola, Antananarivo', 'Mariage', 150, 28000000, 20000000, 'Confirmé', 'Miora Randria (Lead Planner)', ['srv-1', 'srv-2', 'srv-5', 'srv-6'], 'Cortège 2 Chrysler blanches, show pyrotechnique à 21h30.', 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80'],
            ['evt-5', 'EVT-2026-005', 'Gala Prestige & Cocktail Entreprise', 'cli-5', 'Dr. Patrick Razafindrakoto & Vololona', '+261 32 11 223 34', '2026-11-07', '18:00', '02:00', 'Domaine de Manao, Ambohimanga', 'Gala / Soirée', 220, 35000000, 15000000, 'Planifié', 'Arnaud Rabe (Directeur Artistique)', ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-7'], 'Éclairage architectural dynamique, bar à cocktails premium.', 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80'],
            ['evt-6', 'EVT-2026-006', 'Anniversaire 50 ans Jubilé Dr. Patrick', 'cli-5', 'Dr. Patrick Razafindrakoto & Vololona', '+261 32 11 223 34', '2026-08-22', '12:00', '19:00', 'Résidence Privée Isoraka, Antananarivo', 'Anniversaire', 100, 16000000, 16000000, 'Terminé', 'Tahina Andriam (Logistique)', ['srv-2', 'srv-5'], 'Événement clôturé avec succès et satisfaction client maximale.', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'],
        ];

        $packReveServices = [
            "Lieu de réception : en salle ou champêtre au choix (Ny Akaminaka, Espace Myrah, Espace Ravaka, Vohimana, Villa Sirilus, Callistemon, espace Fanitra, Matohota, Sahan'ny nofy, Ravato, Palm city Ivato, Anthurium espace etc...",
            'Décoration CHIC selon thème et code couleur de la salle de réception ou champêtre',
            'Décoration église',
            'Tête de cortège au choix avec déco et carburant',
            'Menu complet au choix avec traiteur bien réputé et qualifié parmi les meilleurs',
            'Boisson hygiénique et champagne',
            'Gâteaux de style au choix',
            'Cocktail de bienvenue',
            'Sonorisation avec lumière et effets spéciaux complet',
            'Orchestre complet avec maître de cérémonie professionnel',
            'Photographe et vidéaste avec 1 drone',
            'Cadeau Booking photo et livraison sur clé USB',
            'Robe de la mariée avec accessoire complet',
            'Costard marié en 3 pièces',
            "Carterie complète en salle et église : nom table, carte menus, livre d'or, liste des invités et plan de table, tableau de bienvenue",
            'Mise en beauté complète de la mariée à domicile',
            'Bonbonnière ou pot de miel, invitation, cadeau urne',
        ];
        $eventPacks = [
            'evt-1' => ['pack-vip', 'PACK VIP SUPRÊME', 'Buffet', [...$packReveServices, 'Chaise Chiavari ou chaise médaillon royal pour les invités', '2 photographes, 2 vidéastes, droniste + Booking photo', 'Clé USB personnalisée', 'Laoka avec dinde ou gisa', 'Tête de cortège très haut de gamme : dodge, mustang, Jeep limousine, Hammer, V8, Range rover, etc... au choix', 'Décoration très chic et personnalisée avec fleur tombante, stickers piste de danse etc...', 'Post wedding', "Feux d'artifice comme cadeau au artiste surprise"]],
            'evt-2' => ['pack-reve', 'PACK MARIAGE DE RÊVE A à Z', 'Semi-buffet', $packReveServices],
            'evt-3' => ['pack-vodionory', 'PACK VODIONORY / FIANÇAILLE DU MARIAGE', 'Buffet', ['Lieu de réception : en salle et champêtre au choix', 'Décoration selon thème et code couleur de la salle de réception et plein air', 'Mikabary malagasy matinina 2', 'Menu complet au choix avec traiteur bien réputé et qualifié parmi les meilleurs', 'Boisson hygiénique et champagne', 'Gâteaux de style au choix', 'Cocktail de bienvenue', 'Lumière et effets spéciaux complet : bulle, fumigène, confetti, pyrotechnie', 'Animation DJ avec maître de cérémonie, animateur', 'Photographe et vidéaste + Cadeau Booking photo', "Carterie complète en salle : nom table, carte menus, livre d'or, liste des invités et plan de table, tableau de bienvenue", 'Invitation ou bonbonnière ou pot de miel', 'Cadeau urne', 'Mise en beauté complète de la mariée à domicile']],
            'evt-4' => ['pack-or', 'PACK MARIAGE EN OR', 'Service', [...$packReveServices, "CCI Ivato, Sheraton Ivato Hotel 5*, Akany soafenonaka, Novotel, Colannade, Yandy by pass, Dana club, Écrin de Moeva, Espace Rose etc..."]],
            'evt-5' => ['pack-mesure', 'PACK SUR MESURE', 'Service', ["Un pack qui s'adapte à votre budget et vos besoins", "(Tolotra mifanaraka amin'izay toe-bolanareo sy izay fangatahanareo)"]],
            'evt-6' => ['pack-vip', 'PACK VIP SUPRÊME', 'Buffet', [...$packReveServices, 'Chaise Chiavari ou chaise médaillon royal pour les invités', '2 photographes, 2 vidéastes, droniste + Booking photo', 'Clé USB personnalisée', 'Laoka avec dinde ou gisa', 'Tête de cortège très haut de gamme : dodge, mustang, Jeep limousine, Hammer, V8, Range rover, etc... au choix', 'Décoration très chic et personnalisée avec fleur tombante, stickers piste de danse etc...', 'Post wedding', "Feux d'artifice comme cadeau au artiste surprise"]],
        ];

        foreach ($events as $eventData) {
            $event = new Event();
            [$id, $code, $name, $clientId, $clientName, $clientPhone, $date, $startTime, $endTime, $location, $type, $guestCount, $totalPrice, $amountReceived, $status, $coordinator, $assignedServers, $notes, $image] = $eventData;
            [$packId, $packName, $mealType, $includedServices] = $eventPacks[$id];
            $event->setId($id)->setCode($code)->setName($name)->setClientId($clientId)->setClientName($clientName)->setClientPhone($clientPhone)->setDate($date)->setStartTime($startTime)->setEndTime($endTime)->setLocation($location)->setType($type)->setPackId($packId)->setPackName($packName)->setMealType($mealType)->setIncludedServices($includedServices)->setGuestCount($guestCount)->setTotalPrice($totalPrice)->setAmountReceived($amountReceived)->setStatus($status)->setCoordinator($coordinator)->setAssignedServers($assignedServers)->setNotes($notes)->setImage($image);
            $manager->persist($event);
        }

        $reservations = [
            ['res-1', 'RES-2026-089', 'M. Andrianina & Rova', 'Mariage', '2026-11-28', 220, 30000000, '+261 34 88 990 01', 'andrianina.rova@gmail.com', 'En attente', 'Souhaite une visite de salle accompagnée et proposition de pack complet.', '2026-08-30'],
            ['res-2', 'RES-2026-090', 'Famille Andriamihaja', 'Anniversaire', '2026-12-05', 80, 12000000, '+261 33 45 112 23', 'andriamihaja.famille@moov.mg', 'Validée', '60e anniversaire surprise avec thème rétro et groupe live.', '2026-09-01'],
            ['res-3', 'RES-2026-091', 'Haja & Bakoly', 'Mariage', '2026-12-19', 300, 38000000, '+261 32 77 665 54', 'haja.bakoly@gmail.com', 'En attente', 'Demande spéciale : chapiteau cristal transparent et feux d’artifice.', '2026-09-03'],
        ];

        foreach ($reservations as [$id, $code, $clientName, $eventType, $requestedDate, $guestCount, $estimatedBudget, $contactPhone, $contactEmail, $status, $notes, $createdAt]) {
            $reservation = new Reservation();
            $reservation->setId($id)->setCode($code)->setClientName($clientName)->setEventType($eventType)->setRequestedDate($requestedDate)->setGuestCount($guestCount)->setEstimatedBudget($estimatedBudget)->setContactPhone($contactPhone)->setContactEmail($contactEmail)->setStatus($status)->setNotes($notes)->setCreatedAt($createdAt);
            $manager->persist($reservation);
        }

        $appointments = [
            ['apt-1', 'M. Andrianina & Rova', '+261 34 88 990 01', '2026-09-10', '14:30', 'Première consultation', 'Siège Efficiency Wedding — Antanimena', 'À venir', 'Présentation du portfolio vidéo et évaluation des attentes du couple.'],
            ['apt-2', 'Faly Rasoanaivo & Miora', '+261 32 45 678 90', '2026-09-15', '10:00', 'Visite de salle', 'Domaine Manerinerina — Ambohimanga', 'À venir', 'Implantation exacte de la piste de danse et de la tente de repli.'],
            ['apt-3', 'Rado Randriamalala & Fitia', '+261 34 56 789 01', '2026-09-18', '16:00', 'Dégustation & Déco', 'Atelier Efficiency Wedding Décoration', 'À venir', 'Choix final des serviettes, chandeliers et photophores.'],
            ['apt-4', 'M. Hery Rakotoarisoa & Sitraka', '+261 34 12 345 67', '2026-09-08', '15:00', 'Bilan final', 'Carlton Anosy', 'Effectué', 'Répétition du timing du cortège et vérification de la sono.'],
        ];

        foreach ($appointments as [$id, $clientName, $clientPhone, $date, $time, $purpose, $location, $status, $notes]) {
            $appointment = new Appointment();
            $appointment->setId($id)->setClientName($clientName)->setClientPhone($clientPhone)->setDate($date)->setTime($time)->setPurpose($purpose)->setLocation($location)->setStatus($status)->setNotes($notes);
            $manager->persist($appointment);
        }

        $services = [
            ['srv-item-1', 'Organisation Clé en Main & Wedding Planning VIP', 'Organisation & Coordination', 'Accompagnement complet de A à Z : rétroplanning, sélection des meilleurs prestataires malagasy, coordination jour J avec 2 planificateurs dédiés.', 5000000, 'par événement', true, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', ['Rétroplanning budgétaire & administratif complet', 'Sélection et négociation des lieux et prestataires', 'Présence continue de 2 coordinateurs le Jour-J (7h à 4h)', 'Gestion des imprévus et protocole d’accueil des familles'], '6 à 12 mois + Jour J'],
            ['srv-item-2', 'Décoration Scénographique & Art de la Table Prestige', 'Décoration & Art de table', 'Design floral sur-mesure, centres de table hauts avec chandeliers or, arche des mariés monumentale, voilages drapés et vaisselle dorée.', 8500000, 'forfait 200 pers.', true, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', ['Fleurs fraîches naturelles locales (Roses, Lys, Orchidées)', 'Chandeliers baroques dorés & photophores cristal', 'Arche laïque sculptée pour cérémonie ou photobooth', 'Assiettes de présentation bord doré & serviettes satin'], 'Mise en place veille + Jour J'],
            ['srv-item-3', 'Cortège Royal & Location Véhicules de Luxe', 'Cortège & Voitures', 'Limousines blanches, berlines Chrysler 300C, Mercedes Classe E avec chauffeurs professionnels en costume et décoration florale des calandres.', 2800000, 'journée complète', false, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', ['Voiture des mariés avec chauffeur en costume cravate', 'Compositions florales de capot et rubans de cortège', 'Carburant inclus périmètre Grand Antananarivo', 'Rafraîchissements et champagne à bord'], 'Journée complète (10 heures)'],
            ['srv-item-4', 'Sonorisation Haute Définition & Éclairage Architectural', 'Sonorisation & Lumière', 'Système Line-Array, micros sans fil professionnels, projecteurs robotisés asservis, rideaux d’étoiles LED et fumée lourde pour ouverture de bal féerique.', 3800000, 'soirée complète', true, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', ['Système son Line-Array 6000W & régie DJ numérique', 'Micro HF Shure pour discours, chants et Kabary', 'Machine à fumée lourde cryogénique (nuage au sol)', 'Projecteurs asservis lyres beam & wash colorés'], 'Cérémonie, cocktail & soirée dansante'],
            ['srv-item-5', 'Photographie Artistique & Film Cinématique 4K', 'Photographie & Vidéo', '2 photographes + 1 cadreur avec prises de vue aériennes par drone agréé. Livre photo album luxe cuir et film cinématique monté de 25 minutes.', 3200000, 'prestation complète', false, 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80', ['Couverture intégrale avec 2 photographes pro', 'Prises de vue drone 4K HD autorisées', 'Teaser de 3 minutes + Film long métrage 25 minutes', 'Galerie web privée sécurisée + Clé USB en coffret bois'], 'Préparatifs jusqu’à la pièce montée'],
            ['srv-item-6', 'Mobilier Design Chiavari & Chapiteaux Cristal', 'Mobilier & Tentes', 'Chaises transparentes ou dorées Chiavari Napoléon, tables rondes 10 places, tentes transparentes cristal pour réceptions extérieures haut de gamme.', 2200000, 'par lot événement', false, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80', ['Chaises Napoléon / Chiavari or ou cristal avec coussin', 'Tables rondes banquet 180cm & nappage damassé blanc', 'Montage et démontage par l’équipe régie Efficiency', 'Nettoyage et contrôle qualité avant livraison'], 'Location 48h montage/démontage'],
            ['srv-item-7', 'Traiteur Gastronomique & Cocktails d’Honneur Malagasy', 'Traiteur & Cocktails', 'Cocktail déjeunatoire haut de gamme et dîner gastronomique associant saveurs malagasy et haute cuisine internationale (foie gras, zébu braisé, crevettes de Mahajanga).', 6500000, 'forfait 100 pers.', true, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', ['12 pièces cocktail salées et sucrées par convive', 'Plats signature : Zébu braisé au poivre sauvage de Madagascar', 'Service au plateau par maîtres d’hôtel qualifiés', 'Vaisselle complète porcelaine fine & verrerie cristal'], 'Vin d’honneur + Dîner assis'],
            ['srv-item-8', 'Feux d’Artifice & Pyrotechnie Féerique Homologuée', 'Animations & Musique', 'Spectacle pyrotechnique extérieur sécurisé et fontaines d’étincelles froides d’intérieur synchronisées pour l’entrée des mariés et la pièce montée.', 4200000, 'spectacle complet', false, 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80', ['Tir extérieur de 8 minutes avec bouquet final multicolore', '6 machines à étincelles froides d’intérieur (sans fumée)', 'Déclaration légale et artificier certifié sur place', 'Mise en sécurité du périmètre et extincteurs régie'], 'Tirs de 8 à 10 minutes'],
            ['srv-item-9', 'Quartet Acoustique Live & DJ Animateur Bilingue', 'Animations & Musique', 'Ensemble acoustique (voix, violon, guitare, piano) pour la bénédiction nuptiale et vin d’honneur, suivi de notre DJ résident pour embraser la piste.', 2900000, 'journée & soirée', false, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', ['Musiciens professionnels pour la cérémonie religieuse', 'Ambiance lounge jazz / bossa pour le cocktail vin d’honneur', 'DJ animateur expérimenté avec répertoire éclectique', 'Coordination avec le protocole des familles pour les toasts'], 'De l’église à 4h du matin'],
        ];

        foreach ($services as [$id, $name, $category, $description, $unitPrice, $unit, $isPopular, $image, $features, $duration]) {
            $service = new Service();
            $service->setId($id)->setName($name)->setCategory($category)->setDescription($description)->setUnitPrice($unitPrice)->setUnit($unit)->setIsPopular($isPopular)->setImage($image)->setFeatures($features)->setDuration($duration);
            $manager->persist($service);
        }

        $tasks = [
            ['tsk-1', 'evt-1', 'Mariage Princier Hery & Sitraka', 'Validation de l’implantation des tables au Carlton', 'Vérifier l’espacement entre les rangées et le passage de la robe longue de la mariée.', 'Miora Randria', '2026-09-09', 'Haute', 'En cours'],
            ['tsk-2', 'evt-1', 'Mariage Princier Hery & Sitraka', 'Briefing brigade serveurs et tenue vestimentaire', 'Uniforme noir & noeud papillon or repassé, contrôle des gants blancs.', 'Jean-Luc Rakotozafy', '2026-09-11', 'Haute', 'À faire'],
            ['tsk-3', 'evt-2', 'Mariage Champêtre Chic Faly & Miora', 'Test sono et éclairage guinguette au Domaine Manerinerina', 'Vérifier la puissance du groupe électrogène de secours en cas de délestage.', 'Tahina Andriam', '2026-09-24', 'Haute', 'À faire'],
            ['tsk-4', 'evt-4', 'Mariage Glamour Rado & Fitia', 'Réservation et vérification technique des 2 Chrysler', 'Contrôler la propreté intérieure, la climatisation et les rubans.', 'Tahina Andriam', '2026-10-15', 'Moyenne', 'À faire'],
            ['tsk-5', null, null, 'Inventaire matériel de décoration et vérification des chandeliers', 'Nettoyage et polissage des chandeliers dorés en réserve Antanimena.', 'Arnaud Rabe', '2026-09-14', 'Moyenne', 'En cours'],
            ['tsk-6', null, null, 'Préparation des fiches de paie pour l’équipe permanente', 'Vérifier les pointages et calculer les primes de performance de septembre.', 'Santatra Razanadahy', '2026-09-28', 'Moyenne', 'À faire'],
        ];

        foreach ($tasks as [$id, $eventId, $eventName, $title, $description, $assignedTo, $dueDate, $priority, $status]) {
            $task = new TaskItem();
            $task->setId($id)->setEventId($eventId)->setEventName($eventName)->setTitle($title)->setDescription($description)->setAssignedTo($assignedTo)->setDueDate($dueDate)->setPriority($priority)->setStatus($status);
            $manager->persist($task);
        }

        $quotes = [
            ['dev-1', 'DEV-2026-042', 'M. Hery Rakotoarisoa & Sitraka', 'Mariage Princier Hery & Sitraka', '2026-07-10', '2026-08-10', 32000000, 'Accepté', [['description' => 'Organisation & Wedding Planning Global VIP', 'quantity' => 1, 'unitPrice' => 5000000, 'total' => 5000000], ['description' => 'Décoration Scénographique & Fleurs fraîches d’Anosibe', 'quantity' => 1, 'unitPrice' => 11500000, 'total' => 11500000], ['description' => 'Cortège Limousine & Berline de suite', 'quantity' => 1, 'unitPrice' => 3500000, 'total' => 3500000], ['description' => 'Sonorisation Line Array & Éclairage robotisé', 'quantity' => 1, 'unitPrice' => 4800000, 'total' => 4800000], ['description' => 'Brigade 12 serveurs avec maître d’hôtel', 'quantity' => 1, 'unitPrice' => 3200000, 'total' => 3200000], ['description' => 'Effets spéciaux : Fumée lourde & Jet d’étincelles froides', 'quantity' => 1, 'unitPrice' => 4000000, 'total' => 4000000]]],
            ['dev-2', 'DEV-2026-043', 'Faly Rasoanaivo & Miora', 'Mariage Champêtre Chic Faly & Miora', '2026-07-22', '2026-08-22', 26500000, 'Accepté', [['description' => 'Coordination jour J et rétroplanning', 'quantity' => 1, 'unitPrice' => 4000000, 'total' => 4000000], ['description' => 'Décoration champêtre chic & Arche végétale', 'quantity' => 1, 'unitPrice' => 9500000, 'total' => 9500000], ['description' => 'Location mobilier & chaises Chiavari dorées', 'quantity' => 200, 'unitPrice' => 25000, 'total' => 5000000], ['description' => 'Sonorisation & mise en lumière du domaine', 'quantity' => 1, 'unitPrice' => 4500000, 'total' => 4500000], ['description' => 'Service en salle : Brigade 8 serveurs', 'quantity' => 1, 'unitPrice' => 3500000, 'total' => 3500000]]],
            ['dev-3', 'DEV-2026-044', 'M. Andrianina & Rova', 'Mariage Tout Compris Novembre', '2026-08-29', '2026-09-29', 29500000, 'Envoyé', [['description' => 'Pack Mariage Royal All-Inclusive 220 personnes', 'quantity' => 1, 'unitPrice' => 29500000, 'total' => 29500000]]],
        ];

        foreach ($quotes as [$id, $quoteNumber, $clientName, $eventName, $date, $validUntil, $totalAmount, $status, $items]) {
            $quote = new Quote();
            $eventId = $id === 'dev-1' ? 'evt-1' : ($id === 'dev-2' ? 'evt-2' : null);
            $quote->setId($id)->setQuoteNumber($quoteNumber)->setVersion(1)->setEventId($eventId)->setCreatedAt($date.'T00:00:00Z')->setUpdatedAt($date.'T00:00:00Z')->setClientName($clientName)->setEventName($eventName)->setDate($date)->setValidUntil($validUntil)->setTotalAmount($totalAmount)->setStatus($status)->setItems($items);
            $manager->persist($quote);
        }

        $invoices = [
            ['fac-1', 'FAC-2026-031', 'M. Hery Rakotoarisoa & Sitraka', 'Mariage Princier Hery & Sitraka', '2026-08-01', '2026-09-12', 32000000, 24000000, 'Partiellement payée', [['description' => 'Pack Mariage Princier & Décoration Scénographique', 'quantity' => 1, 'unitPrice' => 32000000, 'total' => 32000000]]],
            ['fac-2', 'FAC-2026-032', 'Faly Rasoanaivo & Miora', 'Mariage Champêtre Chic Faly & Miora', '2026-08-10', '2026-09-26', 26500000, 18500000, 'Partiellement payée', [['description' => 'Pack Champêtre Chic & Mobilier Chiavari', 'quantity' => 1, 'unitPrice' => 26500000, 'total' => 26500000]]],
            ['fac-3', 'FAC-2026-033', 'Dr. Patrick Razafindrakoto & Vololona', 'Anniversaire 50 ans Jubilé Dr. Patrick', '2026-08-15', '2026-08-22', 16000000, 16000000, 'Payée', [['description' => 'Prestation complète Jubilé 50 ans VIP', 'quantity' => 1, 'unitPrice' => 16000000, 'total' => 16000000]]],
        ];

        foreach ($invoices as [$id, $invoiceNumber, $clientName, $eventName, $date, $dueDate, $totalAmount, $paidAmount, $status, $items]) {
            $invoice = new Invoice();
            $invoice->setId($id)->setInvoiceNumber($invoiceNumber)->setClientName($clientName)->setEventName($eventName)->setDate($date)->setDueDate($dueDate)->setTotalAmount($totalAmount)->setPaidAmount($paidAmount)->setStatus($status)->setItems($items);
            $manager->persist($invoice);
        }

        $equipment = [
            ['equipment-1', 'Chaises Chiavari dorées', 'Mobilier', 200, 180, 'Excellent', 15000, 'Entrepôt Antanimena'],
            ['equipment-2', 'Tables rondes 180cm', 'Mobilier', 65, 60, 'Bon', 12000, 'Dépôt Centre'],
            ['equipment-3', 'Projecteurs LED wash', 'Lumière', 18, 16, 'Excellent', 220000, 'Magasin Régie'],
            ['equipment-4', 'Machine à fumée', 'Lumière', 4, 3, 'Bon', 650000, 'Atelier Son'],
        ];

        foreach ($equipment as [$id, $name, $category, $quantity, $availableQuantity, $condition, $unitPrice, $location]) {
            $item = new EquipmentItem();
            $item->setId($id)->setName($name)->setCategory($category)->setQuantity($quantity)->setAvailableQuantity($availableQuantity)->setCondition($condition)->setUnitPrice($unitPrice)->setLocation($location);
            $manager->persist($item);
        }

        $receipts = [
            ['rec-1', 'REC-2026-001', '2026-08-01', 'M. Hery Rakotoarisoa & Sitraka', 'evt-1', 'Mariage Princier Hery & Sitraka', 'Premier acompte (50%) à la signature du contrat', 'Acompte', 16000000, 'Virement bancaire', 'Reçu via BNI Madagascar Ref: BNIM-94821'],
            ['rec-2', 'REC-2026-002', '2026-08-20', 'M. Hery Rakotoarisoa & Sitraka', 'evt-1', 'Mariage Princier Hery & Sitraka', 'Deuxième versement intermédiaire', 'Paiement événement', 8000000, 'Virement bancaire', 'Validation de la tranche décoration florale'],
            ['rec-3', 'REC-2026-003', '2026-08-10', 'Faly Rasoanaivo & Miora', 'evt-2', 'Mariage Champêtre Chic Faly & Miora', 'Acompte de confirmation de date et réservation salle', 'Acompte', 13000000, 'Mobile Money', 'MVola Réf: 0344567890-TX923'],
            ['rec-4', 'REC-2026-004', '2026-08-28', 'Faly Rasoanaivo & Miora', 'evt-2', 'Mariage Champêtre Chic Faly & Miora', 'Paiement complémentaire pack lumières et guirlandes', 'Prestation', 5500000, 'Espèces', 'Reçu en mains propres à l’agence Antanimena'],
            ['rec-5', 'REC-2026-005', '2026-08-15', 'Tojo Ramanantsoa & Haingo', 'evt-3', 'Vodiondry Traditionnel Tojo & Haingo', 'Acompte organisation et sonorisation Vodiondry', 'Acompte', 10000000, 'Mobile Money', 'Orange Money Réf: OM-881920'],
            ['rec-6', 'REC-2026-006', '2026-08-25', 'Rado Randriamalala & Fitia', 'evt-4', 'Mariage Glamour Rado & Fitia', 'Acompte 70% pour réservation cortège et décoration prestige', 'Acompte', 20000000, 'Virement bancaire', 'BMOI Antananarivo - Virement validé'],
            ['rec-7', 'REC-2026-007', '2026-08-05', 'Dr. Patrick Razafindrakoto & Vololona', 'evt-5', 'Gala Prestige & Cocktail Entreprise', 'Acompte initial de réservation de date', 'Acompte', 15000000, 'Virement bancaire', 'Société Générale Madagasikara'],
            ['rec-8', 'REC-2026-008', '2026-08-22', 'Dr. Patrick Razafindrakoto & Vololona', 'evt-6', 'Anniversaire 50 ans Jubilé Dr. Patrick', 'Solde final de l’anniversaire', 'Solde événement', 16000000, 'Virement bancaire', 'Paiement intégral soldé'],
        ];

        foreach ($receipts as [$id, $number, $date, $client, $eventId, $eventName, $description, $category, $amount, $paymentMethod, $comment]) {
            $receipt = new FinanceReceipt();
            $receipt->setId($id)->setNumber($number)->setDate($date)->setClient($client)->setEventId($eventId)->setEventName($eventName)->setDescription($description)->setCategory($category)->setAmount($amount)->setPaymentMethod($paymentMethod)->setComment($comment);
            $manager->persist($receipt);
        }

        $expenses = [
            ['exp-1', 'DEP-2026-001', '2026-08-12', 'Aliments', 'Achat viandes fines, saumon et produits frais traiteur', 'Boucherie & Vivres Frais Mahamasina', 'evt-1', 'Mariage Princier Hery & Sitraka', 3200000, 'Virement bancaire', 'Fourniture ingrédients premier choix'],
            ['exp-2', 'DEP-2026-002', '2026-08-14', 'Décoration', 'Roses blanches fraîches d’Anosibe, orchidées et feuillages', 'Fleuriste Grossiste Anosibe', 'evt-1', 'Mariage Princier Hery & Sitraka', 1850000, 'Espèces', 'Pour centres de table et arche d’honneur'],
            ['exp-3', 'DEP-2026-003', '2026-08-18', 'Transport', 'Location 2 berlines de prestige avec chauffeurs en livrée', 'Madagascar Prestige Cars Ambohibao', 'evt-1', 'Mariage Princier Hery & Sitraka', 1400000, 'Virement bancaire', 'Cortège mariés et parents'],
            ['exp-4', 'DEP-2026-004', '2026-08-22', 'Aliments', 'Boissons vins de prestige, champagnes et cocktails de bienvenue', 'Cave & Boissons Madagascar Ankorondrano', 'evt-2', 'Mariage Champêtre Chic Faly & Miora', 2500000, 'Virement bancaire', 'Stock boissons scellées pour le domaine'],
            ['exp-5', 'DEP-2026-005', '2026-08-24', 'Matériel', 'Location 200 chaises médaillon dorées et nappage soyeux', 'Location Événements Madagascar Alarobia', 'evt-2', 'Mariage Champêtre Chic Faly & Miora', 1600000, 'Mobile Money', 'Caution comprise et matériel vérifié'],
            ['exp-6', 'DEP-2026-006', '2026-08-26', 'Décoration', 'Rubans traditionnels en lamba landy, paniers tissés et fleurs', 'Artisans Déco Malagasy Mahamasina', 'evt-3', 'Vodiondry Traditionnel Tojo & Haingo', 950000, 'Espèces', 'Décoration sur-mesure pour Vodiondry'],
            ['exp-7', 'DEP-2026-007', '2026-08-29', 'Aliments', 'Buffet gourmand et canapés traiteur Vodiondry', 'Traiteur Gourmand Antanimena', 'evt-3', 'Vodiondry Traditionnel Tojo & Haingo', 1800000, 'Mobile Money', 'Service buffet chaud et froid'],
            ['exp-8', 'DEP-2026-008', '2026-08-27', 'Décoration', 'Rideaux lumineux LED, lustres cristal et éléments or', 'DecoLux Madagascar Andraharo', 'evt-4', 'Mariage Glamour Rado & Fitia', 2200000, 'Virement bancaire', 'Installation la veille à Ambohimanambola'],
            ['exp-9', 'DEP-2026-009', '2026-08-30', 'Carburant', 'Carburant camions régie logistique et navettes staff', 'Station TotalEnergies Ankorondrano', null, null, 650000, 'Espèces', 'Frais généraux du mois d’août'],
            ['exp-10', 'DEP-2026-010', '2026-08-31', 'Salaires', 'Virement global salaires de l’équipe permanente - Août 2026', 'Personnel Efficiency Wedding', null, null, 5250000, 'Virement bancaire', 'Comptabilisation automatique de la masse salariale mensuelle'],
        ];

        foreach ($expenses as [$id, $number, $date, $category, $description, $supplier, $eventId, $eventName, $amount, $paymentMethod, $comment]) {
            $expense = new FinanceExpense();
            $expense->setId($id)->setNumber($number)->setDate($date)->setCategory($category)->setDescription($description)->setSupplier($supplier)->setEventId($eventId)->setEventName($eventName)->setAmount($amount)->setPaymentMethod($paymentMethod)->setComment($comment);
            $manager->persist($expense);
        }

        $salaries = [
            ['sal-1', 'Miora Randria', 'Coordinatrice Principale & Lead Planner', 'Août 2026', 1400000, 200000, 0, 1600000, '2026-08-31', 'Payé', 'Prime pour satisfaction exceptionnelle Mariage Hery & Sitraka'],
            ['sal-2', 'Arnaud Rabe', 'Directeur Artistique & Scénographe', 'Août 2026', 1200000, 150000, 0, 1350000, '2026-08-31', 'Payé', 'Prime création nouvelle arche lumineuse'],
            ['sal-3', 'Tahina Andriam', 'Responsable Régie & Logistique', 'Août 2026', 1000000, 100000, 0, 1100000, '2026-08-31', 'Payé', 'Gestion parfaite des navettes et du matériel'],
            ['sal-4', 'Rivo Rakotomalala', 'Maître d’Hôtel & Superviseur de Salle', 'Août 2026', 850000, 50000, 0, 900000, '2026-08-31', 'Payé', 'Encadrement brigade de 10 serveurs'],
            ['sal-5', 'Santatra Razanadahy', 'Assistante Administrative & Accueil', 'Août 2026', 700000, 50000, 0, 750000, '2026-08-31', 'Payé', 'Suivi des devis et relances clients'],
            ['sal-6', 'Miora Randria', 'Coordinatrice Principale & Lead Planner', 'Septembre 2026', 1400000, 150000, 0, 1550000, '2026-09-30', 'À payer', 'Échéance fin septembre'],
            ['sal-7', 'Arnaud Rabe', 'Directeur Artistique & Scénographe', 'Septembre 2026', 1200000, 100000, 0, 1300000, '2026-09-30', 'À payer', 'Échéance fin septembre'],
            ['sal-8', 'Tahina Andriam', 'Responsable Régie & Logistique', 'Septembre 2026', 1000000, 80000, 0, 1080000, '2026-09-30', 'À payer', 'Échéance fin septembre'],
        ];

        foreach ($salaries as [$id, $employeeName, $role, $month, $baseSalary, $bonus, $deduction, $netPaid, $paymentDate, $status, $comment]) {
            $salary = new SalaryRecord();
            $salary->setId($id)->setEmployeeName($employeeName)->setRole($role)->setMonth($month)->setBaseSalary($baseSalary)->setBonus($bonus)->setDeduction($deduction)->setNetPaid($netPaid)->setPaymentDate($paymentDate)->setStatus($status)->setComment($comment);
            $manager->persist($salary);
        }

        $manager->flush();
    }

    private function loadReferenceData(ObjectManager $manager): void
    {
        $this->loadPricingPacks($manager);
        $this->loadRoles($manager);
        $this->loadUsers($manager);
        $this->loadAgencySettings($manager);
        $this->loadTeamData($manager);
        $this->loadPlacesAndTeams($manager);
    }

    private function loadPricingPacks(ObjectManager $manager): void
    {
        $dreamItems = [
            "Lieu de réception : en salle ou champêtre au choix (Ny Akaminaka, Espace Myrah, Espace Ravaka, Vohimana, Villa Sirilus, Callistemon, espace Fanitra, Matohota, Sahan'ny nofy, Ravato, Palm city Ivato, Anthurium espace etc...",
            'Décoration CHIC selon thème et code couleur de la salle de réception ou champêtre',
            'Décoration église',
            'Tête de cortège au choix avec déco et carburant',
            'Menu complet au choix avec traiteur bien réputé et qualifié parmi les meilleurs',
            'Boisson hygiénique et champagne',
            'Gâteaux de style au choix',
            'Cocktail de bienvenue',
            'Sonorisation avec lumière et effets spéciaux complet',
            'Orchestre complet avec maître de cérémonie professionnel',
            'Photographe et vidéaste avec 1 drone',
            'Cadeau Booking photo et livraison sur clé USB',
            'Robe de la mariée avec accessoire complet',
            'Costard marié en 3 pièces',
            "Carterie complète en salle et église : nom table, carte menus, livre d'or, liste des invités et plan de table, tableau de bienvenue",
            'Mise en beauté complète de la mariée à domicile',
            'Bonbonnière ou pot de miel, invitation, cadeau urne',
        ];
        $goldGrid = [
            'headers' => ['100 PERS.', '150 PERS.', '200 PERS.', '250 PERS.', '300 PERS.', '500 PERS.'],
            'rows' => [
                ['label' => 'Servis', 'values' => [14000000, 17500000, 20000000, 25000000, 30000000, 40000000]],
                ['label' => 'Semi-buffet', 'values' => [15500000, 19000000, 22000000, 30000000, 35000000, 45000000]],
                ['label' => 'Buffet', 'values' => [17500000, 20000000, 28000000, 35000000, 38000000, 49000000]],
            ],
        ];
        $dreamGrid = [
            'headers' => ['100 PERS.', '150 PERS.', '200 PERS.', '250 PERS.', '300 PERS.', '350 PERS.', '500 PERS.'],
            'rows' => [
                ['label' => 'Servis', 'values' => [14000000, 17500000, 20000000, 25000000, 30000000, 35000000, 40000000]],
                ['label' => 'Semi-buffet', 'values' => [15500000, 19000000, 22000000, 30000000, 35000000, 40000000, 45000000]],
                ['label' => 'Buffet', 'values' => [17500000, 20000000, 28000000, 35000000, 38000000, 45000000, 49000000]],
            ],
        ];
        $packs = [
            ['pack-reve', 'Mariage', 'PACK MARIAGE DE RÊVE A à Z', 'Cadeaux voyage de noces au bord de la mer. Une formule complète pour un mariage intime et prestigieux.', 'Populaire', true, 14000000, null, null, $dreamItems, $dreamGrid, null],
            ['pack-or', 'Mariage', 'PACK MARIAGE EN OR', "Toute prestation dans Pack Mariage de Rêve avec espaces d'or très luxueux selon votre choix.", null, false, 4000000, 'pack-reve', "Toute prestation dans Pack Mariage de Rêve avec espaces d'or très luxueux selon votre choix.", ["CCI Ivato, Sheraton Ivato Hotel 5*, Akany soafenonaka, Novotel, Colannade, Yandy by pass, Dana club, Écrin de Moeva, Espace Rose etc..."], $goldGrid, 'PRIX DU PACK : Montant total pack mariage de rêve + Rajout 4 000 000 Ariary EN SUS'],
            ['pack-vip', 'Mariage', 'PACK VIP SUPRÊME', 'Toute prestation dans Pack Mariage de Rêve avec espaces VIP comme Au bois vert Ivato, Mahitantsoa, Naturia, Tana Palm etc...', 'Le Plus Demandé', true, 5000000, 'pack-reve', 'Toute prestation dans Pack Mariage de Rêve avec espaces VIP comme Au bois vert Ivato, Mahitantsoa, Naturia, Tana Palm etc...', ['Chaise Chiavari ou chaise médaillon royal pour les invités', '2 photographes, 2 vidéastes, droniste + Booking photo', 'Clé USB personnalisée', 'Laoka avec dinde ou gisa', 'Tête de cortège très haut de gamme : dodge, mustang, Jeep limousine, Hammer, V8, Range rover, etc... au choix', 'Décoration très chic et personnalisée avec fleur tombante, stickers piste de danse etc...', 'Post wedding', "Feux d'artifice comme cadeau au artiste surprise"], $goldGrid, 'PRIX PACK VIP SUPRÊME : Montant total pack mariage de rêve + Rajout 5 000 000 Ariary EN SUS'],
            ['pack-vodionory', 'Fiançailles', 'PACK VODIONORY / FIANÇAILLE DU MARIAGE', 'Cadeaux dîner aux chandelles dans un hôtel. Une formule complète pour les fiançailles.', null, false, 8000000, null, null, ['Lieu de réception : en salle et champêtre au choix', 'Décoration selon thème et code couleur de la salle de réception et plein air', 'Mikabary malagasy matinina 2', 'Menu complet au choix avec traiteur bien réputé et qualifié parmi les meilleurs', 'Boisson hygiénique et champagne', 'Gâteaux de style au choix', 'Cocktail de bienvenue', 'Lumière et effets spéciaux complet : bulle, fumigène, confetti, pyrotechnie', 'Animation DJ avec maître de cérémonie, animateur', 'Photographe et vidéaste + Cadeau Booking photo', "Carterie complète en salle : nom table, carte menus, livre d'or, liste des invités et plan de table, tableau de bienvenue", 'Invitation ou bonbonnière ou pot de miel', 'Cadeau urne', 'Mise en beauté complète de la mariée à domicile'], ['headers' => ['50 PERS.', '80 PERS.', '100 PERS.', '150 PERS.', '200 PERS.'], 'rows' => [['label' => 'Servis', 'values' => [8000000, 11000000, 12500000, 16500000, 18500000]], ['label' => 'Semi-buffet', 'values' => [10000000, 12500000, 13500000, 17500000, 22000000]], ['label' => 'Buffet', 'values' => [11000000, 13000000, 14500000, 18500000, 25000000]]]], null],
            ['pack-mesure', 'Sur Mesure', 'PACK SUR MESURE', "Un pack qui s'adapte à votre budget et vos besoins.", null, false, 0, null, null, ["Un pack qui s'adapte à votre budget et vos besoins", "(Tolotra mifanaraka amin'izay toe-bolanareo sy izay fangatahanareo)"], null, 'Contactez-nous pour une étude personnalisée.'],
        ];

        foreach ($packs as [$id, $category, $name, $description, $badge, $popular, $basePrice, $referencePackId, $referenceText, $includedItems, $pricingGrid, $extraInfo]) {
            if ($manager->getRepository(PricingPack::class)->find($id)) continue;
            $pack = (new PricingPack())->setId($id)->setCategory($category)->setName($name)->setDescription($description)->setBadge($badge)->setPopular($popular)->setBasePrice($basePrice)->setReferencePackId($referencePackId)->setReferenceText($referenceText)->setIncludedItems($includedItems)->setPricingGrid($pricingGrid)->setExtraInfo($extraInfo);
            $manager->persist($pack);
        }
    }

    private function loadRoles(ObjectManager $manager): void
    {
        $modules = ['dashboard', 'events', 'clients', 'services', 'pricing', 'tasks', 'quotes', 'invoices', 'payments', 'finances', 'planning', 'team', 'statistics', 'users', 'settings'];
        $roles = [
            ['admin', 'Administrateur', 'Accès complet à la plateforme.', 'amber', true, $modules, true],
            ['manager', 'Manager événementiel', 'Gestion des événements et des opérations.', 'blue', true, ['dashboard', 'events', 'clients', 'services', 'pricing', 'tasks', 'quotes', 'planning', 'team', 'statistics'], false],
            ['finance', 'Responsable financier', 'Gestion des devis, factures, paiements et finances.', 'emerald', true, ['dashboard', 'clients', 'pricing', 'quotes', 'invoices', 'payments', 'finances', 'statistics'], false],
            ['staff', 'Personnel', 'Accès aux tâches, événements et planning assignés.', 'violet', true, ['dashboard', 'events', 'services', 'tasks', 'planning'], false],
        ];

        foreach ($roles as [$id, $name, $description, $color, $system, $allowedModules, $full]) {
            if ($manager->getRepository(AccessRole::class)->find($id)) continue;
            $permissions = [];
            foreach ($modules as $module) {
                $allowed = in_array($module, $allowedModules, true);
                $permissions[$module] = ['view' => $allowed, 'create' => $allowed && $full, 'edit' => $allowed && $full, 'delete' => $allowed && $full];
            }
            $role = (new AccessRole())->setId($id)->setName($name)->setDescription($description)->setColor($color)->setSystem($system)->setPermissions($permissions);
            $manager->persist($role);
        }
    }

    private function loadUsers(ObjectManager $manager): void
    {
        $users = [
            ['USR-001', 'Miora Randria', 'miora@efficiencywedding.mg', '+261 34 00 000 01', 'admin', 'active'],
            ['USR-002', 'Jean Rakoto', 'jean@efficiencywedding.mg', '+261 34 00 000 02', 'manager', 'active'],
            ['USR-003', 'Sarah Andria', 'sarah@efficiencywedding.mg', '+261 34 00 000 03', 'finance', 'active'],
            ['USR-004', 'Paul Rabe', 'paul@efficiencywedding.mg', '+261 34 00 000 04', 'staff', 'active'],
            ['USR-005', 'Hery Rakoto', 'hery@efficiencywedding.mg', '+261 34 00 000 05', 'manager', 'inactive'],
            ['USR-006', 'Nadia Andriam', 'nadia@efficiencywedding.mg', '+261 34 00 000 06', 'staff', 'active'],
        ];

        foreach ($users as [$id, $name, $email, $phone, $role, $status]) {
            if ($manager->getRepository(User::class)->find($id)) continue;
            $user = (new User())->setId($id)->setName($name)->setEmail($email)->setPhone($phone)->setRole($role)->setStatus($status);
            $manager->persist($user);
        }
    }

    private function loadAgencySettings(ObjectManager $manager): void
    {
        if ($manager->getRepository(AgencySettings::class)->find('main')) return;
        $settings = (new AgencySettings())->setId('main')->setAgencyName('Efficiency Wedding Madagascar')->setAddress('Ankorondrano, Antananarivo 101, Madagascar')->setPhone('+261 34 00 000 00')->setEmail('contact@efficiencywedding.mg')->setNif('4002819201')->setStat('82300 11 2019 0 00412')->setCurrency('Ariary (Ar / MGA)');
        $manager->persist($settings);
    }

    private function loadTeamData(ObjectManager $manager): void
    {
        $members = [
            ['tm-1', 'Miora Randria', 'Fondatrice & Directrice Générale', 'Direction & Wedding Planning', '+261 34 11 000 01', 'direction@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', null],
            ['tm-2', 'Arnaud Rabe', 'Directeur Artistique & Designer Scénographe', 'Décoration & Art de table', '+261 34 22 000 02', 'design@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', null],
            ['tm-3', 'Tahina Andriam', 'Chef Régie & Responsable Logistique', 'Logistique, Flotte & Transport', '+261 34 33 000 03', 'logistique@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', null],
            ['tm-4', 'Santatra Razanadahy', 'Responsable Relation Clients & Devis', 'Administration & Facturation', '+261 34 44 000 04', 'contact@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', null],
            ['tm-5', 'Rivo Rakotomalala', 'Maître d’Hôtel & Superviseur de Salle', 'Opérations & Service', '+261 33 52 000 05', 'rivo.supervision@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', null],
            ['tm-6', 'Lova Razafindramboa', 'Coordinatrice Événementielle', 'Wedding Planning & Coordination', '+261 34 63 000 06', 'lova.planning@efficiencywedding.mg', 'Actif', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80', null],
        ];
        foreach ($members as [$id, $name, $role, $department, $phone, $email, $status, $avatar, $salary]) {
            if ($manager->getRepository(TeamMember::class)->find($id)) continue;
            $member = (new TeamMember())->setId($id)->setName($name)->setRole($role)->setDepartment($department)->setPhone($phone)->setEmail($email)->setStatus($status)->setAvatar($avatar)->setMonthlySalary($salary);
            $manager->persist($member);
        }

        $servers = [
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
        foreach ($servers as [$id, $name, $phone, $role, $status, $rate, $assigned, $rating]) {
            if ($manager->getRepository(ServerStaff::class)->find($id)) continue;
            $server = (new ServerStaff())->setId($id)->setName($name)->setPhone($phone)->setRole($role)->setStatus($status)->setHourlyRate($rate)->setAssignedEventsCount($assigned)->setRating($rating);
            $manager->persist($server);
        }

        $profiles = [
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
        foreach ($profiles as [$id, $type, $department, $experience, $skills, $hireDate, $availability, $teamIds, $eventIds, $notes, $languages, $emergencyContact]) {
            if ($manager->getRepository(EmployeeProfile::class)->find($id)) continue;
            $profile = (new EmployeeProfile())->setId($id)->setEmployeeType($type)->setDepartment($department)->setExperience($experience)->setSkills($skills)->setHireDate($hireDate)->setAvailability($availability)->setTeamIds($teamIds)->setAssignedEventIds($eventIds)->setNotes($notes)->setLanguages($languages)->setEmergencyContact($emergencyContact);
            $manager->persist($profile);
        }
    }

    private function loadPlacesAndTeams(ObjectManager $manager): void
    {
        $places = [
            ['fixture-place-ravinala', 'Carlton Anosy — Salle Ravinala, Antananarivo', 'Salle', 'Anosy', 'Antananarivo', 'Anosy', -18.915, 47.516, 300, 1800000, '+261 34 00 000 01', 'Salle de réception adaptée aux mariages et événements professionnels.', ['Parking', 'Cuisine', 'Toilettes', 'Électricité', 'Climatisation']],
            ['fixture-place-manerinerina', 'Domaine Manerinerina, Ambohimanga Rova', 'Domaine', 'Ambohimanga Rova', 'Antananarivo', 'Ambohimanga', -18.76, 47.56, 400, 2200000, '+261 34 00 000 02', 'Domaine avec jardin pour les réceptions et événements en plein air.', ['Parking', 'Cuisine', 'Toilettes', 'Électricité', 'Jardin', 'Sonorisation']],
            ['fixture-place-yandi', 'Espace Yandi By-Pass, Antananarivo', 'Salle', 'By-Pass', 'Antananarivo', 'By-Pass', -18.95, 47.55, 250, 1200000, '+261 34 00 000 03', 'Espace modulable pour cérémonies, réceptions et événements privés.', ['Parking', 'Toilettes', 'Électricité', 'Sécurité']],
        ];
        foreach ($places as [$id, $name, $type, $address, $city, $district, $latitude, $longitude, $capacity, $price, $phone, $description, $amenities]) {
            if ($manager->getRepository(Place::class)->find($id)) continue;
            $place = (new Place())->setId($id)->setName($name)->setType($type)->setAddress($address)->setCity($city)->setDistrict($district)->setLatitude($latitude)->setLongitude($longitude)->setCapacity($capacity)->setPricePerDay($price)->setPhone($phone)->setEmail('')->setWebsite('')->setDescription($description)->setAmenities($amenities)->setMainImage('')->setGallery([])->setStatus('Disponible');
            $manager->persist($place);
        }

        $teams = [
            ['team-planning', 'Équipe Planning & Coordination', 'Pilotage des clients, planning, coordination jour J et suivi des prestataires.', 'Planning', 'tm-1', ['tm-1', 'tm-4', 'tm-6'], ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-6'], 'Affectée', 'amber', 'Équipe principale de coordination des mariages.'],
            ['team-service', 'Brigade Service & Salle', 'Maîtres d’hôtel, chefs de rang et serveurs pour le service en salle.', 'Service', 'tm-5', ['tm-5', 'srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-6', 'srv-7', 'srv-8', 'srv-9'], ['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6'], 'Affectée', 'blue', 'Brigade modulable selon le nombre d’invités.'],
            ['team-logistics', 'Équipe Logistique & Régie', 'Transport, installation, matériel, régie et coordination technique.', 'Logistique', 'tm-3', ['tm-3'], ['evt-1', 'evt-2', 'evt-4', 'evt-5'], 'Affectée', 'emerald', 'Renforts externes possibles selon les besoins techniques.'],
            ['team-decoration', 'Équipe Décoration & Scénographie', 'Direction artistique, décoration, fleurs, art de table et installation visuelle.', 'Décoration', 'tm-2', ['tm-2'], ['evt-1', 'evt-2', 'evt-4'], 'Affectée', 'purple', 'Travaille à partir du brief client et du moodboard validé.'],
            ['team-cocktail', 'Équipe Cocktail & Bar', 'Cocktails d’accueil, bar, boissons et gestion du poste cocktail.', 'Cocktail', 'srv-5', ['srv-5', 'srv-4'], ['evt-1', 'evt-4', 'evt-6'], 'Affectée', 'rose', 'Renfort possible avec des serveurs polyvalents.'],
        ];
        foreach ($teams as [$id, $name, $description, $specialization, $leaderId, $memberIds, $eventIds, $status, $color, $notes]) {
            $team = $manager->getRepository(EventTeam::class)->find($id) ?? (new EventTeam())->setId($id);
            $team->setName($name)->setDescription($description)->setSpecialization($specialization)->setLeaderId($leaderId)->setMemberIds($memberIds)->setAssignedEventIds($eventIds)->setStatus($status)->setColor($color)->setNotes($notes);
            $manager->persist($team);
        }
    }
}
