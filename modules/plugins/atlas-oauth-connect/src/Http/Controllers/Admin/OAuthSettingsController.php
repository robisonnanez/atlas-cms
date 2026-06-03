<?php

namespace Modules\Plugins\AtlasOAuthConnect\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Plugins\AtlasOAuthConnect\Support\OAuthConfig;
use Modules\Plugins\AtlasOAuthConnect\Support\OAuthProviderRegistry;

class OAuthSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/plugins/oauth-connect', [
            'pluginActive' => Plugin::query()->where('slug', 'atlas-oauth-connect')->value('is_active') ?? false,
            'socialiteInstalled' => class_exists(\Laravel\Socialite\Facades\Socialite::class),
            'providers' => OAuthProviderRegistry::all(),
            'settings' => [
                'google_enabled' => (bool) OAuthConfig::setting('google_enabled', false),
                'google_client_id' => (string) OAuthConfig::setting('google_client_id', ''),
                'google_client_secret' => (string) OAuthConfig::setting('google_client_secret', ''),
                'allow_auto_register' => (bool) OAuthConfig::setting('allow_auto_register', true),
            ],
            'callbackUrls' => [
                'google' => url('/auth/oauth/google/callback'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'google_enabled' => ['required', 'boolean'],
            'google_client_id' => ['nullable', 'string', 'max:255'],
            'google_client_secret' => ['nullable', 'string', 'max:500'],
            'allow_auto_register' => ['required', 'boolean'],
        ]);

        foreach ($data as $key => $value) {
            OAuthConfig::saveSetting($key, $value);
        }

        return Redirect::route('admin.plugins.atlas-oauth-connect.index')
            ->with('success', 'Configuración OAuth actualizada correctamente.');
    }
}
