<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $code = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $clientName = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $eventType = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $requestedDate = '';

    #[ORM\Column(type: 'integer')]
    private int $guestCount = 0;

    #[ORM\Column(type: 'bigint')]
    private int $estimatedBudget = 0;

    #[ORM\Column(type: 'string', length: 100)]
    private string $contactPhone = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $contactEmail = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'En attente';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $createdAt = '';

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): self
    {
        $this->code = $code;

        return $this;
    }

    public function getClientName(): string
    {
        return $this->clientName;
    }

    public function setClientName(string $clientName): self
    {
        $this->clientName = $clientName;

        return $this;
    }

    public function getEventType(): string
    {
        return $this->eventType;
    }

    public function setEventType(string $eventType): self
    {
        $this->eventType = $eventType;

        return $this;
    }

    public function getRequestedDate(): string
    {
        return $this->requestedDate;
    }

    public function setRequestedDate(string $requestedDate): self
    {
        $this->requestedDate = $requestedDate;

        return $this;
    }

    public function getGuestCount(): int
    {
        return $this->guestCount;
    }

    public function setGuestCount(int $guestCount): self
    {
        $this->guestCount = $guestCount;

        return $this;
    }

    public function getEstimatedBudget(): int
    {
        return $this->estimatedBudget;
    }

    public function setEstimatedBudget(int $estimatedBudget): self
    {
        $this->estimatedBudget = $estimatedBudget;

        return $this;
    }

    public function getContactPhone(): string
    {
        return $this->contactPhone;
    }

    public function setContactPhone(string $contactPhone): self
    {
        $this->contactPhone = $contactPhone;

        return $this;
    }

    public function getContactEmail(): string
    {
        return $this->contactEmail;
    }

    public function setContactEmail(string $contactEmail): self
    {
        $this->contactEmail = $contactEmail;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): self
    {
        $this->notes = $notes;

        return $this;
    }

    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }

    public function setCreatedAt(string $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
