<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261002040709 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE appointment (id VARCHAR(64) NOT NULL, client_name VARCHAR(255) NOT NULL, client_phone VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, purpose VARCHAR(120) NOT NULL, location VARCHAR(255) NOT NULL, status VARCHAR(40) NOT NULL, notes TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE client (id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, phone VARCHAR(100) DEFAULT NULL, email VARCHAR(180) DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, notes TEXT DEFAULT NULL, events_count INT DEFAULT 0 NOT NULL, total_spent BIGINT DEFAULT 0 NOT NULL, created_at VARCHAR(20) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE equipment_item (id VARCHAR(64) NOT NULL, name VARCHAR(180) NOT NULL, category VARCHAR(120) NOT NULL, quantity INT NOT NULL, available_quantity INT NOT NULL, item_condition VARCHAR(40) NOT NULL, unit_price BIGINT NOT NULL, location VARCHAR(180) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE event (id VARCHAR(64) NOT NULL, code VARCHAR(120) NOT NULL, name VARCHAR(255) NOT NULL, client_id VARCHAR(64) NOT NULL, client_name VARCHAR(255) NOT NULL, client_phone VARCHAR(100) DEFAULT NULL, date VARCHAR(20) NOT NULL, start_time VARCHAR(20) NOT NULL, end_time VARCHAR(20) NOT NULL, location VARCHAR(255) NOT NULL, type VARCHAR(80) NOT NULL, pack_id VARCHAR(80) DEFAULT NULL, pack_name VARCHAR(255) DEFAULT NULL, meal_type VARCHAR(30) DEFAULT NULL, included_services JSON DEFAULT NULL, guest_count INT NOT NULL, total_price BIGINT NOT NULL, amount_received BIGINT NOT NULL, status VARCHAR(40) NOT NULL, coordinator VARCHAR(255) DEFAULT NULL, assigned_servers TEXT DEFAULT NULL, notes TEXT DEFAULT NULL, image TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE event_team (id VARCHAR(64) NOT NULL, name VARCHAR(160) NOT NULL, description TEXT NOT NULL, specialization VARCHAR(80) NOT NULL, leader_id VARCHAR(64) NOT NULL, member_ids JSON NOT NULL, assigned_event_ids JSON NOT NULL, status VARCHAR(40) NOT NULL, color VARCHAR(40) NOT NULL, notes TEXT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE finance_expense (id VARCHAR(64) NOT NULL, number VARCHAR(80) NOT NULL, date VARCHAR(20) NOT NULL, category VARCHAR(80) NOT NULL, description VARCHAR(200) NOT NULL, supplier VARCHAR(180) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, amount BIGINT NOT NULL, payment_method VARCHAR(60) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE finance_receipt (id VARCHAR(64) NOT NULL, number VARCHAR(80) NOT NULL, date VARCHAR(20) NOT NULL, client VARCHAR(180) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, description VARCHAR(160) NOT NULL, category VARCHAR(80) NOT NULL, amount BIGINT NOT NULL, payment_method VARCHAR(60) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE invoice (id VARCHAR(64) NOT NULL, invoice_number VARCHAR(80) NOT NULL, client_name VARCHAR(255) NOT NULL, event_name VARCHAR(255) NOT NULL, date VARCHAR(20) NOT NULL, due_date VARCHAR(20) NOT NULL, total_amount BIGINT NOT NULL, paid_amount BIGINT NOT NULL, status VARCHAR(40) NOT NULL, items JSON DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE place (id VARCHAR(64) NOT NULL, name VARCHAR(180) NOT NULL, type VARCHAR(40) NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(120) NOT NULL, district VARCHAR(120) NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, capacity INT NOT NULL, price_per_day BIGINT NOT NULL, phone VARCHAR(80) NOT NULL, email VARCHAR(180) NOT NULL, website VARCHAR(255) NOT NULL, description TEXT NOT NULL, amenities JSON NOT NULL, main_image TEXT NOT NULL, gallery JSON NOT NULL, status VARCHAR(40) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE quote (id VARCHAR(64) NOT NULL, quote_number VARCHAR(80) NOT NULL, version INT DEFAULT 1 NOT NULL, parent_quote_id VARCHAR(64) DEFAULT NULL, event_id VARCHAR(64) DEFAULT NULL, created_at VARCHAR(40) DEFAULT \'\' NOT NULL, updated_at VARCHAR(40) DEFAULT \'\' NOT NULL, change_reason TEXT DEFAULT NULL, client_name VARCHAR(255) NOT NULL, event_name VARCHAR(255) NOT NULL, date VARCHAR(20) NOT NULL, valid_until VARCHAR(20) NOT NULL, total_amount BIGINT NOT NULL, status VARCHAR(40) NOT NULL, items JSON DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE reservation (id VARCHAR(64) NOT NULL, code VARCHAR(120) NOT NULL, client_name VARCHAR(255) NOT NULL, event_type VARCHAR(80) NOT NULL, requested_date VARCHAR(20) NOT NULL, guest_count INT NOT NULL, estimated_budget BIGINT NOT NULL, contact_phone VARCHAR(100) NOT NULL, contact_email VARCHAR(180) NOT NULL, status VARCHAR(40) NOT NULL, notes TEXT DEFAULT NULL, created_at VARCHAR(20) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE salary_record (id VARCHAR(64) NOT NULL, employee_name VARCHAR(180) NOT NULL, role VARCHAR(180) NOT NULL, month VARCHAR(80) NOT NULL, base_salary BIGINT NOT NULL, bonus BIGINT NOT NULL, deduction BIGINT NOT NULL, net_paid BIGINT NOT NULL, payment_date VARCHAR(20) NOT NULL, status VARCHAR(40) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE server_staff (id VARCHAR(64) NOT NULL, name VARCHAR(120) NOT NULL, phone VARCHAR(60) NOT NULL, role VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL, hourly_rate BIGINT NOT NULL, assigned_events_count INT NOT NULL, rating DOUBLE PRECISION NOT NULL, daily_rate BIGINT DEFAULT NULL, experience VARCHAR(80) DEFAULT NULL, avatar TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE service (id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, category VARCHAR(120) NOT NULL, description TEXT NOT NULL, unit_price BIGINT NOT NULL, unit VARCHAR(80) NOT NULL, is_popular BOOLEAN DEFAULT NULL, image TEXT DEFAULT NULL, features JSON DEFAULT NULL, duration VARCHAR(60) DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE task_item (id VARCHAR(64) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, assigned_to VARCHAR(120) NOT NULL, due_date VARCHAR(20) NOT NULL, priority VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE team_member (id VARCHAR(64) NOT NULL, name VARCHAR(120) NOT NULL, role VARCHAR(180) NOT NULL, department VARCHAR(160) NOT NULL, phone VARCHAR(80) NOT NULL, email VARCHAR(160) NOT NULL, status VARCHAR(40) NOT NULL, avatar TEXT DEFAULT NULL, monthly_salary BIGINT DEFAULT NULL, PRIMARY KEY (id))');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE appointment');
        $this->addSql('DROP TABLE client');
        $this->addSql('DROP TABLE equipment_item');
        $this->addSql('DROP TABLE event');
        $this->addSql('DROP TABLE event_team');
        $this->addSql('DROP TABLE finance_expense');
        $this->addSql('DROP TABLE finance_receipt');
        $this->addSql('DROP TABLE invoice');
        $this->addSql('DROP TABLE place');
        $this->addSql('DROP TABLE quote');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE salary_record');
        $this->addSql('DROP TABLE server_staff');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE task_item');
        $this->addSql('DROP TABLE team_member');
    }
}
