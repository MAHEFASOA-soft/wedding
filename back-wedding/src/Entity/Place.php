<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Place
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 180)]
    private string $name = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $type = 'Salle';

    #[ORM\Column(type: 'string', length: 255)]
    private string $address = '';

    #[ORM\Column(type: 'string', length: 120)]
    private string $city = '';

    #[ORM\Column(type: 'string', length: 120)]
    private string $district = '';

    #[ORM\Column(type: 'float')]
    private float $latitude = 0;

    #[ORM\Column(type: 'float')]
    private float $longitude = 0;

    #[ORM\Column(type: 'integer')]
    private int $capacity = 0;

    #[ORM\Column(type: 'bigint')]
    private int $pricePerDay = 0;

    #[ORM\Column(type: 'string', length: 80)]
    private string $phone = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $email = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $website = '';

    #[ORM\Column(type: 'text')]
    private string $description = '';

    #[ORM\Column(type: 'json')]
    private array $amenities = [];

    #[ORM\Column(type: 'text')]
    private string $mainImage = '';

    #[ORM\Column(type: 'json')]
    private array $gallery = [];

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'Disponible';

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $name): self { $this->name = $name; return $this; }
    public function getType(): string { return $this->type; }
    public function setType(string $type): self { $this->type = $type; return $this; }
    public function getAddress(): string { return $this->address; }
    public function setAddress(string $address): self { $this->address = $address; return $this; }
    public function getCity(): string { return $this->city; }
    public function setCity(string $city): self { $this->city = $city; return $this; }
    public function getDistrict(): string { return $this->district; }
    public function setDistrict(string $district): self { $this->district = $district; return $this; }
    public function getLatitude(): float { return $this->latitude; }
    public function setLatitude(float $latitude): self { $this->latitude = $latitude; return $this; }
    public function getLongitude(): float { return $this->longitude; }
    public function setLongitude(float $longitude): self { $this->longitude = $longitude; return $this; }
    public function getCapacity(): int { return $this->capacity; }
    public function setCapacity(int $capacity): self { $this->capacity = $capacity; return $this; }
    public function getPricePerDay(): int { return $this->pricePerDay; }
    public function setPricePerDay(int $pricePerDay): self { $this->pricePerDay = $pricePerDay; return $this; }
    public function getPhone(): string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getWebsite(): string { return $this->website; }
    public function setWebsite(string $website): self { $this->website = $website; return $this; }
    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): self { $this->description = $description; return $this; }
    public function getAmenities(): array { return $this->amenities; }
    public function setAmenities(array $amenities): self { $this->amenities = $amenities; return $this; }
    public function getMainImage(): string { return $this->mainImage; }
    public function setMainImage(string $mainImage): self { $this->mainImage = $mainImage; return $this; }
    public function getGallery(): array { return $this->gallery; }
    public function setGallery(array $gallery): self { $this->gallery = $gallery; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
}