<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class EmployeeProfile
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 30)]
    private string $employeeType = 'Permanent';

    #[ORM\Column(type: 'string', length: 160)]
    private string $department = '';

    #[ORM\Column(type: 'text')]
    private string $experience = '';

    #[ORM\Column(type: 'json')]
    private array $skills = [];

    #[ORM\Column(type: 'string', length: 20)]
    private string $hireDate = '';

    #[ORM\Column(type: 'string', length: 30)]
    private string $availability = 'Disponible';

    #[ORM\Column(type: 'json')]
    private array $teamIds = [];

    #[ORM\Column(type: 'json')]
    private array $assignedEventIds = [];

    #[ORM\Column(type: 'text')]
    private string $notes = '';

    #[ORM\Column(type: 'json')]
    private array $languages = [];

    #[ORM\Column(type: 'string', length: 80, nullable: true)]
    private ?string $emergencyContact = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getEmployeeType(): string { return $this->employeeType; }
    public function setEmployeeType(string $employeeType): self { $this->employeeType = $employeeType; return $this; }
    public function getDepartment(): string { return $this->department; }
    public function setDepartment(string $department): self { $this->department = $department; return $this; }
    public function getExperience(): string { return $this->experience; }
    public function setExperience(string $experience): self { $this->experience = $experience; return $this; }
    public function getSkills(): array { return $this->skills; }
    public function setSkills(array $skills): self { $this->skills = $skills; return $this; }
    public function getHireDate(): string { return $this->hireDate; }
    public function setHireDate(string $hireDate): self { $this->hireDate = $hireDate; return $this; }
    public function getAvailability(): string { return $this->availability; }
    public function setAvailability(string $availability): self { $this->availability = $availability; return $this; }
    public function getTeamIds(): array { return $this->teamIds; }
    public function setTeamIds(array $teamIds): self { $this->teamIds = $teamIds; return $this; }
    public function getAssignedEventIds(): array { return $this->assignedEventIds; }
    public function setAssignedEventIds(array $assignedEventIds): self { $this->assignedEventIds = $assignedEventIds; return $this; }
    public function getNotes(): string { return $this->notes; }
    public function setNotes(string $notes): self { $this->notes = $notes; return $this; }
    public function getLanguages(): array { return $this->languages; }
    public function setLanguages(array $languages): self { $this->languages = $languages; return $this; }
    public function getEmergencyContact(): ?string { return $this->emergencyContact; }
    public function setEmergencyContact(?string $emergencyContact): self { $this->emergencyContact = $emergencyContact; return $this; }
}