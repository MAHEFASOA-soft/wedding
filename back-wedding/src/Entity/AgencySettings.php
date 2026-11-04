<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class AgencySettings
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 16)]
    private string $id = 'main';

    #[ORM\Column(type: 'string', length: 180)]
    private string $agencyName = '';

    #[ORM\Column(type: 'string', length: 255)]
    private string $address = '';

    #[ORM\Column(type: 'string', length: 100)]
    private string $phone = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $email = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $nif = '';

    #[ORM\Column(type: 'string', length: 60)]
    private string $stat = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $currency = '';

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getAgencyName(): string { return $this->agencyName; }
    public function setAgencyName(string $agencyName): self { $this->agencyName = $agencyName; return $this; }
    public function getAddress(): string { return $this->address; }
    public function setAddress(string $address): self { $this->address = $address; return $this; }
    public function getPhone(): string { return $this->phone; }
    public function setPhone(string $phone): self { $this->phone = $phone; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }
    public function getNif(): string { return $this->nif; }
    public function setNif(string $nif): self { $this->nif = $nif; return $this; }
    public function getStat(): string { return $this->stat; }
    public function setStat(string $stat): self { $this->stat = $stat; return $this; }
    public function getCurrency(): string { return $this->currency; }
    public function setCurrency(string $currency): self { $this->currency = $currency; return $this; }
}