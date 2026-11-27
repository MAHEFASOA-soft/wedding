<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'event_service')]
class EventService
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(name: 'event_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?Event $event = null;

    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?Service $service = null;

    #[ORM\Column(type: 'integer')]
    private int $quantity = 1;

    #[ORM\Column(type: 'bigint')]
    private int $unitPriceSnapshot = 0;

    #[ORM\Column(type: 'string', length: 255)]
    private string $serviceNameSnapshot = '';

    public function getId(): ?int { return $this->id; }

    public function getEvent(): ?Event { return $this->event; }
    public function setEvent(?Event $event): self { $this->event = $event; return $this; }

    public function getService(): ?Service { return $this->service; }
    public function setService(?Service $service): self { $this->service = $service; return $this; }

    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): self { $this->quantity = $quantity; return $this; }

    public function getUnitPriceSnapshot(): int { return $this->unitPriceSnapshot; }
    public function setUnitPriceSnapshot(int $unitPriceSnapshot): self { $this->unitPriceSnapshot = $unitPriceSnapshot; return $this; }

    public function getServiceNameSnapshot(): string { return $this->serviceNameSnapshot; }
    public function setServiceNameSnapshot(string $serviceNameSnapshot): self { $this->serviceNameSnapshot = $serviceNameSnapshot; return $this; }

}
