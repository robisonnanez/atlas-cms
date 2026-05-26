<?php

namespace App\Support\Cms;

use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\CmsMenu;

class MenuResolver implements MenuResolverContract
{
    public function resolve(string $location): array
    {
        $menu = CmsMenu::query()
            ->with(['items.children'])
            ->where('location', $location)
            ->first();

        return $menu?->items
            ->whereNull('parent_id')
            ->sortBy('sort_order')
            ->values()
            ->map(fn ($item) => $this->transformItem($item))
            ->all() ?? [];
    }

    protected function transformItem($item): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url,
            'target' => $item->target,
            'children' => $item->children
                ->sortBy('sort_order')
                ->values()
                ->map(fn ($child) => $this->transformItem($child))
                ->all(),
        ];
    }
}
