<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Modulo;
use App\Services\PermissionSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NavigationAdminController extends Controller
{
    public function index(): Response
    {
        $locale = app()->getLocale() === 'en' ? 'en' : 'es';

        return Inertia::render('admin/navigation-management', [
            'modules' => Modulo::query()->orderBy('orden')->get(),
            'menus' => Menu::query()->orderBy('idModulos')->orderBy('orden')->get(),
            'parentMenus' => Menu::query()->whereNull('id_menu')->orderBy('nombre')->get(['id', 'nombre', 'translations'])->map(fn (Menu $menu) => [
                'id' => $menu->id,
                'nombre' => $menu->labelFor($locale),
                'translations' => $menu->translations ?? ['es' => $menu->nombre, 'en' => ''],
            ]),
        ]);
    }

    public function storeModule(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'idModulos' => ['required', 'integer', 'unique:modulos,idModulos'],
            'nmodulo' => ['nullable', 'string', 'max:60'],
            'orden' => ['nullable', 'integer', 'between:0,255'],
            'icono' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'detalle' => ['nullable', 'string', 'max:60'],
            'activo' => ['nullable', 'boolean'],
            'translations' => ['nullable', 'array'],
            'translations.es' => ['nullable', 'string', 'max:60'],
            'translations.en' => ['nullable', 'string', 'max:60'],
        ]);

        $translations = $this->normalizeTranslations($data['translations'] ?? [], $data['nmodulo'] ?? null);

        Modulo::create([
            ...$data,
            'nmodulo' => $translations['es'],
            'translations' => $translations,
            'activo' => (bool) ($data['activo'] ?? true),
        ]);

        return back()->with('success', 'Módulo creado correctamente.');
    }

    public function updateModule(Request $request, Modulo $modulo): RedirectResponse
    {
        $data = $request->validate([
            'nmodulo' => ['nullable', 'string', 'max:60'],
            'orden' => ['nullable', 'integer', 'between:0,255'],
            'icono' => ['nullable', 'string', 'max:60'],
            'color' => ['nullable', 'string', 'max:60'],
            'detalle' => ['nullable', 'string', 'max:60'],
            'activo' => ['nullable', 'boolean'],
            'translations' => ['nullable', 'array'],
            'translations.es' => ['nullable', 'string', 'max:60'],
            'translations.en' => ['nullable', 'string', 'max:60'],
        ]);

        $translations = $this->normalizeTranslations($data['translations'] ?? [], $data['nmodulo'] ?? $modulo->nmodulo);

        $modulo->update([
            ...$data,
            'nmodulo' => $translations['es'],
            'translations' => $translations,
            'activo' => (bool) ($data['activo'] ?? true),
        ]);

        return back()->with('success', 'Módulo actualizado.');
    }

    public function destroyModule(Modulo $modulo): RedirectResponse
    {
        if ($modulo->menus()->exists()) {
            return back()->with('error', 'No se puede eliminar el módulo porque tiene menús asociados.');
        }

        $modulo->delete();

        return back()->with('success', 'Módulo eliminado.');
    }

    public function storeMenu(Request $request, PermissionSyncService $syncService): RedirectResponse
    {
        $data = $request->validate([
            'idModulos' => ['required', 'integer', 'exists:modulos,idModulos'],
            'nombre' => ['nullable', 'string', 'max:120'],
            'url' => ['required', 'string', 'max:255'],
            'icono' => ['nullable', 'string', 'max:60'],
            'id_menu' => ['nullable', 'integer', 'exists:menu,id'],
            'main' => ['nullable', 'boolean'],
            'orden' => ['nullable', 'integer', 'between:0,32767'],
            'cesdo' => ['nullable', 'boolean'],
            'permission_name' => ['nullable', 'string', 'max:120'],
            'translations' => ['nullable', 'array'],
            'translations.es' => ['nullable', 'string', 'max:120'],
            'translations.en' => ['nullable', 'string', 'max:120'],
        ]);

        $translations = $this->normalizeTranslations($data['translations'] ?? [], $data['nombre'] ?? null);

        Menu::create([
            ...$data,
            'nombre' => $translations['es'],
            'translations' => $translations,
            'main' => (bool) ($data['main'] ?? false),
            'cesdo' => (bool) ($data['cesdo'] ?? true),
        ]);

        $syncService->syncFromMenu();

        return back()->with('success', 'Menú creado correctamente.');
    }

    public function updateMenu(Request $request, Menu $menu, PermissionSyncService $syncService): RedirectResponse
    {
        $data = $request->validate([
            'idModulos' => ['required', 'integer', 'exists:modulos,idModulos'],
            'nombre' => ['nullable', 'string', 'max:120'],
            'url' => ['required', 'string', 'max:255'],
            'icono' => ['nullable', 'string', 'max:60'],
            'id_menu' => ['nullable', 'integer', 'exists:menu,id'],
            'main' => ['nullable', 'boolean'],
            'orden' => ['nullable', 'integer', 'between:0,32767'],
            'cesdo' => ['nullable', 'boolean'],
            'permission_name' => ['nullable', 'string', 'max:120'],
            'translations' => ['nullable', 'array'],
            'translations.es' => ['nullable', 'string', 'max:120'],
            'translations.en' => ['nullable', 'string', 'max:120'],
        ]);

        $translations = $this->normalizeTranslations($data['translations'] ?? [], $data['nombre'] ?? $menu->nombre);

        $menu->update([
            ...$data,
            'nombre' => $translations['es'],
            'translations' => $translations,
            'main' => (bool) ($data['main'] ?? false),
            'cesdo' => (bool) ($data['cesdo'] ?? true),
        ]);

        $syncService->syncFromMenu();

        return back()->with('success', 'Menú actualizado.');
    }

    public function destroyMenu(Menu $menu): RedirectResponse
    {
        if ($menu->children()->exists()) {
            return back()->with('error', 'No se puede eliminar el menú porque tiene submenús.');
        }

        $menu->delete();

        return back()->with('success', 'Menú eliminado.');
    }

    protected function normalizeTranslations(array $translations, ?string $fallback): array
    {
        $es = trim((string) ($translations['es'] ?? $fallback ?? ''));
        $en = trim((string) ($translations['en'] ?? ''));

        return [
            'es' => $es !== '' ? $es : trim((string) $fallback),
            'en' => $en,
        ];
    }
}
