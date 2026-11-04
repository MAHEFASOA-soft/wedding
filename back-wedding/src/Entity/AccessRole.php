<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'access_role')]
#[ORM\UniqueConstraint(name: 'UNIQ_ACCESS_ROLE_NAME', columns: ['name'])]
class AccessRole
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $name;

    #[ORM\Column(type: 'text')]
    private string $description = '';

    #[ORM\Column(type: 'string', length: 24)]
    private string $color = 'slate';

    #[ORM\Column(type: 'boolean')]
    private bool $system = false;

    #[ORM\Column(type: 'json')]
    private array $permissions = [];

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): self { $this->description = $description; return $this; }
    public function getColor(): string { return $this->color; }
    public function setColor(string $color): self { $this->color = $color; return $this; }
    public function isSystem(): bool { return $this->system; }
    public function setSystem(bool $system): self { $this->system = $system; return $this; }
    public function getPermissions(): array { return $this->permissions; }
    public function setPermissions(array $permissions): self { $this->permissions = $permissions; return $this; }
}