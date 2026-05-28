<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Filesystem\Filesystem;

beforeEach(function (): void {
    config(['atlas.installation_lock' => storage_path('framework/testing/atlas-install.lock')]);

    $files = app(Filesystem::class);
    $files->ensureDirectoryExists(dirname(config('atlas.installation_lock')));
    $files->delete(config('atlas.installation_lock'));
});

afterEach(function (): void {
    app(Filesystem::class)->delete(config('atlas.installation_lock'));
});

test('install welcome is accessible when atlas is not installed', function () {
    $this->get('/install')
        ->assertOk();
});

test('install redirects to the public home when atlas is already installed', function () {
    app(Filesystem::class)->put(config('atlas.installation_lock'), now()->toIso8601String());

    $this->get('/install')
        ->assertRedirect('/');
});

test('install finish creates the administrator, base settings and the installation lock', function () {
    $response = $this->post('/install/finish', [
        'name' => 'Atlas Owner',
        'email' => 'owner@atlascms.test',
        'password' => 'atlaspass123',
        'site_name' => 'Atlas CMS',
        'site_tagline' => 'Contenido modular',
        'site_url' => 'http://atlascms.test',
        'timezone' => 'America/Bogota',
        'locale' => 'es',
        'seo_title' => 'Atlas CMS',
        'seo_description' => 'Plataforma editorial modular',
        'mail_from_name' => 'Atlas CMS',
        'mail_from_address' => 'noreply@atlascms.test',
        'maintenance_mode' => true,
    ]);

    $response->assertRedirect('/login');

    $this->assertDatabaseHas('users', [
        'email' => 'owner@atlascms.test',
        'name' => 'Atlas Owner',
    ]);

    $this->assertDatabaseHas('settings', ['key' => 'site.identity']);
    $this->assertDatabaseHas('settings', ['key' => 'site.system']);
    $this->assertDatabaseHas('settings', ['key' => 'site.seo']);
    $this->assertDatabaseHas('settings', ['key' => 'site.mail']);
    $this->assertDatabaseHas('settings', ['key' => 'site.maintenance']);

    expect(app(Filesystem::class)->exists(config('atlas.installation_lock')))->toBeTrue();
    expect(User::query()->where('email', 'owner@atlascms.test')->first()?->hasRole('super-admin'))->toBeTrue();
    expect(Setting::query()->where('key', 'site.maintenance')->first()?->value['enabled'] ?? null)->toBeTrue();
});
