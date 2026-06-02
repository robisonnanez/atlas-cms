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
        $identity = Setting::query()->where('key', 'site.identity')->first();
        $seo = Setting::query()->where('key', 'site.seo')->first();
        $system = Setting::query()->where('key', 'site.system')->first();
        $chrome = Setting::query()->where('key', 'site.chrome')->first();
        $chromeValue = $chrome?->value ?? [];

        data_set($chromeValue, 'header.advanced_html', data_get($chromeValue, 'header.advanced_html') ?: $this->renderHeaderHtml($identity?->value ?? []));
        data_set($chromeValue, 'footer.advanced_html', data_get($chromeValue, 'footer.advanced_html') ?: $this->renderFooterHtml($identity?->value ?? []));

        return Inertia::render('admin/settings/edit', [
            'settings' => [
                'identity' => $identity,
                'seo' => $seo,
                'system' => $system,
                'chrome' => [
                    'value' => $chromeValue,
                ],
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
            'header_advanced_html' => ['nullable', 'string'],
            'footer_advanced_html' => ['nullable', 'string'],
        ]);

        Setting::query()->updateOrCreate(
            ['key' => 'site.identity'],
            ['group' => 'general', 'value' => ['name' => $data['site_name'], 'tagline' => $data['site_tagline'] ?? null], 'is_public' => true],
        );

        Setting::query()->updateOrCreate(
            ['key' => 'site.system'],
            ['group' => 'system', 'value' => ['timezone' => $data['timezone'] ?? 'America/Bogota', 'locale' => $data['locale'] ?? 'es', 'maintenance' => (bool) ($data['maintenance'] ?? false)], 'is_public' => false],
        );

        Setting::query()->updateOrCreate(
            ['key' => 'site.seo'],
            ['group' => 'seo', 'value' => ['title' => $data['seo_title'] ?? null, 'description' => $data['seo_description'] ?? null], 'is_public' => true],
        );

        $existingChrome = Setting::query()->where('key', 'site.chrome')->first()?->value ?? [];

        Setting::query()->updateOrCreate(
            ['key' => 'site.chrome'],
            ['group' => 'theme', 'value' => [
                'header' => array_merge((array) data_get($existingChrome, 'header', []), [
                    'advanced_html' => $data['header_advanced_html'] ?? null,
                ]),
                'footer' => array_merge((array) data_get($existingChrome, 'footer', []), [
                    'advanced_html' => $data['footer_advanced_html'] ?? null,
                ]),
            ], 'is_public' => true],
        );

        if ($request->user()) {
            $request->session()->put('atlas.locale', $data['locale'] ?? 'es');
        }

        return back()->with('success', 'Configuración actualizada correctamente.');
    }

    protected function renderHeaderHtml(array $identity): string
    {
        $brand = e($identity['name'] ?? 'Atlas CMS');
        $tagline = e($identity['tagline'] ?? 'Operaciones de contenido modernas');

        return <<<HTML
<header class="border-b border-slate-200/80 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" class="flex items-center gap-3">
            <img src="/atlas-cms-logo.png" alt="Atlas CMS" class="h-12 w-auto rounded-2xl object-contain" />
            <div>
                <div class="text-sm font-semibold text-slate-900">{$brand}</div>
                <div class="text-xs text-slate-500">{$tagline}</div>
            </div>
        </a>
        <nav class="hidden items-center gap-6 text-sm md:flex">
            <a href="/" class="text-slate-600 transition hover:text-slate-950">Home</a>
            <a href="/login" class="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-950 hover:text-white">Admin</a>
        </nav>
    </div>
</header>
HTML;
    }

    protected function renderFooterHtml(array $identity): string
    {
        $brand = e($identity['name'] ?? 'Atlas CMS');
        $tagline = e($identity['tagline'] ?? 'Contenido, men?s, media y publicaciones gestionadas desde Atlas CMS.');

        return <<<HTML
<footer class="border-t border-slate-200 bg-slate-950 text-slate-200">
    <div class="mx-auto max-w-6xl px-6 py-12">
        <div class="flex flex-col gap-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>{$brand}</p>
            <p>{$tagline}</p>
        </div>
    </div>
</footer>
HTML;
    }
}
