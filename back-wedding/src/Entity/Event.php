<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Event
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $code = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 64)]
    private string $clientId = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $clientName = '';

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $clientPhone = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $date = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $startTime = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $endTime = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $location = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $type = '';

    #[ORM\Column(type: 'string', length: 80, nullable: true)]
    private ?string $packId = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $packName = null;

    #[ORM\Column(type: 'string', length: 30, nullable: true)]
    private ?string $mealType = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private array $includedServices = [];

    #[ORM\Column(type: 'integer')]
    private int $guestCount = 0;

    #[ORM\Column(type: 'bigint')]
    private int $totalPrice = 0;

    #[ORM\Column(type: 'bigint')]
    private int $amountReceived = 0;

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Planifié';

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $coordinator = null;

    #[ORM\Column(type: 'simple_array', nullable: true)]
    private array $assignedServers = [];

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $notes = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $image = null;

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

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function setClientId(string $clientId): self
    {
        $this->clientId = $clientId;

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

    public function getClientPhone(): ?string
    {
        return $this->clientPhone;
    }

    public function setClientPhone(?string $clientPhone): self
    {
        $this->clientPhone = $clientPhone;

        return $this;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getStartTime(): string
    {
        return $this->startTime;
    }

    public function setStartTime(string $startTime): self
    {
        $this->startTime = $startTime;

        return $this;
    }

    public function getEndTime(): string
    {
        return $this->endTime;
    }

    public function setEndTime(string $endTime): self
    {
        $this->endTime = $endTime;

        return $this;
    }

    public function getLocation(): string
    {
        return $this->location;
    }

    public function setLocation(string $location): self
    {
        $this->location = $location;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getPackId(): ?string
    {
        return $this->packId;
    }

    public function setPackId(?string $packId): self
    {
        $this->packId = $packId;

        return $this;
    }

    public function getPackName(): ?string
    {
        return $this->packName;
    }

    public function setPackName(?string $packName): self
    {
        $this->packName = $packName;

        return $this;
    }

    public function getMealType(): ?string
    {
        return $this->mealType;
    }

    public function setMealType(?string $mealType): self
    {
        $this->mealType = $mealType;

        return $this;
    }

    public function getIncludedServices(): array
    {
        return $this->includedServices;
    }

    public function setIncludedServices(array $includedServices): self
    {
        $this->includedServices = $includedServices;

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

    public function getTotalPrice(): int
    {
        return $this->totalPrice;
    }

    public function setTotalPrice(int $totalPrice): self
    {
        $this->totalPrice = $totalPrice;

        return $this;
    }

    public function getAmountReceived(): int
    {
        return $this->amountReceived;
    }

    public function setAmountReceived(int $amountReceived): self
    {
        $this->amountReceived = $amountReceived;

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

    public function getCoordinator(): ?string
    {
        return $this->coordinator;
    }

    public function setCoordinator(?string $coordinator): self
    {
        $this->coordinator = $coordinator;

        return $this;
    }

    public function getAssignedServers(): array
    {
        return $this->assignedServers;
    }

    public function setAssignedServers(array $assignedServers): self
    {
        $this->assignedServers = $assignedServers;

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

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image): self
    {
        $this->image = $image;

        return $this;
    }
}
