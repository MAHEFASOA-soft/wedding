<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\FinanceExpense;
use App\Entity\FinanceReceipt;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/statistics')]
class StatisticsController extends AbstractController
{
    private const MONTHS_FR = [
        1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
        5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
        9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
    ];

    #[Route('', name: 'api_statistics', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $receipts = $entityManager->getRepository(FinanceReceipt::class)->findAll();
        $expenses = $entityManager->getRepository(FinanceExpense::class)->findAll();
        $events = $entityManager->getRepository(Event::class)->findAll();

        $totalReceipts = 0;
        $receiptsByEvent = [];
        $monthly = [];
        $currentMonth = new \DateTimeImmutable('first day of this month');
        $firstMonth = $currentMonth->modify('-5 months');

        for ($index = 0; $index < 6; $index++) {
            $month = $firstMonth->modify('+'.$index.' months');
            $key = $month->format('Y-m');
            $monthly[$key] = [
                'key' => $key,
                'month' => self::MONTHS_FR[(int) $month->format('n')].' '.$month->format('Y'),
                'receipts' => 0,
                'expenses' => 0,
            ];
        }

        foreach ($receipts as $receipt) {
            $amount = $receipt->getAmount();
            $totalReceipts += $amount;
            $eventId = $receipt->getEventId();
            if ($eventId !== null) $receiptsByEvent[$eventId] = ($receiptsByEvent[$eventId] ?? 0) + $amount;
            $monthKey = substr($receipt->getDate(), 0, 7);
            if (isset($monthly[$monthKey])) $monthly[$monthKey]['receipts'] += $amount;
        }

        $totalExpenses = 0;
        $expensesByEvent = [];
        $expensesByCategory = [];
        foreach ($expenses as $expense) {
            $amount = $expense->getAmount();
            $totalExpenses += $amount;
            $eventId = $expense->getEventId();
            if ($eventId !== null) $expensesByEvent[$eventId] = ($expensesByEvent[$eventId] ?? 0) + $amount;
            $category = $expense->getCategory();
            $expensesByCategory[$category] = ($expensesByCategory[$category] ?? 0) + $amount;
            $monthKey = substr($expense->getDate(), 0, 7);
            if (isset($monthly[$monthKey])) $monthly[$monthKey]['expenses'] += $amount;
        }

        $netProfit = $totalReceipts - $totalExpenses;
        $categoryRows = [];
        foreach ($expensesByCategory as $category => $amount) {
            $categoryRows[] = [
                'category' => $category,
                'amount' => $amount,
                'percent' => $totalExpenses > 0 ? round($amount / $totalExpenses * 100, 1) : 0,
            ];
        }
        usort($categoryRows, fn (array $left, array $right) => $right['amount'] <=> $left['amount']);

        $eventRows = [];
        foreach ($events as $event) {
            $eventId = $event->getId();
            $received = $receiptsByEvent[$eventId] ?? $event->getAmountReceived();
            $eventExpenses = $expensesByEvent[$eventId] ?? 0;
            $margin = $received - $eventExpenses;
            $eventRows[] = [
                'id' => $eventId,
                'name' => $event->getName(),
                'clientName' => $event->getClientName(),
                'amountReceived' => $received,
                'totalExpenses' => $eventExpenses,
                'netMargin' => $margin,
                'marginPercent' => $received > 0 ? round($margin / $received * 100, 1) : 0,
            ];
        }
        usort($eventRows, fn (array $left, array $right) => $right['netMargin'] <=> $left['netMargin']);

        return $this->json([
            'totals' => [
                'receipts' => $totalReceipts,
                'expenses' => $totalExpenses,
                'netProfit' => $netProfit,
                'profitMarginPercent' => $totalReceipts > 0 ? round($netProfit / $totalReceipts * 100, 1) : 0,
            ],
            'monthly' => array_values($monthly),
            'expensesByCategory' => $categoryRows,
            'eventsByMargin' => array_slice($eventRows, 0, 8),
        ]);
    }
}