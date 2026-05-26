<?php

namespace App\Support\Cms;

class CmsHookManager
{
    protected array $actions = [];

    protected array $filters = [];

    public function addAction(string $hook, callable $callback): void
    {
        $this->actions[$hook][] = $callback;
    }

    public function doAction(string $hook, mixed ...$payload): void
    {
        foreach ($this->actions[$hook] ?? [] as $callback) {
            $callback(...$payload);
        }
    }

    public function addFilter(string $hook, callable $callback): void
    {
        $this->filters[$hook][] = $callback;
    }

    public function applyFilters(string $hook, mixed $value, mixed ...$payload): mixed
    {
        foreach ($this->filters[$hook] ?? [] as $callback) {
            $value = $callback($value, ...$payload);
        }

        return $value;
    }
}
