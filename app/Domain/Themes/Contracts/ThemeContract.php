<?php

namespace App\Domain\Themes\Contracts;

interface ThemeContract
{
    public function metadata(): array;

    public function boot(): void;

    public function registerHooks(): void;

    public function renderView(string $view, array $data = []): string;

    public function settingsSchema(): array;
}
