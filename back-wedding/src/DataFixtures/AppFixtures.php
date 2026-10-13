<?php

namespace App\DataFixtures;

use App\Entity\Appointment;
use App\Entity\Client;
use App\Entity\EquipmentItem;
use App\Entity\Event;
use App\Entity\FinanceExpense;
use App\Entity\FinanceReceipt;
use App\Entity\Invoice;
use App\Entity\Quote;
use App\Entity\Reservation;
use App\Entity\SalaryRecord;
use App\Entity\Service;
use App\Entity\TaskItem;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
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
}
