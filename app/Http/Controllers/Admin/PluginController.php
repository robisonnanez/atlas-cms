<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Support\Cms\ExtensionArchiveInstaller;
use App\Support\Cms\PluginManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PluginController extends Controller
{
    public function __construct(
        protected PluginManager $plugins,
        protected ExtensionArchiveInstaller $installer,
    ) {
    }

    public function index(): Response
    {
        $discovered = $this->plugins->syncDiscovered();

        return Inertia::render('admin/plugins/index', [
            'plugins' => Plugin::query()->orderByDesc('is_active')->orderBy('name')->get(),
            'discovered' => $discovered,
        ]);
    }

    public function install(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'archive' => ['required', 'file', 'mimes:zip'],
        ]);

        $installed = $this->installer->installPluginArchive($data['archive']);
        $this->plugins->syncDiscovered();

        return back()->with('success', "Plugin {$installed['slug']} instalado correctamente.");
    }

    public function toggle(Plugin $plugin): RedirectResponse
    {
        $plugin->update(['is_active' => ! $plugin->is_active]);

        return back()->with('success', $plugin->is_active ? 'Plugin activado correctamente.' : 'Plugin desactivado correctamente.');
    }
}
