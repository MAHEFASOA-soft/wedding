<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261023163000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime le doublon d’index créé pendant l’alignement du schéma';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS idx_bcc8549d1e6917bf');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE INDEX idx_bcc8549d1e6917bf ON pricing_pack (reference_pack_id)');
    }
}
