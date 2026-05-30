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
                'chrome' => Setting::query()->where('key', 'site.chrome')->first(),
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
            'header_notice_label' => ['nullable', 'string', 'max:120'],
            'header_notice_text' => ['nullable', 'string', 'max:255'],
            'header_cta_label' => ['nullable', 'string', 'max:120'],
            'header_cta_url' => ['nullable', 'string', 'max:255'],
            'footer_intro_title' => ['nullable', 'string', 'max:255'],
            'footer_intro_body' => ['nullable', 'string'],
            'footer_col_1_title' => ['nullable', 'string', 'max:255'],
            'footer_col_1_body' => ['nullable', 'string'],
            'footer_col_2_title' => ['nullable', 'string', 'max:255'],
            'footer_col_2_body' => ['nullable', 'string'],
            'footer_col_3_title' => ['nullable', 'string', 'max:255'],
            'footer_col_3_body' => ['nullable', 'string'],
            'footer_bottom_text' => ['nullable', 'string', 'max:255'],
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

        Setting::query()->updateOrCreate(
            ['key' => 'site.chrome'],
            ['group' => 'theme', 'value' => [
                'header' => [
                    'notice_label' => $data['header_notice_label'] ?? null,
                    'notice_text' => $data['header_notice_text'] ?? null,
                    'cta_label' => $data['header_cta_label'] ?? null,
                    'cta_url' => $data['header_cta_url'] ?? null,
                ],
                'footer' => [
                    'intro_title' => $data['footer_intro_title'] ?? null,
                    'intro_body' => $data['footer_intro_body'] ?? null,
                    'columns' => [
                        ['title' => $data['footer_col_1_title'] ?? null, 'body' => $data['footer_col_1_body'] ?? null],
                        ['title' => $data['footer_col_2_title'] ?? null, 'body' => $data['footer_col_2_body'] ?? null],
                        ['title' => $data['footer_col_3_title'] ?? null, 'body' => $data['footer_col_3_body'] ?? null],
                    ],
                    'bottom_text' => $data['footer_bottom_text'] ?? null,
                ],
            ], 'is_public' => true],
        );

        return back()->with('success', 'Settings updated.');
    }
}
