<?php

namespace Modules\Plugins\AtlasOAuthConnect\Support;

class OAuthProviderRegistry
{
    public static function all(): array
    {
        return [
            'google' => [
                'label' => 'Google / Gmail',
                'driver' => 'google',
                'icon' => 'pi pi-google',
                'enabled_key' => 'google_enabled',
                'client_id_key' => 'google_client_id',
                'client_secret_key' => 'google_client_secret',
                'scopes' => ['openid', 'profile', 'email'],
            ],
        ];
    }

    public static function get(string $provider): ?array
    {
        return static::all()[$provider] ?? null;
    }

    public static function enabled(): array
    {
        return collect(static::all())
            ->filter(fn (array $config): bool => (bool) config("services.{$config['driver']}.enabled", false))
            ->all();
    }
}
