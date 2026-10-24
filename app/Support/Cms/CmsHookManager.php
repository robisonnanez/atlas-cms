<?php

namespace App\Support\Cms;

class CmsHookManager
{
    /**
     * @var array<string, array<int, array<int, callable>>>
     */
    protected array $actions = [];

    /**
     * @var array<string, array<int, array<int, callable>>>
     */
    protected array $filters = [];

    /**
     * Registra una acción para un punto de enganche (hook) con prioridad.
     */
    public function addAction(string $hook, callable $callback, int $priority = 10): void
    {
        $this->actions[$hook][$priority][] = $callback;
        ksort($this->actions[$hook]);
    }

    /**
     * Ejecuta las acciones registradas en el hook dado.
     */
    public function doAction(string $hook, mixed ...$payload): void
    {
        if (empty($this->actions[$hook])) {
            return;
        }

        foreach ($this->actions[$hook] as $callbacks) {
            foreach ($callbacks as $callback) {
                $callback(...$payload);
            }
        }
    }

    /**
     * Registra un filtro para modificar un valor en el hook dado.
     */
    public function addFilter(string $hook, callable $callback, int $priority = 10): void
    {
        $this->filters[$hook][$priority][] = $callback;
        ksort($this->filters[$hook]);
    }

    /**
     * Aplica los filtros registrados consecutivamente sobre el valor dado.
     */
    public function applyFilters(string $hook, mixed $value, mixed ...$payload): mixed
    {
        if (empty($this->filters[$hook])) {
            return $value;
        }

        foreach ($this->filters[$hook] as $callbacks) {
            foreach ($callbacks as $callback) {
                $value = $callback($value, ...$payload);
            }
        }

        return $value;
    }

    public function hasAction(string $hook): bool
    {
        return ! empty($this->actions[$hook]);
    }

    public function hasFilter(string $hook): bool
    {
        return ! empty($this->filters[$hook]);
    }

    public function removeAllActions(string $hook): void
    {
        unset($this->actions[$hook]);
    }

    public function removeAllFilters(string $hook): void
    {
        unset($this->filters[$hook]);
    }

    /**
     * @return array<int, string>
     */
    public function getRegisteredActions(): array
    {
        return array_keys($this->actions);
    }

    /**
     * @return array<int, string>
     */
    public function getRegisteredFilters(): array
    {
        return array_keys($this->filters);
    }
}
