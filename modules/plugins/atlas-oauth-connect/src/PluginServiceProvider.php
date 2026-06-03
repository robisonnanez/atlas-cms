<?php

namespace Modules\Plugins\AtlasOAuthConnect;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Plugins\AtlasOAuthConnect\Support\OAuthConfig;

class PluginServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // V1.0.0 usa Laravel Socialite para Google/Gmail.
    }

    public function boot(): void
    {
        OAuthConfig::boot();

        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        $this->registerRoutes();
    }

    protected function registerRoutes(): void
    {
        Route::middleware(['web'])
            ->group(__DIR__ . '/../routes/web.php');

        Route::middleware(['web', 'auth'])
            ->prefix('admin/plugins/atlas-oauth-connect')
            ->name('admin.plugins.atlas-oauth-connect.')
            ->group(__DIR__ . '/../routes/admin.php');
    }
}
