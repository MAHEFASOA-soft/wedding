<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class TeamMember
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $role = '';

    #[ORM\Column(type: 'string', length: 160)]
    private string $department = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $phone = '';

    #[ORM\Column(type: 'string', length: 160)]
    private string $email = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Actif';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(type: 'bigint', nullable: true)]
    private ?int $monthlySalary = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getRole(): string { return $this->role; }
    public function setRole(string $role): self { $this->role = $role; return $this; }
    public function getDepartment(): string { return $this->department; }
    public function setDepartment(string $department): self { $this->department = $department; return $this; }
    public function getPhone(): string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }
    public function getMonthlySalary(): ?int { return $this->monthlySalary; }
    public function setMonthlySalary(?int $monthlySalary): self { $this->monthlySalary = $monthlySalary; return $this; }
}
