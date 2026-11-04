<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'event_employee_assignment')]
class EventEmployeeAssignment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Event::class)]
    #[ORM\JoinColumn(
        name: 'event_id',
        referencedColumnName: 'id',
        nullable: false
    )]
    private ?Event $event = null;

    #[ORM\ManyToOne(targetEntity: EmployeeProfile::class)]
    #[ORM\JoinColumn(name: 'employee_profile_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?EmployeeProfile $employeeProfile = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $assignmentRole = '';

    public function getId(): ?int { return $this->id; }

    public function getEvent(): ?Event { return $this->event; }
    public function setEvent(?Event $event): self { $this->event = $event; return $this; }

    public function getEmployeeProfile(): ?EmployeeProfile { return $this->employeeProfile; }
    public function setEmployeeProfile(?EmployeeProfile $employeeProfile): self { $this->employeeProfile = $employeeProfile; return $this; }

    public function getAssignmentRole(): string { return $this->assignmentRole; }
    public function setAssignmentRole(string $assignmentRole): self { $this->assignmentRole = $assignmentRole; return $this; }

}
