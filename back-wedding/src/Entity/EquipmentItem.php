<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class EquipmentItem
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 180)]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 120)]
    private string $category = '';

    #[ORM\Column(type: 'integer')]
    private int $quantity = 0;

    #[ORM\Column(type: 'integer')]
    private int $availableQuantity = 0;

    #[ORM\Column(name: 'item_condition', type: 'string', length: 40)]
    private string $condition = 'Excellent';

    #[ORM\Column(type: 'bigint')]
    private int $unitPrice = 0;

    #[ORM\Column(type: 'string', length: 180)]
    private string $location = '';

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getCategory(): string { return $this->category; }
    public function setCategory(string $category): self { $this->category = $category; return $this; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): self { $this->quantity = $quantity; return $this; }
    public function getAvailableQuantity(): int { return $this->availableQuantity; }
    public function setAvailableQuantity(int $availableQuantity): self { $this->availableQuantity = $availableQuantity; return $this; }
    public function getCondition(): string { return $this->condition; }
    public function setCondition(string $condition): self { $this->condition = $condition; return $this; }
    public function getUnitPrice(): int { return $this->unitPrice; }
    public function setUnitPrice(int $unitPrice): self { $this->unitPrice = $unitPrice; return $this; }
    public function getLocation(): string { return $this->location; }
    public function setLocation(string $location): self { $this->location = $location; return $this; }
}
