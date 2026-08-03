<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Services\TemplateService;
use App\Validators\TemplateValidator;

final class TemplateController
{
    public function __construct(
        private readonly Request $request,
        private readonly TemplateService $templates
    ) {
    }

    public function index(): void
    {
        Response::json(['items' => $this->templates->list()]);
    }

    public function show(string $id): void
    {
        $template = $this->templates->find((int) $id);

        if ($template === null) {
            $this->notFound();

            return;
        }

        Response::json($template);
    }

    public function create(): void
    {
        $data = TemplateValidator::validate((array) $this->request->body());

        Response::json($this->templates->create($data), 201);
    }

    public function update(string $id): void
    {
        $data = TemplateValidator::validateForUpdate((array) $this->request->body());
        $template = $this->templates->update((int) $id, $data);

        if ($template === null) {
            $this->notFound();

            return;
        }

        Response::json($template);
    }

    public function destroy(string $id): void
    {
        if (!$this->templates->delete((int) $id)) {
            $this->notFound();

            return;
        }

        Response::noContent();
    }

    private function notFound(): void
    {
        Response::error(Response::ERROR_NOT_FOUND, 'Dieses Template gibt es nicht.', 404);
    }
}
