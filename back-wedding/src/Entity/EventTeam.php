<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class EventTeam
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 160)]
    private string $name = '';

    #[ORM\Column(type: 'text')]
    private string $description = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $specialization = 'Planning';

    #[ORM\Column(type: 'string', length: 64)]
    private string $leaderId = '';

    #[ORM\Column(type: 'json')]
    private array $memberIds = [];

    #[ORM\Column(type: 'json')]
    private array $assignedEventIds = [];

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Disponible';

    #[ORM\Column(type: 'string', length: 40)]
    private string $color = 'amber';

    #[ORM\Column(type: 'text')]
    private string $notes = '';

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): self { $this->description = $description; return $this; }
    public function getSpecialization(): string { return $this->specialization; }
    public function setSpecialization(string $specialization): self { $this->specialization = $specialization; return $this; }
    public function getLeaderId(): string { return $this->leaderId; }
    public function setLeaderId(string $leaderId): self { $this->leaderId = $leaderId; return $this; }
    public function getMemberIds(): array { return $this->memberIds; }
    public function setMemberIds(array $memberIds): self { $this->memberIds = $memberIds; return $this; }
    public function getAssignedEventIds(): array { return $this->assignedEventIds; }
    public function setAssignedEventIds(array $assignedEventIds): self { $this->assignedEventIds = $assignedEventIds; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getColor(): string { return $this->color; }
    public function setColor(string $color): self { $this->color = $color; return $this; }
    public function getNotes(): string { return $this->notes; }
    public function setNotes(string $notes): self { $this->notes = $notes; return $this; }
}