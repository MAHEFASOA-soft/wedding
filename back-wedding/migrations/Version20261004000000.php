<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Doctrine\Migrations\AbstractMigration;

final class Version20261004000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crée les comptes utilisateurs et importe les comptes de démonstration existants';
    }

    public function up(Schema $schema): void
    {
        $table = new Table('account_user');
        $table->addColumn('id', 'string', ['length' => 64]);
        $table->addColumn('name', 'string', ['length' => 255]);
        $table->addColumn('email', 'string', ['length' => 180]);
        $table->addColumn('phone', 'string', ['length' => 100, 'notnull' => false]);
        $table->addColumn('role', 'string', ['length' => 20]);
        $table->addColumn('status', 'string', ['length' => 20]);
        $table->addColumn('password_hash', 'string', ['length' => 255, 'notnull' => false]);
        $table->addColumn('last_login', 'datetime_immutable', ['notnull' => false]);
        $table->setPrimaryKey(['id']);
        $table->addUniqueIndex(['email'], 'UNIQ_ACCOUNT_USER_EMAIL');

        foreach ($this->connection->getDatabasePlatform()->getCreateTableSQL($table) as $sql) {
            $this->addSql($sql);
        }

        $users = [
            ['USR-001', 'Miora Randria', 'miora@efficiencywedding.mg', '+261 34 00 000 01', 'admin', 'active'],
            ['USR-002', 'Jean Rakoto', 'jean@efficiencywedding.mg', '+261 34 00 000 02', 'manager', 'active'],
            ['USR-003', 'Sarah Andria', 'sarah@efficiencywedding.mg', '+261 34 00 000 03', 'finance', 'active'],
            ['USR-004', 'Paul Rabe', 'paul@efficiencywedding.mg', '+261 34 00 000 04', 'staff', 'active'],
            ['USR-005', 'Hery Rakoto', 'hery@efficiencywedding.mg', '+261 34 00 000 05', 'manager', 'inactive'],
            ['USR-006', 'Nadia Andriam', 'nadia@efficiencywedding.mg', '+261 34 00 000 06', 'staff', 'active'],
        ];

        foreach ($users as $user) {
            $this->addSql(
                'INSERT INTO account_user (id, name, email, phone, role, status, password_hash, last_login) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)',
                $user,
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE account_user');
    }
}