<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261023161500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les contraintes de clés étrangères pour les principales relations métier';
    }

    public function up(Schema $schema): void
    {
        $orphanChecks = [
            'event.client_id' => 'SELECT COUNT(*) FROM event child LEFT JOIN client parent ON parent.id = child.client_id WHERE parent.id IS NULL',
            'event.pack_id' => 'SELECT COUNT(*) FROM event child LEFT JOIN pricing_pack parent ON parent.id = child.pack_id WHERE child.pack_id IS NOT NULL AND parent.id IS NULL',
            'task_item.event_id' => 'SELECT COUNT(*) FROM task_item child LEFT JOIN event parent ON parent.id = child.event_id WHERE child.event_id IS NOT NULL AND parent.id IS NULL',
            'quote.event_id' => 'SELECT COUNT(*) FROM quote child LEFT JOIN event parent ON parent.id = child.event_id WHERE child.event_id IS NOT NULL AND parent.id IS NULL',
            'quote.parent_quote_id' => 'SELECT COUNT(*) FROM quote child LEFT JOIN quote parent ON parent.id = child.parent_quote_id WHERE child.parent_quote_id IS NOT NULL AND parent.id IS NULL',
            'finance_expense.event_id' => 'SELECT COUNT(*) FROM finance_expense child LEFT JOIN event parent ON parent.id = child.event_id WHERE child.event_id IS NOT NULL AND parent.id IS NULL',
            'finance_receipt.event_id' => 'SELECT COUNT(*) FROM finance_receipt child LEFT JOIN event parent ON parent.id = child.event_id WHERE child.event_id IS NOT NULL AND parent.id IS NULL',
            'account_user.role' => 'SELECT COUNT(*) FROM account_user child LEFT JOIN access_role parent ON parent.id = child.role WHERE parent.id IS NULL',
            'pricing_pack.reference_pack_id' => 'SELECT COUNT(*) FROM pricing_pack child LEFT JOIN pricing_pack parent ON parent.id = child.reference_pack_id WHERE child.reference_pack_id IS NOT NULL AND parent.id IS NULL',
        ];

        foreach ($orphanChecks as $field => $query) {
            $this->abortIf(
                (int) $this->connection->fetchOne($query) > 0,
                sprintf('Impossible de créer les clés étrangères : des valeurs orphelines existent dans %s.', $field),
            );
        }

        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA719EB6921 FOREIGN KEY (client_id) REFERENCES client (id) ON DELETE RESTRICT');
        $this->addSql('CREATE INDEX IDX_3BAE0AA719EB6921 ON event (client_id)');
        $this->addSql('ALTER TABLE event ADD CONSTRAINT FK_3BAE0AA71919B217 FOREIGN KEY (pack_id) REFERENCES pricing_pack (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_3BAE0AA71919B217 ON event (pack_id)');
        $this->addSql('ALTER TABLE task_item ADD CONSTRAINT FK_6CA8B16571F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_6CA8B16571F7E88B ON task_item (event_id)');
        $this->addSql('ALTER TABLE quote ADD CONSTRAINT FK_6B71CBF471F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_6B71CBF471F7E88B ON quote (event_id)');
        $this->addSql('ALTER TABLE quote ADD CONSTRAINT FK_6B71CBF4444DFDA9 FOREIGN KEY (parent_quote_id) REFERENCES quote (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_6B71CBF4444DFDA9 ON quote (parent_quote_id)');
        $this->addSql('ALTER TABLE finance_expense ADD CONSTRAINT FK_C0A8610271F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_C0A8610271F7E88B ON finance_expense (event_id)');
        $this->addSql('ALTER TABLE finance_receipt ADD CONSTRAINT FK_BE0B5AE171F7E88B FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_BE0B5AE171F7E88B ON finance_receipt (event_id)');
        $this->addSql('ALTER TABLE account_user ADD CONSTRAINT FK_10051E357698A6A FOREIGN KEY (role) REFERENCES access_role (id) ON DELETE RESTRICT');
        $this->addSql('CREATE INDEX IDX_10051E357698A6A ON account_user (role)');
        $this->addSql('ALTER TABLE pricing_pack ADD CONSTRAINT FK_BCC8549D1E6917BF FOREIGN KEY (reference_pack_id) REFERENCES pricing_pack (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE event DROP CONSTRAINT FK_3BAE0AA719EB6921');
        $this->addSql('ALTER TABLE event DROP CONSTRAINT FK_3BAE0AA71919B217');
        $this->addSql('ALTER TABLE task_item DROP CONSTRAINT FK_6CA8B16571F7E88B');
        $this->addSql('ALTER TABLE quote DROP CONSTRAINT FK_6B71CBF471F7E88B');
        $this->addSql('ALTER TABLE quote DROP CONSTRAINT FK_6B71CBF4444DFDA9');
        $this->addSql('ALTER TABLE finance_expense DROP CONSTRAINT FK_C0A8610271F7E88B');
        $this->addSql('ALTER TABLE finance_receipt DROP CONSTRAINT FK_BE0B5AE171F7E88B');
        $this->addSql('ALTER TABLE account_user DROP CONSTRAINT FK_10051E357698A6A');
        $this->addSql('ALTER TABLE pricing_pack DROP CONSTRAINT FK_BCC8549D1E6917BF');
        $this->addSql('DROP INDEX IDX_3BAE0AA719EB6921');
        $this->addSql('DROP INDEX IDX_3BAE0AA71919B217');
        $this->addSql('DROP INDEX IDX_6CA8B16571F7E88B');
        $this->addSql('DROP INDEX IDX_6B71CBF471F7E88B');
        $this->addSql('DROP INDEX IDX_6B71CBF4444DFDA9');
        $this->addSql('DROP INDEX IDX_C0A8610271F7E88B');
        $this->addSql('DROP INDEX IDX_BE0B5AE171F7E88B');
        $this->addSql('DROP INDEX IDX_10051E357698A6A');
    }
}
