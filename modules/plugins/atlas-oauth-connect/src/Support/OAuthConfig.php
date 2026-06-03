<?php

namespace Modules\Plugins\AtlasOAuthConnect\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Throwable;

class OAuthConfig
{
    protected const SETTINGS_KEY = 'plugin.atlas_oauth_connect';

    public static function boot(): void
    {
        foreach (OAuthProviderRegistry::all() as $provider => $meta) {
            Config::set("services.{$meta['driver']}", [
                'enabled' => (bool) static::setting($meta['enabled_key'], false),
                'client_id' => static::setting($meta['client_id_key']),
                'client_secret' => static::setting($meta['client_secret_key']),
                'redirect' => url("/auth/oauth/{$provider}/callback"),
            ]);
        }
    }

    public static function setting(string $key, mixed $default = null): mixed
    {
        try {
            $settings = Setting::query()->where('key', static::SETTINGS_KEY)->first()?->value ?? [];

            return data_get($settings, $key, $default);
        } catch (Throwable) {
            return cache()->get("settings.".static::SETTINGS_KEY.".{$key}", $default);
        }
    }

    public static function saveSetting(string $key, mixed $value): void
    {
        try {
            $existing = Setting::query()->where('key', static::SETTINGS_KEY)->first();
            $payload = (array) ($existing?->value ?? []);
            data_set($payload, $key, $value);

            Setting::query()->updateOrCreate(
                ['key' => static::SETTINGS_KEY],
                [
                    'group' => 'plugins',
                    'value' => $payload,
                    'is_public' => false,
                ],
            );
        } catch (Throwable) {
            cache()->forever("settings.".static::SETTINGS_KEY.".{$key}", $value);
        }
    }

    public static function allowAutoRegister(): bool
    {
        return (bool) static::setting('allow_auto_register', true);
    }
}
