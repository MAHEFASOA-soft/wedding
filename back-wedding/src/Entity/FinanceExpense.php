<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class FinanceExpense
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 80)]
    private string $number = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $date = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $category = 'Aliments';

    #[ORM\Column(type: 'string', length: 200)]
    private string $description = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $supplier = '';

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(name: 'event_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Event $event = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $eventName = null;

    #[ORM\Column(type: 'bigint')]
    private int $amount = 0;

    #[ORM\Column(type: 'string', length: 60)]
    private string $paymentMethod = 'Virement bancaire';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comment = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getNumber(): string { return $this->number; }
    public function setNumber(string $number): self { $this->number = $number; return $this; }
    public function getDate(): string { return $this->date; }
    public function setDate(string $date): self { $this->date = $date; return $this; }
    public function getCategory(): string { return $this->category; }
    public function setCategory(string $category): self { $this->category = $category; return $this; }
    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): self { $this->description = $description; return $this; }
    public function getSupplier(): string { return $this->supplier; }
    public function setSupplier(string $supplier): self { $this->supplier = $supplier; return $this; }
    public function getEventId(): ?string { return $this->event?->getId(); }
    public function setEvent(?Event $event): self { $this->event = $event; return $this; }
    public function getEventName(): ?string { return $this->eventName; }
    public function setEventName(?string $eventName): self { $this->eventName = $eventName; return $this; }
    public function getAmount(): int { return $this->amount; }
    public function setAmount(int $amount): self { $this->amount = $amount; return $this; }
    public function getPaymentMethod(): string { return $this->paymentMethod; }
    public function setPaymentMethod(string $paymentMethod): self { $this->paymentMethod = $paymentMethod; return $this; }
    public function getComment(): ?string { return $this->comment; }
    public function setComment(?string $comment): self { $this->comment = $comment; return $this; }
}
