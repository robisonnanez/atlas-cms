<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings/edit', [
            'settings' => [
                'identity' => Setting::query()->where('key', 'site.identity')->first(),
                'seo' => Setting::query()->where('key', 'site.seo')->first(),
                'system' => Setting::query()->where('key', 'site.system')->first(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:255'],
            'locale' => ['nullable', 'string', 'max:50'],
            'maintenance' => ['nullable', 'boolean'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
        ]);

        Setting::query()->updateOrCreate(
            ['key' => 'site.identity'],
            ['group' => 'general', 'value' => ['name' => $data['site_name'], 'tagline' => $data['site_tagline'] ?? null], 'is_public' => true],
        );

        Setting::query()->updateOrCreate(
            ['key' => 'site.system'],
            ['group' => 'system', 'value' => ['timezone' => $data['timezone'] ?? 'UTC', 'locale' => $data['locale'] ?? 'en', 'maintenance' => (bool) ($data['maintenance'] ?? false)], 'is_public' => false],
        );

        Setting::query()->updateOrCreate(
            ['key' => 'site.seo'],
            ['group' => 'seo', 'value' => ['title' => $data['seo_title'] ?? null, 'description' => $data['seo_description'] ?? null], 'is_public' => true],
        );

        return back()->with('success', 'Settings updated.');
    }
}
