<?php

namespace Modules\Plugins\AtlasForgeEditor;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Plugins\AtlasForgeEditor\Support\AtlasForgeEditor;

class PluginServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AtlasForgeEditor::class, fn () => new AtlasForgeEditor());

        $this->mergeConfigFrom(__DIR__ . '/../config/atlas-forge-editor.php', 'atlas-forge-editor');
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'atlas-forge-editor');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');

        $this->publishes([
            __DIR__ . '/../resources/js' => resource_path('js/plugins/atlas-forge-editor'),
            __DIR__ . '/../resources/css' => resource_path('css/plugins/atlas-forge-editor'),
        ], 'atlas-forge-editor-assets');

        Blade::directive('atlasForgeEditorAssets', function () {
            return "<?php echo app(\\Modules\\Plugins\\AtlasForgeEditor\\Support\\AtlasForgeEditor::class)->assetsHtml(); ?>";
        });

        $this->registerRoutes();
        $this->registerHooks();
    }

    protected function registerRoutes(): void
    {
        if (file_exists(__DIR__ . '/../routes/admin.php')) {
            Route::middleware(['web', 'auth'])
                ->prefix('admin/plugins/atlas-forge-editor')
                ->name('admin.plugins.atlas-forge-editor.')
                ->group(__DIR__ . '/../routes/admin.php');
        }
    }

    protected function registerHooks(): void
    {
        // Atlas puede implementar hooks de distintas formas durante la V1.
        // Por eso se registra de forma defensiva: si existe el manager de hooks, lo usa;
        // si no existe, el plugin sigue siendo instalable y los assets pueden publicarse manualmente.
        if (! $this->app->bound('atlas.hooks')) {
            return;
        }

        $hooks = $this->app->make('atlas.hooks');
        $editor = $this->app->make(AtlasForgeEditor::class);

        $hooks->listen('editor.register', fn (array $editors = []) => array_merge($editors, [$editor->definition()]));
        $hooks->listen('editor.assets', fn (array $assets = []) => array_merge($assets, $editor->assets()));
        $hooks->listen('content.before_save', fn (array $payload = []) => $editor->sanitizePayload($payload));
        $hooks->listen('settings.register', fn (array $settings = []) => array_merge($settings, $editor->settingsSchema()));
        $hooks->listen('admin.navigation.register', fn (array $items = []) => array_merge($items, $editor->navigationItems()));
    }
}
