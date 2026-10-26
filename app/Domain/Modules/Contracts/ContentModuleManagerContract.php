<?php

namespace App\Domain\Modules\Contracts;

use App\Models\ContentModule;

interface ContentModuleManagerContract
{
    /**
     * Retorna la lista de posiciones declaradas por el tema o posiciones estándar.
     *
     * @return array<int, array{key: string, label: string, description?: string}>
     */
    public function getAvailablePositions(?string $themeSlug = null): array;

    /**
     * Retorna los tipos de módulos disponibles (custom_html, menu, recent_posts, etc.).
     *
     * @return array<string, array{type: string, label: string, description: string, icon: string, default_content: array}>
     */
    public function getAvailableTypes(): array;

    /**
     * Determina si un módulo coincide con las reglas de asignación del contexto actual.
     */
    public function matchesAssignment(ContentModule $module, string $contextType, ?string $pageSlug = null): bool;

    /**
     * Resuelve el payload dinámico para un módulo individual (procesa HTML, menús, posts, etc.).
     */
    public function resolveModulePayload(ContentModule $module): array;

    /**
     * Resuelve y agrupa todos los módulos activos para las posiciones según el contexto solicitado.
     *
     * @return array<string, array<int, array>>
     */
    public function resolvePositionsForContext(string $contextType, ?string $pageSlug = null, ?string $themeSlug = null): array;
}
