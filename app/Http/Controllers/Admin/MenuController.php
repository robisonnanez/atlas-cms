<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsMenu;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/menus/index', [
            'menus' => CmsMenu::query()->with(['items.children'])->get(),
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

    public function storeItem(Request $request, CmsMenu $menu): RedirectResponse
    {
        $menu->items()->create($request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer'],
            'target' => ['nullable', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer'],
        ]));

        return back()->with('success', 'Menu item saved.');
    }

    public function updateItem(Request $request, MenuItem $item): RedirectResponse
    {
        $item->update($request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer'],
            'target' => ['nullable', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer'],
        ]));

        return back()->with('success', 'Menu item updated.');
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
}
