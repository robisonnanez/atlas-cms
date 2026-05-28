<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Support\Cms\InstallStateStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Throwable;

class InstallController extends Controller
{
    public function __construct(
        protected InstallStateStore $installStateStore,
    ) {
    }

    public function welcome(): Response|RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        return Inertia::render('install/welcome', $this->sharedPayload('welcome'));
    }

    public function requirements(): Response|RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        return Inertia::render('install/requirements', $this->sharedPayload('requirements'));
    }

    public function database(): Response|RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        return Inertia::render('install/database', $this->sharedPayload('database'));
    }

    public function admin(): Response|RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        return Inertia::render('install/admin', $this->sharedPayload('admin'));
    }

    public function site(): Response|RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        return Inertia::render('install/site', [
            ...$this->sharedPayload('site'),
            'timezones' => ['America/Bogota', 'America/Mexico_City', 'America/Lima', 'America/Santiago', 'Europe/Madrid'],
            'locales' => [
                ['label' => 'Espanol', 'value' => 'es'],
                ['label' => 'English', 'value' => 'en'],
            ],
        ]);
    }

    public function finish(Request $request): RedirectResponse
    {
        if ($this->installStateStore->installed()) {
            return redirect()->route('home');
        }

        $this->ensureInstallationCanContinue();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'site_name' => ['required', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'site_url' => ['nullable', 'url', 'max:255'],
            'timezone' => ['required', 'string', 'max:100'],
            'locale' => ['required', 'string', 'max:10'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'maintenance_mode' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($data): void {
            $role = Role::findOrCreate('super-admin', 'web');

            $user = User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make($data['password']),
                    'password_text' => $data['password'],
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$role->name]);

            Setting::query()->updateOrCreate(
                ['key' => 'site.identity'],
                [
                    'group' => 'general',
                    'value' => [
                        'name' => $data['site_name'],
                        'tagline' => $data['site_tagline'],
                        'url' => $data['site_url'] ?? config('app.url'),
                    ],
                    'is_public' => true,
                ],
            );

            Setting::query()->updateOrCreate(
                ['key' => 'site.system'],
                [
                    'group' => 'general',
                    'value' => [
                        'timezone' => $data['timezone'],
                        'locale' => $data['locale'],
                    ],
                    'is_public' => false,
                ],
            );

            Setting::query()->updateOrCreate(
                ['key' => 'site.seo'],
                [
                    'group' => 'seo',
                    'value' => [
                        'title' => $data['seo_title'] ?? $data['site_name'],
                        'description' => $data['seo_description'] ?? $data['site_tagline'],
                    ],
                    'is_public' => true,
                ],
            );

            Setting::query()->updateOrCreate(
                ['key' => 'site.mail'],
                [
                    'group' => 'mail',
                    'value' => [
                        'from_name' => $data['mail_from_name'] ?? $data['site_name'],
                        'from_address' => $data['mail_from_address'] ?? $data['email'],
                    ],
                    'is_public' => false,
                ],
            );

            Setting::query()->updateOrCreate(
                ['key' => 'site.maintenance'],
                [
                    'group' => 'general',
                    'value' => [
                        'enabled' => (bool) ($data['maintenance_mode'] ?? false),
                    ],
                    'is_public' => false,
                ],
            );
        });

        $this->installStateStore->markInstalled();

        return redirect()->route('login')->with('success', 'Atlas CMS instalado correctamente.');
    }

    protected function sharedPayload(string $currentStep): array
    {
        return [
            'steps' => $this->installationSteps(),
            'currentStep' => $currentStep,
            'requirements' => $this->installationRequirements(),
            'database' => $this->databaseStatus(),
            'system' => $this->systemSummary(),
        ];
    }

    protected function installationSteps(): array
    {
        return [
            ['key' => 'welcome', 'label' => 'Bienvenida'],
            ['key' => 'requirements', 'label' => 'Requisitos'],
            ['key' => 'database', 'label' => 'Base de datos'],
            ['key' => 'admin', 'label' => 'Administrador'],
            ['key' => 'site', 'label' => 'Sitio'],
        ];
    }

    protected function installationRequirements(): array
    {
        $database = $this->databaseStatus();

        return [
            ['label' => 'PHP 8.3+', 'passed' => version_compare(PHP_VERSION, '8.3.0', '>=')],
            ['label' => 'Extension PDO', 'passed' => extension_loaded('pdo')],
            ['label' => 'Extension PDO MySQL', 'passed' => extension_loaded('pdo_mysql')],
            ['label' => 'Extension JSON', 'passed' => extension_loaded('json')],
            ['label' => 'Extension mbstring', 'passed' => extension_loaded('mbstring')],
            ['label' => 'Extension OpenSSL', 'passed' => extension_loaded('openssl')],
            ['label' => 'Extension Fileinfo', 'passed' => extension_loaded('fileinfo')],
            ['label' => 'Storage escribible', 'passed' => is_writable(storage_path())],
            ['label' => 'bootstrap/cache escribible', 'passed' => is_writable(base_path('bootstrap/cache'))],
            ['label' => 'Base de datos configurada', 'passed' => ! empty($database['database'])],
            ['label' => 'Base de datos accesible', 'passed' => $database['connected']],
        ];
    }

    protected function databaseStatus(): array
    {
        $defaultConnection = config('database.default');
        $config = config('database.connections.'.$defaultConnection, []);
        $connected = false;
        $message = 'Atlas utilizara la conexion activa de Laravel.';

        try {
            DB::connection()->getPdo();
            $connected = true;
            $message = 'Conexion a base de datos establecida correctamente.';
        } catch (Throwable $exception) {
            $message = $exception->getMessage();
        }

        return [
            'driver' => $defaultConnection,
            'host' => $config['host'] ?? null,
            'port' => $config['port'] ?? null,
            'database' => $config['database'] ?? null,
            'connected' => $connected,
            'message' => $message,
        ];
    }

    protected function systemSummary(): array
    {
        return [
            'php' => PHP_VERSION,
            'app_name' => config('app.name'),
            'app_env' => config('app.env'),
            'app_url' => config('app.url'),
            'users' => User::query()->count(),
            'installed' => $this->installStateStore->installed(),
        ];
    }

    protected function ensureInstallationCanContinue(): void
    {
        $failedRequirements = collect($this->installationRequirements())
            ->filter(fn (array $requirement) => $requirement['passed'] === false);

        abort_if($failedRequirements->isNotEmpty(), 422, 'Atlas no puede finalizar la instalacion hasta cumplir todos los requisitos del servidor y la base de datos.');
    }
}
