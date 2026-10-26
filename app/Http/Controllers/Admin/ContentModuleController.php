<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Modules\Contracts\ContentModuleManagerContract;
use App\Http\Controllers\Controller;
use App\Models\CmsMenu;
use App\Models\ContentModule;
use App\Models\Page;
use App\Support\Cms\ThemeManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentModuleController extends Controller
{
    public function __construct(
        protected ContentModuleManagerContract $moduleManager,
        protected ThemeManager $themeManager,
    ) {}

    public function index(Request $request): Response
    {
        $position = $request->query('position');
        $status = $request->query('status');

        $modules = ContentModule::query()
            ->when($position, fn ($q) => $q->where('position', $position))
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->ordered()
            ->get();

        $activeTheme = $this->themeManager->active();
        $positions = $this->moduleManager->getAvailablePositions($activeTheme?->slug);
        $types = array_values($this->moduleManager->getAvailableTypes());
        $menus = CmsMenu::query()->get(['id', 'name', 'location']);
        $pages = Page::query()->published()->get(['id', 'title', 'slug']);

        return Inertia::render('admin/content-modules/index', [
            'modules' => $modules,
            'positions' => $positions,
            'types' => $types,
            'menus' => $menus,
            'pages' => $pages,
            'activeTheme' => $activeTheme,
            'filters' => [
                'position' => $position,
                'status' => $status,
            ],
            'stats' => [
                'total' => ContentModule::count(),
                'active' => ContentModule::query()->active()->count(),
                'positions_count' => count($positions),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'show_title' => ['boolean'],
            'type' => ['required', 'string', 'max:60'],
            'position' => ['required', 'string', 'max:60'],
            'theme_slug' => ['nullable', 'string', 'max:60'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'content' => ['nullable', 'array'],
            'assignment' => ['nullable', 'array'],
            'custom_classes' => ['nullable', 'string', 'max:255'],
        ]);

        if (! isset($data['order'])) {
            $data['order'] = (ContentModule::query()->where('position', $data['position'])->max('order') ?? -1) + 1;
        }

        $module = ContentModule::query()->create($data);

        return redirect()->route('admin.content-modules.index')
            ->with('success', "Módulo «{$module->title}» creado exitosamente.");
    }

    public function update(Request $request, ContentModule $contentModule): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'show_title' => ['boolean'],
            'type' => ['required', 'string', 'max:60'],
            'position' => ['required', 'string', 'max:60'],
            'theme_slug' => ['nullable', 'string', 'max:60'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'content' => ['nullable', 'array'],
            'assignment' => ['nullable', 'array'],
            'custom_classes' => ['nullable', 'string', 'max:255'],
        ]);

        $contentModule->update($data);

        return redirect()->route('admin.content-modules.index')
            ->with('success', "Módulo «{$contentModule->title}» actualizado exitosamente.");
    }

    public function destroy(ContentModule $contentModule): RedirectResponse
    {
        $title = $contentModule->title;
        $contentModule->delete();

        return redirect()->route('admin.content-modules.index')
            ->with('success', "Módulo «{$title}» eliminado.");
    }

    public function toggle(ContentModule $contentModule): RedirectResponse
    {
        $contentModule->update(['is_active' => ! $contentModule->is_active]);

        return back()->with('success', $contentModule->is_active ? 'Módulo activado.' : 'Módulo desactivado.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:content_modules,id'],
            'items.*.order' => ['required', 'integer', 'min:0'],
            'items.*.position' => ['nullable', 'string', 'max:60'],
        ]);

        foreach ($data['items'] as $item) {
            $update = ['order' => $item['order']];
            if (! empty($item['position'])) {
                $update['position'] = $item['position'];
            }
            ContentModule::query()->where('id', $item['id'])->update($update);
        }

        return back()->with('success', 'Orden de módulos actualizado correctamente.');
    }
}
