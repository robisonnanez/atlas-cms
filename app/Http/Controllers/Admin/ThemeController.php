<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Support\Cms\ExtensionArchiveInstaller;
use App\Support\Cms\ThemeManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function __construct(
        protected ThemeManager $themes,
        protected ExtensionArchiveInstaller $installer,
    ) {
    }

    public function index(): Response
    {
        $discovered = $this->themes->syncDiscovered();

        return Inertia::render('admin/themes/index', [
            'themes' => Theme::query()->orderByDesc('is_active')->orderBy('name')->get(),
            'discovered' => $discovered,
        ]);
    }

    public function install(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'archive' => ['required', 'file', 'mimes:zip'],
        ]);

        $installed = $this->installer->installThemeArchive($data['archive']);
        $this->themes->syncDiscovered();

        return back()->with('success', "Tema {$installed['slug']} instalado correctamente.");
    }

    public function activate(Theme $theme): RedirectResponse
    {
        DB::transaction(function () use ($theme): void {
            Theme::query()->update(['is_active' => false]);
            $theme->update(['is_active' => true]);
        });

        return back()->with('success', 'Tema activado correctamente.');
    }
}
