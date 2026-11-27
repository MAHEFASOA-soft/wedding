<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261023162000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Aligne la colonne event.pack_id et son index sur le mapping Doctrine';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event ALTER pack_id TYPE VARCHAR(64)');
        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF to_regclass('public.idx_pricing_pack_reference') IS NOT NULL
       AND to_regclass('public."IDX_BCC8549D1E6917BF"') IS NULL THEN
        ALTER INDEX idx_pricing_pack_reference RENAME TO "IDX_BCC8549D1E6917BF";
    ELSIF to_regclass('public."IDX_BCC8549D1E6917BF"') IS NULL THEN
        CREATE INDEX "IDX_BCC8549D1E6917BF" ON pricing_pack (reference_pack_id);
    END IF;
END
$$
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER INDEX IDX_BCC8549D1E6917BF RENAME TO idx_pricing_pack_reference');
        $this->addSql('ALTER TABLE event ALTER pack_id TYPE VARCHAR(80)');
    }
}
