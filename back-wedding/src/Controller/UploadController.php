<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class UploadController extends AbstractController
{
    #[Route('/uploads', name: 'api_upload_image', methods: ['POST'])]
    public function upload(Request $request): JsonResponse
    {
        $file = $request->files->get('file');
        if (!$file || !$file->isValid()) return $this->json(['error' => 'Fichier manquant ou invalide.'], 400);
        $extensionsByMimeType = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->file($file->getPathname());
        if (!is_string($mimeType) || !isset($extensionsByMimeType[$mimeType])) {
            return $this->json(['error' => 'Format accepté : JPEG, PNG, WebP ou GIF.'], 415);
        }
        if ($file->getSize() > 8 * 1024 * 1024) return $this->json(['error' => 'La taille maximale est de 8 Mo.'], 413);

        $directory = $this->getParameter('kernel.project_dir').'/public/uploads';
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
            return $this->json(['error' => 'Le stockage des images est indisponible.'], 500);
        }
        $filename = bin2hex(random_bytes(16)).'.'.$extensionsByMimeType[$mimeType];
        $file->move($directory, $filename);
        return $this->json(['url' => '/uploads/'.$filename], 201);
    }
}