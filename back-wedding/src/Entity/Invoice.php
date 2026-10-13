<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Invoice
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 80)]
    private string $invoiceNumber = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $clientName = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $eventName = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $date = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $dueDate = '';

    #[ORM\Column(type: 'bigint')]
    private int $totalAmount = 0;

    #[ORM\Column(type: 'bigint')]
    private int $paidAmount = 0;

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'En attente';

    #[ORM\Column(type: 'json', nullable: true)]
    private array $items = [];

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getInvoiceNumber(): string { return $this->invoiceNumber; }
    public function setInvoiceNumber(string $invoiceNumber): self { $this->invoiceNumber = $invoiceNumber; return $this; }
    public function getClientName(): string { return $this->clientName; }
    public function setClientName(string $clientName): self { $this->clientName = $clientName; return $this; }
    public function getEventName(): string { return $this->eventName; }
    public function setEventName(string $eventName): self { $this->eventName = $eventName; return $this; }
    public function getDate(): string { return $this->date; }
    public function setDate(string $date): self { $this->date = $date; return $this; }
    public function getDueDate(): string { return $this->dueDate; }
    public function setDueDate(string $dueDate): self { $this->dueDate = $dueDate; return $this; }
    public function getTotalAmount(): int { return $this->totalAmount; }
    public function setTotalAmount(int $totalAmount): self { $this->totalAmount = $totalAmount; return $this; }
    public function getPaidAmount(): int { return $this->paidAmount; }
    public function setPaidAmount(int $paidAmount): self { $this->paidAmount = $paidAmount; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getItems(): array { return $this->items; }
    public function setItems(array $items): self { $this->items = $items; return $this; }
}
