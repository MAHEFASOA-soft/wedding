<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'invoice_receipt_allocation')]
class InvoiceReceiptAllocation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Invoice::class)]
    #[ORM\JoinColumn(name: 'invoice_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?Invoice $invoice = null;

    #[ORM\ManyToOne(targetEntity: FinanceReceipt::class)]
    #[ORM\JoinColumn(name: 'finance_receipt_id', referencedColumnName: 'id', nullable: false, onDelete: 'RESTRICT')]
    private ?FinanceReceipt $financeReceipt = null;

    #[ORM\Column(type: 'bigint')]
    private int $allocatedAmount = 0;

    public function getId(): ?int { return $this->id; }

    public function getInvoice(): ?Invoice { return $this->invoice; }
    public function setInvoice(?Invoice $invoice): self { $this->invoice = $invoice; return $this; }

    public function getFinanceReceipt(): ?FinanceReceipt { return $this->financeReceipt; }
    public function setFinanceReceipt(?FinanceReceipt $financeReceipt): self { $this->financeReceipt = $financeReceipt; return $this; }

    public function getAllocatedAmount(): int { return $this->allocatedAmount; }
    public function setAllocatedAmount(int $allocatedAmount): self { $this->allocatedAmount = $allocatedAmount; return $this; }

}
