<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'event_team_member')]
class EventTeamMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: EventTeam::class)]
    #[ORM\JoinColumn(name: 'event_team_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?EventTeam $eventTeam = null;

    #[ORM\ManyToOne(targetEntity: TeamMember::class)]
    #[ORM\JoinColumn(name: 'team_member_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?TeamMember $teamMember = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $roleSnapshot = '';

    public function getId(): ?int { return $this->id; }

    public function getEventTeam(): ?EventTeam { return $this->eventTeam; }
    public function setEventTeam(?EventTeam $eventTeam): self { $this->eventTeam = $eventTeam; return $this; }

    public function getTeamMember(): ?TeamMember { return $this->teamMember; }
    public function setTeamMember(?TeamMember $teamMember): self { $this->teamMember = $teamMember; return $this; }

    public function getRoleSnapshot(): string { return $this->roleSnapshot; }
    public function setRoleSnapshot(string $roleSnapshot): self { $this->roleSnapshot = $roleSnapshot; return $this; }

}
