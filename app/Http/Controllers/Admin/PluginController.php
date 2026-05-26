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
        return Inertia::render('admin/plugins/index', [
            'plugins' => Plugin::query()->orderBy('name')->get(),
            'discovered' => $this->plugins->discover(),
        ]);
    }

    public function toggle(Plugin $plugin): RedirectResponse
    {
        $plugin->update(['is_active' => ! $plugin->is_active]);

        return back()->with('success', 'Plugin state updated.');
    }
}
