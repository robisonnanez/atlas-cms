<?php

namespace Modules\Plugins\ContactForm;

use App\Support\Cms\CmsHookManager;
use Illuminate\Support\ServiceProvider;

class PluginServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $migrationsPath = __DIR__.'/../database/migrations';
        if (is_dir($migrationsPath)) {
            $this->loadMigrationsFrom($migrationsPath);
        }

        $routesPath = __DIR__.'/../routes/web.php';
        if (file_exists($routesPath)) {
            $this->loadRoutesFrom($routesPath);

            if ($this->app->bound('router')) {
                $this->app->make('router')->getRoutes()->refreshNameLookups();
            }
        }

        if ($this->app->bound(CmsHookManager::class)) {
            /** @var CmsHookManager $hooks */
            $hooks = $this->app->make(CmsHookManager::class);

            $hooks->addFilter('content.render_block', function (?string $custom, array $block): ?string {
                if (($block['type'] ?? '') === 'contact_form') {
                    return $this->renderContactFormHtml($block['data'] ?? []);
                }

                return $custom;
            }, 10);

            $hooks->addFilter('content.after_render', function (string $html): string {
                if (str_contains($html, '[contact-form]')) {
                    $form = $this->renderContactFormHtml();

                    return str_replace('[contact-form]', $form, $html);
                }

                return $html;
            }, 10);
        }
    }

    protected function renderContactFormHtml(array $data = []): string
    {
        $title = htmlspecialchars($data['title'] ?? 'Escríbenos un mensaje', ENT_QUOTES, 'UTF-8');
        $csrfToken = csrf_token();
        $action = url('/contact/send');

        return <<<HTML
<div class="atlas-contact-form-wrapper my-8 p-6 md:p-8 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm max-w-2xl mx-auto">
    <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{$title}</h3>
    <form action="{$action}" method="POST" class="space-y-4">
        <input type="hidden" name="_token" value="{$csrfToken}" />
        <input type="text" name="_hp_check" value="" style="display:none !important;" tabindex="-1" autocomplete="off" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre completo *</label>
                <input type="text" name="name" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Tu nombre" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo electrónico *</label>
                <input type="email" name="email" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="correo@ejemplo.com" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono (opcional)</label>
                <input type="tel" name="phone" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="+123456789" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asunto</label>
                <input type="text" name="subject" class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Motivo de tu consulta" />
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mensaje *</label>
            <textarea name="message" rows="4" required class="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="¿En qué podemos ayudarte?"></textarea>
        </div>

        <button type="submit" class="w-full md:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl transition shadow">
            Enviar Mensaje
        </button>
    </form>
</div>
HTML;
    }
}
