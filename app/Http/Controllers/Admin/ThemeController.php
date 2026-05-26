<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Support\Cms\ThemeManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends Controller
{
    public function __construct(
        protected ThemeManager $themes,
    ) {
    }

    public function index(): Response
    {
        return Inertia::render('admin/themes/index', [
            'themes' => Theme::query()->orderBy('name')->get(),
            'discovered' => $this->themes->discover(),
        ]);
    }

    public function activate(Theme $theme): RedirectResponse
    {
        DB::transaction(function () use ($theme): void {
            Theme::query()->update(['is_active' => false]);
            $theme->update(['is_active' => true]);
        });

        return back()->with('success', 'Theme activated.');
    }
}
