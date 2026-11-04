<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class PricingPack
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 120)]
    private string $category = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $name = '';

    #[ORM\Column(type: 'text')]
    private string $description = '';

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $badge = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $popular = false;

    #[ORM\Column(type: 'bigint')]
    private int $basePrice = 0;

    #[ORM\ManyToOne(targetEntity: self::class)]
    #[ORM\JoinColumn(name: 'reference_pack_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?self $referencePack = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $referenceText = null;

    #[ORM\Column(type: 'json')]
    private array $includedItems = [];

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $pricingGrid = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $extraInfo = null;

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string $id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): self
    {
        $this->category = $category;

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

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getBadge(): ?string
    {
        return $this->badge;
    }

    public function setBadge(?string $badge): self
    {
        $this->badge = $badge;

        return $this;
    }

    public function isPopular(): bool
    {
        return $this->popular;
    }

    public function setPopular(bool $popular): self
    {
        $this->popular = $popular;

        return $this;
    }

    public function getBasePrice(): int
    {
        return $this->basePrice;
    }

    public function setBasePrice(int $basePrice): self
    {
        $this->basePrice = $basePrice;

        return $this;
    }

    public function getReferencePackId(): ?string
    {
        return $this->referencePack?->getId();
    }

    public function setReferencePack(?self $referencePack): self
    {
        $this->referencePack = $referencePack;

        return $this;
    }

    public function getReferenceText(): ?string
    {
        return $this->referenceText;
    }

    public function setReferenceText(?string $referenceText): self
    {
        $this->referenceText = $referenceText;

        return $this;
    }

    public function getIncludedItems(): array
    {
        return $this->includedItems;
    }

    public function setIncludedItems(array $includedItems): self
    {
        $this->includedItems = $includedItems;

        return $this;
    }

    public function getPricingGrid(): ?array
    {
        return $this->pricingGrid;
    }

    public function setPricingGrid(?array $pricingGrid): self
    {
        $this->pricingGrid = $pricingGrid;

        return $this;
    }

    public function getExtraInfo(): ?string
    {
        return $this->extraInfo;
    }

    public function setExtraInfo(?string $extraInfo): self
    {
        $this->extraInfo = $extraInfo;

        return $this;
    }
}