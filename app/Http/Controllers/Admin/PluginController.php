<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Support\Cms\PluginManager;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PluginController extends Controller
{
    public function __construct(
        protected PluginManager $plugins,
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

    public function toggle(Plugin $plugin): RedirectResponse
    {
        $plugin->update(['is_active' => ! $plugin->is_active]);

        return back()->with('success', 'Plugin state updated.');
    }
}
