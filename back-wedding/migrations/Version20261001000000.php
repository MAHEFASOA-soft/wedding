<?php

namespace DoctrineMigrations;

use Doctrine\DBAL\ParameterType;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Doctrine\Migrations\AbstractMigration;

final class Version20261001000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Persiste les packs et grilles tarifaires actuellement utilisés par le catalogue';
    }

    public function up(Schema $schema): void
    {
        $tableExists = $this->connection->createSchemaManager()->tablesExist(['pricing_pack']);
        if (!$tableExists) {
            $table = new Table('pricing_pack');
            $table->addColumn('id', 'string', ['length' => 64]);
            $table->addColumn('category', 'string', ['length' => 120]);
            $table->addColumn('name', 'string', ['length' => 255]);
            $table->addColumn('description', 'text');
            $table->addColumn('badge', 'string', ['length' => 255, 'notnull' => false]);
            $table->addColumn('popular', 'boolean', ['default' => false]);
            $table->addColumn('base_price', 'bigint');
            $table->addColumn('reference_pack_id', 'string', ['length' => 64, 'notnull' => false]);
            $table->addColumn('reference_text', 'text', ['notnull' => false]);
            $table->addColumn('included_items', 'json');
            $table->addColumn('pricing_grid', 'json', ['notnull' => false]);
            $table->addColumn('extra_info', 'text', ['notnull' => false]);
            
            $table->setPrimaryKey(['id']);
            $table->addIndex(['reference_pack_id'], 'IDX_PRICING_PACK_REFERENCE');
            foreach ($this->connection->getDatabasePlatform()->getCreateTableSQL($table) as $sql) {
                $this->addSql($sql);
            }
        }

        foreach ($this->initialPacks() as $pack) {
            if ($tableExists && $this->connection->fetchOne('SELECT id FROM pricing_pack WHERE id = ?', [$pack['id']]) !== false) {
                continue;
            }

            $values = [
                $pack['id'],
                $pack['category'],
                $pack['name'],
                $pack['description'],
                $pack['badge'],
                $pack['popular'] ? 1 : 0,
                $pack['basePrice'],
                $pack['referencePackId'],
                $pack['referenceText'],
                json_encode($pack['includedItems'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                $pack['pricingGrid'] === null ? null : json_encode($pack['pricingGrid'], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
                $pack['extraInfo'],
            ];
            $placeholders = [];
            $parameters = [];
            $types = [];
            foreach ($values as $value) {
                if ($value === null) {
                    $placeholders[] = 'NULL';
                    continue;
                }

                $placeholders[] = '?';
                $parameters[] = $value;
                $types[] = is_int($value) ? ParameterType::INTEGER : ParameterType::STRING;
            }

            $this->addSql(
                'INSERT INTO pricing_pack (id, category, name, description, badge, popular, base_price, reference_pack_id, reference_text, included_items, pricing_grid, extra_info) VALUES ('.implode(', ', $placeholders).')',
                $parameters,
                $types,
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE pricing_pack');
    }

    private function initialPacks(): array
    {
        $dreamItems = [
            "Lieu de réception : en salle ou champêtre au choix (Ny Akaminaka, Espace Myrah, Espace Ravaka, Vohimana, Villa Sirilus, Callistemon, espace Fanitra, Matohota, Sahan'ny nofy, Ravato, Palm city Ivato, Anthurium espace etc...)",
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

        $dreamGrid = [
            'headers' => ['100 PERS.', '150 PERS.', '200 PERS.', '250 PERS.', '300 PERS.', '350 PERS.', '500 PERS.'],
            'rows' => [
                ['label' => 'Servis', 'values' => [14000000, 17500000, 20000000, 25000000, 30000000, 35000000, 40000000]],
                ['label' => 'Semi-buffet', 'values' => [15500000, 19000000, 22000000, 30000000, 35000000, 40000000, 45000000]],
                ['label' => 'Buffet', 'values' => [17500000, 20000000, 28000000, 35000000, 38000000, 45000000, 49000000]],
            ],
        ];

        $goldGrid = [
            'headers' => ['100 PERS.', '150 PERS.', '200 PERS.', '250 PERS.', '300 PERS.', '500 PERS.'],
            'rows' => [
                ['label' => 'Servis', 'values' => [14000000, 17500000, 20000000, 25000000, 30000000, 40000000]],
                ['label' => 'Semi-buffet', 'values' => [15500000, 19000000, 22000000, 30000000, 35000000, 45000000]],
                ['label' => 'Buffet', 'values' => [17500000, 20000000, 28000000, 35000000, 38000000, 49000000]],
            ],
        ];

        return [
            [
                'id' => 'pack-reve',
                'category' => 'Mariage',
                'name' => 'PACK MARIAGE DE RÊVE A à Z',
                'description' => 'Cadeaux voyage de noces au bord de la mer. Une formule complète pour un mariage intime et prestigieux.',
                'badge' => 'Populaire',
                'popular' => true,
                'basePrice' => 14000000,
                'referencePackId' => null,
                'referenceText' => null,
                'includedItems' => $dreamItems,
                'pricingGrid' => $dreamGrid,
                'extraInfo' => null,
            ],
            [
                'id' => 'pack-or',
                'category' => 'Mariage',
                'name' => 'PACK MARIAGE EN OR',
                'description' => "Toute prestation dans Pack Mariage de Rêve avec espaces d'or très luxueux selon votre choix.",
                'badge' => null,
                'popular' => false,
                'basePrice' => 4000000,
                'referencePackId' => 'pack-reve',
                'referenceText' => "Toute prestation dans Pack Mariage de Rêve avec espaces d'or très luxueux selon votre choix.",
                'includedItems' => ["CCI Ivato, Sheraton Ivato Hotel 5*, Akany soafenonaka, Novotel, Colannade, Yandy by pass, Dana club, Écrin de Moeva, Espace Rose etc..."],
                'pricingGrid' => $goldGrid,
                'extraInfo' => 'PRIX DU PACK : Montant total pack mariage de rêve + Rajout 4 000 000 Ariary EN SUS',
            ],
            [
                'id' => 'pack-vip',
                'category' => 'Mariage',
                'name' => 'PACK VIP SUPRÊME',
                'description' => 'Toute prestation dans Pack Mariage de Rêve avec espaces VIP comme Au bois vert Ivato, Mahitantsoa, Naturia, Tana Palm etc...',
                'badge' => 'Le Plus Demandé',
                'popular' => true,
                'basePrice' => 5000000,
                'referencePackId' => 'pack-reve',
                'referenceText' => 'Toute prestation dans Pack Mariage de Rêve avec espaces VIP comme Au bois vert Ivato, Mahitantsoa, Naturia, Tana Palm etc...',
                'includedItems' => ['Chaise Chiavari ou chaise médaillon royal pour les invités', '2 photographes, 2 vidéastes, droniste + Booking photo', 'Clé USB personnalisée', 'Laoka avec dinde ou gisa', 'Tête de cortège très haut de gamme : dodge, mustang, Jeep limousine, Hammer, V8, Range rover, etc... au choix', 'Décoration très chic et personnalisée avec fleur tombante, stickers piste de danse etc...', 'Post wedding', "Feux d'artifice comme cadeau au artiste surprise"],
                'pricingGrid' => $goldGrid,
                'extraInfo' => 'PRIX PACK VIP SUPRÊME : Montant total pack mariage de rêve + Rajout 5 000 000 Ariary EN SUS',
            ],
            [
                'id' => 'pack-vodionory',
                'category' => 'Fiançailles',
                'name' => 'PACK VODIONORY / FIANÇAILLE DU MARIAGE',
                'description' => 'Cadeaux dîner aux chandelles dans un hôtel. Une formule complète pour les fiançailles.',
                'badge' => null,
                'popular' => false,
                'basePrice' => 8000000,
                'referencePackId' => null,
                'referenceText' => null,
                'includedItems' => ['Lieu de réception : en salle et champêtre au choix', 'Décoration selon thème et code couleur de la salle de réception et plein air', 'Mikabary malagasy matinina 2', 'Menu complet au choix avec traiteur bien réputé et qualifié parmi les meilleurs', 'Boisson hygiénique et champagne', 'Gâteaux de style au choix', 'Cocktail de bienvenue', 'Lumière et effets spéciaux complet : bulle, fumigène, confetti, pyrotechnie', 'Animation DJ avec maître de cérémonie, animateur', 'Photographe et vidéaste + Cadeau Booking photo', "Carterie complète en salle : nom table, carte menus, livre d'or, liste des invités et plan de table, tableau de bienvenue", 'Invitation ou bonbonnière ou pot de miel', 'Cadeau urne', 'Mise en beauté complète de la mariée à domicile'],
                'pricingGrid' => [
                    'headers' => ['50 PERS.', '80 PERS.', '100 PERS.', '150 PERS.', '200 PERS.'],
                    'rows' => [
                        ['label' => 'Servis', 'values' => [8000000, 11000000, 12500000, 16500000, 18500000]],
                        ['label' => 'Semi-buffet', 'values' => [10000000, 12500000, 13500000, 17500000, 22000000]],
                        ['label' => 'Buffet', 'values' => [11000000, 13000000, 14500000, 18500000, 25000000]],
                    ],
                ],
                'extraInfo' => null,
            ],
            [
                'id' => 'pack-mesure',
                'category' => 'Sur Mesure',
                'name' => 'PACK SUR MESURE',
                'description' => "Un pack qui s'adapte à votre budget et vos besoins.",
                'badge' => null,
                'popular' => false,
                'basePrice' => 0,
                'referencePackId' => null,
                'referenceText' => null,
                'includedItems' => ["Un pack qui s'adapte à votre budget et vos besoins", "(Tolotra mifanaraka amin'izay toe-bolanareo sy izay fangatahanareo)"],
                'pricingGrid' => null,
                'extraInfo' => 'Contactez-nous pour une étude personnalisée.',
            ],
        ];
    }
}