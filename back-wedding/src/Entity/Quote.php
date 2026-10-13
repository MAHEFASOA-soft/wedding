<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Quote
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 80)]
    private string $quoteNumber = '';

    #[ORM\Column(type: 'integer', options: ['default' => 1])]
    private int $version = 1;

    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    private ?string $parentQuoteId = null;

    #[ORM\Column(type: 'string', length: 64, nullable: true)]
    private ?string $eventId = null;

    #[ORM\Column(type: 'string', length: 40, options: ['default' => ''])]
    private string $createdAt = '';

    #[ORM\Column(type: 'string', length: 40, options: ['default' => ''])]
    private string $updatedAt = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $changeReason = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $clientName = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $eventName = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $date = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $validUntil = '';

    #[ORM\Column(type: 'bigint')]
    private int $totalAmount = 0;

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Brouillon';

    #[ORM\Column(type: 'json', nullable: true)]
    private array $items = [];

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getQuoteNumber(): string { return $this->quoteNumber; }
    public function setQuoteNumber(string $quoteNumber): self { $this->quoteNumber = $quoteNumber; return $this; }
    public function getVersion(): int { return $this->version; }
    public function setVersion(int $version): self { $this->version = $version; return $this; }
    public function getParentQuoteId(): ?string { return $this->parentQuoteId; }
    public function setParentQuoteId(?string $parentQuoteId): self { $this->parentQuoteId = $parentQuoteId; return $this; }
    public function getEventId(): ?string { return $this->eventId; }
    public function setEventId(?string $eventId): self { $this->eventId = $eventId; return $this; }
    public function getCreatedAt(): string { return $this->createdAt; }
    public function setCreatedAt(string $createdAt): self { $this->createdAt = $createdAt; return $this; }
    public function getUpdatedAt(): string { return $this->updatedAt; }
    public function setUpdatedAt(string $updatedAt): self { $this->updatedAt = $updatedAt; return $this; }
    public function getChangeReason(): ?string { return $this->changeReason; }
    public function setChangeReason(?string $changeReason): self { $this->changeReason = $changeReason; return $this; }
    public function getClientName(): string { return $this->clientName; }
    public function setClientName(string $clientName): self { $this->clientName = $clientName; return $this; }
    public function getEventName(): string { return $this->eventName; }
    public function setEventName(string $eventName): self { $this->eventName = $eventName; return $this; }
    public function getDate(): string { return $this->date; }
    public function setDate(string $date): self { $this->date = $date; return $this; }
    public function getValidUntil(): string { return $this->validUntil; }
    public function setValidUntil(string $validUntil): self { $this->validUntil = $validUntil; return $this; }
    public function getTotalAmount(): int { return $this->totalAmount; }
    public function setTotalAmount(int $totalAmount): self { $this->totalAmount = $totalAmount; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getItems(): array { return $this->items; }
    public function setItems(array $items): self { $this->items = $items; return $this; }
}
