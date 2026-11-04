<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class ServerStaff
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 60)]
    private string $phone = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $role = 'Serveur';

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Disponible';

    #[ORM\Column(type: 'bigint')]
    private int $hourlyRate = 0;

    #[ORM\Column(type: 'integer')]
    private int $assignedEventsCount = 0;

    #[ORM\Column(type: 'float')]
    private float $rating = 0.0;

    #[ORM\Column(type: 'bigint', nullable: true)]
    private ?int $dailyRate = null;

    #[ORM\Column(type: 'string', length: 80, nullable: true)]
    private ?string $experience = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $avatar = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getPhone(): string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }
    public function getRole(): string { return $this->role; }
    public function setRole(string $role): self { $this->role = $role; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getHourlyRate(): int { return $this->hourlyRate; }
    public function setHourlyRate(int $hourlyRate): self { $this->hourlyRate = $hourlyRate; return $this; }
    public function getAssignedEventsCount(): int { return $this->assignedEventsCount; }
    public function setAssignedEventsCount(int $assignedEventsCount): self { $this->assignedEventsCount = $assignedEventsCount; return $this; }
    public function getRating(): float { return $this->rating; }
    public function setRating(float $rating): self { $this->rating = $rating; return $this; }
    public function getDailyRate(): ?int { return $this->dailyRate; }
    public function setDailyRate(?int $dailyRate): self { $this->dailyRate = $dailyRate; return $this; }
    public function getExperience(): ?string { return $this->experience; }
    public function setExperience(?string $experience): self { $this->experience = $experience; return $this; }
    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }
}
