<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class TaskItem
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(name: 'event_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Event $event = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $eventName = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $title = '';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'string', length: 120)]
    private string $assignedTo = '';

    #[ORM\Column(type: 'string', length: 20)]
    private string $dueDate = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $priority = 'Moyenne';

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'À faire';

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getEventId(): ?string { return $this->event?->getId(); }
    public function setEvent(?Event $event): self { $this->event = $event; return $this; }
    public function getEventName(): ?string { return $this->eventName; }
    public function setEventName(?string $eventName): self { $this->eventName = $eventName; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): self { $this->title = $title; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }
    public function getAssignedTo(): string { return $this->assignedTo; }
    public function setAssignedTo(string $assignedTo): self { $this->assignedTo = $assignedTo; return $this; }
    public function getDueDate(): string { return $this->dueDate; }
    public function setDueDate(string $dueDate): self { $this->dueDate = $dueDate; return $this; }
    public function getPriority(): string { return $this->priority; }
    public function setPriority(string $priority): self { $this->priority = $priority; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
}
