<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsMenu;
use App\Models\MenuItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/menus/index', [
            'menus' => CmsMenu::query()->with(['items'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        CmsMenu::query()->create($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]));

        return back()->with('success', 'Menu created.');
    }

    public function destroy(CmsMenu $menu): RedirectResponse
    {
        DB::transaction(function () use ($menu): void {
            $menu->items()->delete();
            $menu->delete();
        });

        return back()->with('success', 'Menu deleted.');
    }

    public function storeItem(Request $request, CmsMenu $menu): RedirectResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer'],
            'target' => ['nullable', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $this->assertHierarchyIsValid($menu->id, $data['parent_id'] ?? null, null);

        $menu->items()->create($data);

        return back()->with('success', 'Menu item saved.');
    }

    public function updateItem(Request $request, MenuItem $item): RedirectResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer'],
            'target' => ['nullable', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $this->assertHierarchyIsValid($item->menu_id, $data['parent_id'] ?? null, $item);

        $item->update($data);

        return back()->with('success', 'Menu item updated.');
    }

    public function destroyItem(MenuItem $item): RedirectResponse
    {
        DB::transaction(function () use ($item): void {
            $item->children()->update(['parent_id' => null]);
            $item->delete();
        });

        return back()->with('success', 'Menu item deleted.');
    }

    public function reorderItems(Request $request, CmsMenu $menu): RedirectResponse
    {
        $data = $request->validate([
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['integer'],
        ]);

        $items = $menu->items()->pluck('id')->all();
        $orderedIds = collect($data['ordered_ids'])->values()->all();

        if (array_diff($orderedIds, $items) || array_diff($items, $orderedIds)) {
            abort(422, 'The submitted menu order is invalid.');
        }

        DB::transaction(function () use ($orderedIds): void {
            foreach ($orderedIds as $index => $id) {
                MenuItem::query()->whereKey($id)->update(['sort_order' => $index + 1]);
            }
        });

        return back()->with('success', 'Menu order updated.');
    }

    public function updateTree(Request $request, CmsMenu $menu): RedirectResponse
    {
        $nodes = collect($request->input('tree', []));
        abort_if($nodes->isEmpty(), 422, 'The submitted menu tree is empty.');

        $items = $menu->items()->get(['id', 'parent_id'])->keyBy('id');
        $submittedIds = $this->flattenSubmittedTree($nodes)->all();
        $menuIds = $items->keys()->sort()->values()->all();
        $sortedSubmitted = collect($submittedIds)->sort()->values()->all();

        if ($menuIds !== $sortedSubmitted) {
            abort(422, 'The submitted menu tree is invalid.');
        }

        DB::transaction(function () use ($nodes): void {
            $this->persistTree($nodes, null, 1, 1);
        });

        return back()->with('success', 'Menu hierarchy updated.');
    }

    protected function persistTree(Collection $nodes, ?int $parentId, int $depth, int $sortBase): void
    {
        abort_if($depth > 4, 422, 'Atlas menus currently support up to 4 levels.');

        foreach ($nodes->values() as $index => $node) {
            $id = (int) ($node['key'] ?? $node['id'] ?? 0);
            $children = collect($node['children'] ?? []);

            MenuItem::query()->whereKey($id)->update([
                'parent_id' => $parentId,
                'sort_order' => $sortBase + $index,
            ]);

            if ($children->isNotEmpty()) {
                $this->persistTree($children, $id, $depth + 1, 1);
            }
        }
    }

    protected function flattenSubmittedTree(Collection $nodes): Collection
    {
        return $nodes->flatMap(function ($node) {
            $id = (int) ($node['key'] ?? $node['id'] ?? 0);
            $children = collect($node['children'] ?? []);

            return collect([$id])->merge($this->flattenSubmittedTree($children));
        })->filter();
    }

    protected function assertHierarchyIsValid(int $menuId, ?int $parentId, ?MenuItem $currentItem): void
    {
        $items = MenuItem::query()
            ->where('menu_id', $menuId)
            ->get(['id', 'parent_id'])
            ->keyBy('id');

        if ($parentId === null) {
            $resultingDepth = 1;
        } else {
            abort_unless($items->has($parentId), 422, 'The selected parent item does not belong to this menu.');
            abort_if($currentItem && $parentId === $currentItem->id, 422, 'An item cannot be its own parent.');

            if ($currentItem) {
                $descendantIds = $this->descendantIds($currentItem->id, $items);
                abort_if(in_array($parentId, $descendantIds, true), 422, 'An item cannot move inside one of its descendants.');
            }

            $resultingDepth = $this->nodeDepth($parentId, $items) + 1;
        }

        $branchDepth = $currentItem ? $this->subtreeDepth($currentItem->id, $items) : 1;
        abort_if(($resultingDepth - 1) + $branchDepth > 4, 422, 'Atlas menus currently support up to 4 levels.');
    }

    protected function nodeDepth(int $itemId, Collection $items): int
    {
        $depth = 1;
        $current = $items->get($itemId);

        while ($current?->parent_id && $items->has($current->parent_id)) {
            $depth++;
            $current = $items->get($current->parent_id);
        }

        return $depth;
    }

    protected function subtreeDepth(int $itemId, Collection $items): int
    {
        $children = $items->filter(fn (MenuItem $item) => $item->parent_id === $itemId);

        if ($children->isEmpty()) {
            return 1;
        }

        return 1 + $children->map(fn (MenuItem $item) => $this->subtreeDepth($item->id, $items))->max();
    }

    protected function descendantIds(int $itemId, Collection $items): array
    {
        $children = $items->filter(fn (MenuItem $item) => $item->parent_id === $itemId);
        $ids = [];

        foreach ($children as $child) {
            $ids[] = $child->id;
            $ids = [...$ids, ...$this->descendantIds($child->id, $items)];
        }

        return array_values(array_unique($ids));
    }
}
