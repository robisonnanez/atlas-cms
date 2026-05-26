<?php

namespace App\Domain\Plugins\Contracts;

interface PluginContract
{
    public function metadata(): array;

    public function boot(): void;

    public function register(): void;

    public function permissions(): array;

    public function routes(): array;

    public function settingsSchema(): array;
}
