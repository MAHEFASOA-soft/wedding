<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Doctrine\Migrations\AbstractMigration;

final class Version20261005000000 extends AbstractMigration
{
    private const MODULES = [
        'dashboard', 'events', 'clients', 'services', 'pricing', 'tasks', 'quotes',
        'invoices', 'payments', 'finances', 'planning', 'team', 'statistics', 'users', 'settings',
    ];

    public function getDescription(): string
    {
        return 'Persiste les rôles et permissions et autorise les rôles personnalisés sur les comptes';
    }

    public function up(Schema $schema): void
    {
        $table = new Table('access_role');
        $table->addColumn('id', 'string', ['length' => 64]);
        $table->addColumn('name', 'string', ['length' => 120]);
        $table->addColumn('description', 'text');
        $table->addColumn('color', 'string', ['length' => 24]);
        $table->addColumn('system', 'boolean');
        $table->addColumn('permissions', 'json');
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['name'], 'UNIQ_ACCESS_ROLE_NAME');

        foreach ($this->connection->getDatabasePlatform()->getCreateTableSQL($table) as $sql) {
            $this->addSql($sql);
        }

        $roles = [
            ['admin', 'Administrateur', 'Accès complet à la plateforme.', 'amber', true, self::MODULES, true],
            ['manager', 'Manager événementiel', 'Gestion des événements et des opérations.', 'blue', true, ['dashboard', 'events', 'clients', 'services', 'pricing', 'tasks', 'quotes', 'planning', 'team', 'statistics'], false],
            ['finance', 'Responsable financier', 'Gestion des devis, factures, paiements et finances.', 'emerald', true, ['dashboard', 'clients', 'pricing', 'quotes', 'invoices', 'payments', 'finances', 'statistics'], false],
            ['staff', 'Personnel', 'Accès aux tâches, événements et planning assignés.', 'violet', true, ['dashboard', 'events', 'services', 'tasks', 'planning'], false],
        ];

        foreach ($roles as [$id, $name, $description, $color, $system, $allowedModules, $full]) {
            $permissions = [];
            foreach (self::MODULES as $module) {
                $allowed = in_array($module, $allowedModules, true);
                $permissions[$module] = [
                    'view' => $allowed,
                    'create' => $allowed && $full,
                    'edit' => $allowed && $full,
                    'delete' => $allowed && $full,
                ];
            }

            $this->addSql(
                'INSERT INTO access_role (id, name, description, color, system, permissions) VALUES (?, ?, ?, ?, ?, CAST(? AS JSON))',
                [$id, $name, $description, $color, $system, json_encode($permissions, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)],
            );
        }

        $this->addSql('ALTER TABLE account_user ALTER COLUMN role TYPE VARCHAR(64)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE account_user SET role = 'staff' WHERE role NOT IN ('admin', 'manager', 'finance', 'staff')");
        $this->addSql('ALTER TABLE account_user ALTER COLUMN role TYPE VARCHAR(20)');
        $this->addSql('DROP TABLE access_role');
    }
}