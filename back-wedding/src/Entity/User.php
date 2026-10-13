<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'account_user')]
#[ORM\UniqueConstraint(name: 'UNIQ_ACCOUNT_USER_EMAIL', columns: ['email'])]
class User
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'string', length: 180)]
    private string $email;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(type: 'string', length: 64)]
    private string $role = 'staff';

    #[ORM\Column(type: 'string', length: 20)]
    private string $status = 'active';

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $passwordHash = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $lastLogin = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): self { $this->phone = $phone; return $this; }
    public function getRole(): string { return $this->role; }
    public function setRole(string $role): self { $this->role = $role; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getPasswordHash(): ?string { return $this->passwordHash; }
    public function setPasswordHash(?string $passwordHash): self { $this->passwordHash = $passwordHash; return $this; }
    public function getLastLogin(): ?\DateTimeImmutable { return $this->lastLogin; }
    public function setLastLogin(?\DateTimeImmutable $lastLogin): self { $this->lastLogin = $lastLogin; return $this; }
}