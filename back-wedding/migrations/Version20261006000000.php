<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Doctrine\Migrations\AbstractMigration;

final class Version20261006000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Persiste les informations de l’agence utilisées par la page Paramètres';
    }

    public function up(Schema $schema): void
    {
        $table = new Table('agency_settings');
        $table->addColumn('id', 'string', ['length' => 16]);
        $table->addColumn('agency_name', 'string', ['length' => 180]);
        $table->addColumn('address', 'string', ['length' => 255]);
        $table->addColumn('phone', 'string', ['length' => 100]);
        $table->addColumn('email', 'string', ['length' => 180]);
        $table->addColumn('nif', 'string', ['length' => 40]);
        $table->addColumn('stat', 'string', ['length' => 60]);
        $table->addColumn('currency', 'string', ['length' => 80]);
        $table->setPrimaryKey(['id']);

        foreach ($this->connection->getDatabasePlatform()->getCreateTableSQL($table) as $sql) {
            $this->addSql($sql);
        }

        $this->addSql(
            'INSERT INTO agency_settings (id, agency_name, address, phone, email, nif, stat, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            ['main', 'Efficiency Wedding Madagascar', 'Ankorondrano, Antananarivo 101, Madagascar', '+261 34 00 000 00', 'contact@efficiencywedding.mg', '4002819201', '82300 11 2019 0 00412', 'Ariary (Ar / MGA)'],
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE agency_settings');
    }
}