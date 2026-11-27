<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'event_staff_assignment')]
class EventStaffAssignment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(name: 'event_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?Event $event = null;

    #[ORM\ManyToOne(targetEntity: ServerStaff::class)]
    #[ORM\JoinColumn(name: 'server_staff_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?ServerStaff $serverStaff = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $roleSnapshot = '';

    #[ORM\Column(type: 'bigint')]
    private int $hourlyRateSnapshot = 0;

    public function getId(): ?int { return $this->id; }

    public function getEvent(): ?Event { return $this->event; }
    public function setEvent(?Event $event): self { $this->event = $event; return $this; }

    public function getServerStaff(): ?ServerStaff { return $this->serverStaff; }
    public function setServerStaff(?ServerStaff $serverStaff): self { $this->serverStaff = $serverStaff; return $this; }

    public function getRoleSnapshot(): string { return $this->roleSnapshot; }
    public function setRoleSnapshot(string $roleSnapshot): self { $this->roleSnapshot = $roleSnapshot; return $this; }

    public function getHourlyRateSnapshot(): int { return $this->hourlyRateSnapshot; }
    public function setHourlyRateSnapshot(int $hourlyRateSnapshot): self { $this->hourlyRateSnapshot = $hourlyRateSnapshot; return $this; }

}
