<?php

namespace App\Support\Cms;

use App\Domain\Menus\Contracts\MenuResolverContract;
use App\Models\CmsMenu;
use App\Models\MenuItem;

class MenuResolver implements MenuResolverContract
{
    public function resolve(string $location): array
    {
        $menu = CmsMenu::query()
            ->with(['items.children.children.children'])
            ->where('location', $location)
            ->first();

        return $menu?->items
            ->whereNull('parent_id')
            ->sortBy('sort_order')
            ->values()
            ->map(fn (MenuItem $item) => $this->transformItem($item, 1))
            ->all() ?? [];
    }

    protected function transformItem(MenuItem $item, int $depth): array
    {
        return [
            'id' => $item->id,
            'label' => $item->label,
            'url' => $item->url,
            'target' => $item->target,
            'children' => $depth >= 4
                ? []
                : $item->children
                    ->sortBy('sort_order')
                    ->values()
                    ->map(fn (MenuItem $child) => $this->transformItem($child, $depth + 1))
                    ->all(),
        ];
    }
}
