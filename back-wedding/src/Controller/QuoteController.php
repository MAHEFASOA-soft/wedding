<?php

namespace App\Controller;

use App\Entity\Quote;
use App\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class QuoteController extends AbstractController
{

        #[Route('/quotes', name: 'api_quotes', methods: ['GET'])]
        public function getQuotes(EntityManagerInterface $entityManager): JsonResponse
        {
            $quotes = $entityManager->getRepository(Quote::class)->findBy([], ['createdAt' => 'DESC']);
            return $this->json(array_map(fn (Quote $quote) => $this->serializeQuote($quote), $quotes));
        }

        #[Route('/quotes', name: 'api_create_quote', methods: ['POST'])]
        public function createQuote(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            $validationError = $this->validateQuoteContent($payload);
            if ($validationError) return $validationError;

            $now = (new \DateTimeImmutable())->format(DATE_ATOM);
            $quote = new Quote();
            $quote->setId('dev-'.bin2hex(random_bytes(16)));
            $quote->setQuoteNumber($this->nextQuoteNumber($entityManager));
            $quote->setClientName((string) ($payload['clientName'] ?? ''));
            $quote->setEventName((string) ($payload['eventName'] ?? ''));
            $quote->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $quote->setValidUntil((string) ($payload['validUntil'] ?? date('Y-m-d')));
            $quote->setTotalAmount((int) ($payload['totalAmount'] ?? 0));
            $quote->setStatus((string) ($payload['status'] ?? 'Brouillon'));
            $quote->setItems((array) ($payload['items'] ?? []));
            $quote->setVersion(1);
            $quote->setParentQuote(null);
            $quote->setEvent(null);
            $quote->setCreatedAt($now);
            $quote->setUpdatedAt($now);
            $quote->setChangeReason(null);
            $entityManager->persist($quote);
            $entityManager->flush();
            return $this->json($this->serializeQuote($quote), 201);
        }

        #[Route('/quotes/{id}/versions', name: 'api_create_quote_version', methods: ['POST'])]
        public function createQuoteVersion(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $parent = $entityManager->getRepository(Quote::class)->find($id);
            if (!$parent) {
                return $this->json(['error' => 'Quote not found'], 404);
            }
            if ($parent->getStatus() !== 'Envoyé') {
                return $this->json(['error' => 'Seul un devis envoyé peut être révisé.'], 409);
            }

            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;

            $changeReason = trim((string) ($payload['changeReason'] ?? ''));
            if ($changeReason === '') {
                return $this->json(['error' => 'Le motif de modification est obligatoire.'], 400);
            }
            $validationError = $this->validateQuoteContent($payload);
            if ($validationError) return $validationError;

            $now = (new \DateTimeImmutable())->format(DATE_ATOM);
            $parent->setStatus('Remplacé')->setUpdatedAt($now);

            $quote = new Quote();
            $quote->setId('dev-'.bin2hex(random_bytes(16)));
            $quote->setQuoteNumber($parent->getQuoteNumber());
            $quote->setVersion($parent->getVersion() + 1);
            $quote->setParentQuote($parent);
            $quote->setEvent(null);
            $quote->setCreatedAt($now)->setUpdatedAt($now)->setChangeReason($changeReason);
            $quote->setClientName((string) ($payload['clientName'] ?? $parent->getClientName()));
            $quote->setEventName((string) ($payload['eventName'] ?? $parent->getEventName()));
            $quote->setDate((string) ($payload['date'] ?? date('Y-m-d')));
            $quote->setValidUntil((string) ($payload['validUntil'] ?? $parent->getValidUntil()));
            $quote->setTotalAmount((int) ($payload['totalAmount'] ?? $parent->getTotalAmount()));
            $quote->setStatus('Envoyé');
            $quote->setItems((array) ($payload['items'] ?? $parent->getItems()));

            $entityManager->persist($quote);
            $entityManager->flush();
            return $this->json($this->serializeQuote($quote), 201);
        }

        #[Route('/quotes/{id}', name: 'api_update_quote', methods: ['PUT', 'PATCH'])]
        public function updateQuote(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $quote = $entityManager->getRepository(Quote::class)->find($id);
            if (!$quote) {
                return $this->json(['error' => 'Quote not found'], 404);
            }
            $payload = $this->decodePayload($request);
            if ($payload instanceof JsonResponse) return $payload;
            $contentFields = ['quoteNumber', 'clientName', 'eventName', 'date', 'validUntil', 'totalAmount', 'items'];
            $isDraft = $quote->getStatus() === 'Brouillon';
            if (!$isDraft && array_intersect($contentFields, array_keys($payload))) {
                return $this->json(['error' => 'Un devis envoyé ne peut être modifié directement. Créez une nouvelle version.'], 409);
            }
            if (isset($payload['status'])) {
                $nextStatus = (string) $payload['status'];
                if (!in_array($nextStatus, ['Brouillon', 'Envoyé', 'Accepté', 'Refusé'], true)) {
                    return $this->json(['error' => 'Le statut Remplacé est réservé à la création d’une nouvelle version.'], 409);
                }
                if (in_array($quote->getStatus(), ['Refusé', 'Remplacé'], true) && $nextStatus !== $quote->getStatus()) {
                    return $this->json(['error' => 'Un devis refusé ou remplacé ne peut pas être réactivé.'], 409);
                }
                if ($quote->getStatus() === 'Accepté' && $nextStatus !== 'Accepté') {
                    return $this->json(['error' => 'Un devis accepté ne peut pas être désactivé.'], 409);
                }
                $quote->setStatus($nextStatus);
            }
            if ($isDraft) {
                if (isset($payload['clientName'])) $quote->setClientName((string) $payload['clientName']);
                if (isset($payload['eventName'])) $quote->setEventName((string) $payload['eventName']);
                if (isset($payload['date'])) $quote->setDate((string) $payload['date']);
                if (isset($payload['validUntil'])) $quote->setValidUntil((string) $payload['validUntil']);
                if (isset($payload['totalAmount'])) $quote->setTotalAmount((int) $payload['totalAmount']);
                if (array_key_exists('items', $payload)) $quote->setItems((array) $payload['items']);
            }
            $quote->setUpdatedAt((new \DateTimeImmutable())->format(DATE_ATOM));
            $entityManager->flush();
            return $this->json($this->serializeQuote($quote));
        }

        #[Route('/quotes/{id}/event', name: 'api_link_quote_event', methods: ['PATCH'])]
        public function linkQuoteToEvent(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $quote = $entityManager->getRepository(Quote::class)->find($id);
            if (!$quote) {
                return $this->json(['error' => 'Quote not found'], 404);
            }
            if ($quote->getStatus() !== 'Accepté') {
                return $this->json(['error' => 'Seul un devis accepté peut être lié à un événement.'], 409);
            }
            if ($quote->getEventId()) {
                return $this->json(['error' => 'Ce devis est déjà lié à un événement.'], 409);
            }

            $payload = json_decode($request->getContent(), true) ?? [];
            $eventId = (string) ($payload['eventId'] ?? '');
            $event = $entityManager->getRepository(Event::class)->find($eventId);
            if (!$event) {
                return $this->json(['error' => 'Event not found'], 404);
            }

            $quote->setEvent($event)->setUpdatedAt((new \DateTimeImmutable())->format(DATE_ATOM));
            $entityManager->flush();
            return $this->json($this->serializeQuote($quote));
        }

        #[Route('/quotes/{id}', name: 'api_delete_quote', methods: ['DELETE'])]
        public function deleteQuote(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $quote = $entityManager->getRepository(Quote::class)->find($id);
            if (!$quote) {
                return $this->json(['error' => 'Quote not found'], 404);
            }
            if ($quote->getStatus() !== 'Brouillon' || $quote->getEventId()) {
                return $this->json(['error' => 'Seul un brouillon sans événement lié peut être supprimé.'], 409);
            }
            if ($entityManager->getRepository(Quote::class)->count(['parentQuote' => $quote]) > 0) {
                return $this->json(['error' => 'Un devis ayant des versions ne peut pas être supprimé.'], 409);
            }
            $entityManager->remove($quote);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function decodePayload(Request $request): array|JsonResponse
        {
            try {
                $payload = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                return $this->json(['error' => 'Invalid JSON payload'], 400);
            }

            return is_array($payload)
                ? $payload
                : $this->json(['error' => 'JSON object is required'], 400);
        }

        private function validateQuoteContent(array $payload): ?JsonResponse
        {
            foreach (['clientName', 'eventName', 'date', 'validUntil'] as $field) {
                if (!isset($payload[$field]) || !is_string($payload[$field]) || trim($payload[$field]) === '') {
                    return $this->json(['error' => sprintf('%s is required', $field)], 400);
                }
            }

            $amount = filter_var($payload['totalAmount'] ?? null, FILTER_VALIDATE_INT);
            if ($amount === false || $amount < 0) {
                return $this->json(['error' => 'totalAmount must be a non-negative integer'], 400);
            }
            if (!isset($payload['items']) || !is_array($payload['items'])) {
                return $this->json(['error' => 'items must be an array'], 400);
            }
            foreach ($payload['items'] as $item) {
                if (!is_array($item) || !isset($item['description'], $item['quantity'], $item['unitPrice'], $item['total']) || !is_string($item['description'])) {
                    return $this->json(['error' => 'Each quote item requires description, quantity, unitPrice and total'], 400);
                }
                foreach (['quantity', 'unitPrice', 'total'] as $field) {
                    $value = filter_var($item[$field], FILTER_VALIDATE_INT);
                    if ($value === false || $value < 0) {
                        return $this->json(['error' => sprintf('Quote item %s must be a non-negative integer', $field)], 400);
                    }
                }
            }

            if (isset($payload['status']) && !in_array($payload['status'], ['Brouillon', 'Envoyé'], true)) {
                return $this->json(['error' => 'A new quote must be a draft or sent quote'], 400);
            }

            return null;
        }

        private function nextQuoteNumber(EntityManagerInterface $entityManager): string
        {
            $year = date('Y');
            $highest = 0;
            foreach ($entityManager->getRepository(Quote::class)->findAll() as $quote) {
                if (preg_match('/^DEV-'.$year.'-(\d+)$/', $quote->getQuoteNumber(), $matches)) {
                    $highest = max($highest, (int) $matches[1]);
                }
            }

            return sprintf('DEV-%s-%03d', $year, $highest + 1);
        }

        private function serializeQuote(Quote $quote): array
        {
            return [
                'id' => $quote->getId(),
                'quoteNumber' => $quote->getQuoteNumber(),
                'version' => $quote->getVersion(),
                'parentQuoteId' => $quote->getParentQuoteId(),
                'eventId' => $quote->getEventId(),
                'createdAt' => $quote->getCreatedAt() ?: $quote->getDate().'T00:00:00Z',
                'updatedAt' => $quote->getUpdatedAt() ?: $quote->getDate().'T00:00:00Z',
                'changeReason' => $quote->getChangeReason(),
                'clientName' => $quote->getClientName(),
                'eventName' => $quote->getEventName(),
                'date' => $quote->getDate(),
                'validUntil' => $quote->getValidUntil(),
                'totalAmount' => $quote->getTotalAmount(),
                'status' => $quote->getStatus(),
                'items' => $quote->getItems(),
            ];
        }
}
