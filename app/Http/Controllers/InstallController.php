<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Support\Cms\InstallStateStore;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

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

        return Inertia::render('install/welcome', [
            'requirements' => $this->installationRequirements(),
        ]);
    }

    public function requirements(): Response
    {
        return Inertia::render('install/requirements', [
            'requirements' => $this->installationRequirements(),
        ]);
    }

    public function database(): Response
    {
        return Inertia::render('install/database', [
            'database' => [
                'driver' => config('database.default'),
                'database' => config('database.connections.'.config('database.default').'.database'),
            ],
        ]);
    }

    public function admin(): Response
    {
        return Inertia::render('install/admin');
    }

    public function site(): Response
    {
        return Inertia::render('install/site');
    }

    public function finish(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
            'site_name' => ['required', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($data): void {
            $role = Role::findOrCreate('super-admin', 'web');

            $user = \App\Models\User::query()->updateOrCreate(
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
                    ],
                    'is_public' => true,
                ],
            );
        });

        $this->installStateStore->markInstalled();

        return redirect()->route('login')->with('success', 'Atlas CMS installed successfully.');
    }

    protected function installationRequirements(): array
    {
        $defaultConnection = config('database.default');
        $database = config("database.connections.{$defaultConnection}.database");

        return [
            ['label' => 'PHP 8.3+', 'passed' => version_compare(PHP_VERSION, '8.3.0', '>=')],
            ['label' => 'PDO extension', 'passed' => extension_loaded('pdo')],
            ['label' => 'JSON extension', 'passed' => extension_loaded('json')],
            ['label' => 'Writable storage', 'passed' => is_writable(storage_path())],
            ['label' => 'Database configured', 'passed' => ! empty($database)],
        ];
    }
}
