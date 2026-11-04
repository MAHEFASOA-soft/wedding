<?php

namespace App\Controller;

use App\Entity\Event;
use App\Entity\TaskItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class TaskController extends AbstractController
{

        #[Route('/tasks', name: 'api_tasks', methods: ['GET'])]
        public function getTasks(EntityManagerInterface $entityManager): JsonResponse
        {
            $items = $entityManager->getRepository(TaskItem::class)->findAll();
            return $this->json(array_map(fn (TaskItem $task) => [
                'id' => $task->getId(),
                'eventId' => $task->getEventId(),
                'eventName' => $task->getEventName(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'assignedTo' => $task->getAssignedTo(),
                'dueDate' => $task->getDueDate(),
                'priority' => $task->getPriority(),
                'status' => $task->getStatus(),
            ], $items));
        }

        #[Route('/tasks', name: 'api_create_task', methods: ['POST'])]
        public function createTask(Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $payload = json_decode($request->getContent(), true) ?? [];
            $event = null;
            if (isset($payload['eventId']) && $payload['eventId'] !== '') {
                $event = is_string($payload['eventId'])
                    ? $entityManager->getRepository(Event::class)->find($payload['eventId'])
                    : null;
                if (!$event) return $this->json(['error' => 'Event not found'], 422);
            }
            $task = new TaskItem();
            $task->setId($payload['id'] ?? uniqid('tsk-', true));
            $task->setEvent($event);
            $task->setEventName(array_key_exists('eventName', $payload) ? $payload['eventName'] : null);
            $task->setTitle((string) ($payload['title'] ?? ''));
            $task->setDescription(array_key_exists('description', $payload) ? $payload['description'] : null);
            $task->setAssignedTo((string) ($payload['assignedTo'] ?? ''));
            $task->setDueDate((string) ($payload['dueDate'] ?? date('Y-m-d')));
            $task->setPriority((string) ($payload['priority'] ?? 'Moyenne'));
            $task->setStatus((string) ($payload['status'] ?? 'À faire'));
            $entityManager->persist($task);
            $entityManager->flush();
            return $this->json($this->serializeTask($task), 201);
        }

        #[Route('/tasks/{id}', name: 'api_update_task', methods: ['PUT', 'PATCH'])]
        public function updateTask(string $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
        {
            $task = $entityManager->getRepository(TaskItem::class)->find($id);
            if (!$task) {
                return $this->json(['error' => 'Task not found'], 404);
            }
            $payload = json_decode($request->getContent(), true) ?? [];
            if (array_key_exists('eventId', $payload)) {
                $event = null;
                if ($payload['eventId'] !== null && $payload['eventId'] !== '') {
                    $event = is_string($payload['eventId'])
                        ? $entityManager->getRepository(Event::class)->find($payload['eventId'])
                        : null;
                    if (!$event) return $this->json(['error' => 'Event not found'], 422);
                }
                $task->setEvent($event);
            }
            if (array_key_exists('eventName', $payload)) $task->setEventName($payload['eventName']);
            if (isset($payload['title'])) $task->setTitle((string) $payload['title']);
            if (array_key_exists('description', $payload)) $task->setDescription($payload['description']);
            if (isset($payload['assignedTo'])) $task->setAssignedTo((string) $payload['assignedTo']);
            if (isset($payload['dueDate'])) $task->setDueDate((string) $payload['dueDate']);
            if (isset($payload['priority'])) $task->setPriority((string) $payload['priority']);
            if (isset($payload['status'])) $task->setStatus((string) $payload['status']);
            $entityManager->flush();
            return $this->json($this->serializeTask($task));
        }

        #[Route('/tasks/{id}', name: 'api_delete_task', methods: ['DELETE'])]
        public function deleteTask(string $id, EntityManagerInterface $entityManager): JsonResponse
        {
            $task = $entityManager->getRepository(TaskItem::class)->find($id);
            if (!$task) {
                return $this->json(['error' => 'Task not found'], 404);
            }
            $entityManager->remove($task);
            $entityManager->flush();
            return $this->json(['success' => true]);
        }

        private function serializeTask(TaskItem $task): array
        {
            return [
                'id' => $task->getId(),
                'eventId' => $task->getEventId(),
                'eventName' => $task->getEventName(),
                'title' => $task->getTitle(),
                'description' => $task->getDescription(),
                'assignedTo' => $task->getAssignedTo(),
                'dueDate' => $task->getDueDate(),
                'priority' => $task->getPriority(),
                'status' => $task->getStatus(),
            ];
        }
}
