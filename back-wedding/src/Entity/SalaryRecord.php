<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class SalaryRecord
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 64)]
    private string $id;

    #[ORM\Column(type: 'string', length: 180)]
    private string $employeeName = '';

    #[ORM\Column(type: 'string', length: 180)]
    private string $role = '';

    #[ORM\Column(type: 'string', length: 80)]
    private string $month = '';

    #[ORM\Column(type: 'bigint')]
    private int $baseSalary = 0;

    #[ORM\Column(type: 'bigint')]
    private int $bonus = 0;

    #[ORM\Column(type: 'bigint')]
    private int $deduction = 0;

    #[ORM\Column(type: 'bigint')]
    private int $netPaid = 0;

    #[ORM\Column(type: 'string', length: 20)]
    private string $paymentDate = '';

    #[ORM\Column(type: 'string', length: 40)]
    private string $status = 'À payer';

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comment = null;

    public function getId(): string { return $this->id; }
    public function setId(string $id): self { $this->id = $id; return $this; }
    public function getEmployeeName(): string { return $this->employeeName; }
    public function setEmployeeName(string $employeeName): self { $this->employeeName = $employeeName; return $this; }
    public function getRole(): string { return $this->role; }
    public function setRole(string $role): self { $this->role = $role; return $this; }
    public function getMonth(): string { return $this->month; }
    public function setMonth(string $month): self { $this->month = $month; return $this; }
    public function getBaseSalary(): int { return $this->baseSalary; }
    public function setBaseSalary(int $baseSalary): self { $this->baseSalary = $baseSalary; return $this; }
    public function getBonus(): int { return $this->bonus; }
    public function setBonus(int $bonus): self { $this->bonus = $bonus; return $this; }
    public function getDeduction(): int { return $this->deduction; }
    public function setDeduction(int $deduction): self { $this->deduction = $deduction; return $this; }
    public function getNetPaid(): int { return $this->netPaid; }
    public function setNetPaid(int $netPaid): self { $this->netPaid = $netPaid; return $this; }
    public function getPaymentDate(): string { return $this->paymentDate; }
    public function setPaymentDate(string $paymentDate): self { $this->paymentDate = $paymentDate; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }
    public function getComment(): ?string { return $this->comment; }
    public function setComment(?string $comment): self { $this->comment = $comment; return $this; }
}
