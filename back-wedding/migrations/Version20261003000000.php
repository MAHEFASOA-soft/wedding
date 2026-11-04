<?php

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Schema\Table;
use Doctrine\Migrations\AbstractMigration;

final class Version20261003000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute le stockage persistant des profils RH du module Personnel & Équipes';
    }

    public function up(Schema $schema): void
    {
        $table = new Table('employee_profile');
        $table->addColumn('id', 'string', ['length' => 64]);
        $table->addColumn('employee_type', 'string', ['length' => 30]);
        $table->addColumn('department', 'string', ['length' => 160]);
        $table->addColumn('experience', 'text');
        $table->addColumn('skills', 'json');
        $table->addColumn('hire_date', 'string', ['length' => 20]);
        $table->addColumn('availability', 'string', ['length' => 30]);
        $table->addColumn('team_ids', 'json');
        $table->addColumn('assigned_event_ids', 'json');
        $table->addColumn('notes', 'text');
        $table->addColumn('languages', 'json');
        $table->addColumn('emergency_contact', 'string', ['length' => 80, 'notnull' => false]);
        $table->setPrimaryKey(['id']);

        foreach ($this->connection->getDatabasePlatform()->getCreateTableSQL($table) as $sql) {
            $this->addSql($sql);
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE employee_profile');
    }
}