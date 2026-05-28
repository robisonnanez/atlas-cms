<?php

use App\Models\Media;
use App\Models\Permission;
use App\Models\Plugin;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

test('users with the media view permission can access media library', function () {
    Permission::findOrCreate('atlas.media.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.view');

    $this->actingAs($user)
        ->get('/admin/media')
        ->assertOk();
});

test('users without the media create permission cannot upload files', function () {
    Permission::findOrCreate('atlas.media.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.view');

    $this->actingAs($user)
        ->post('/admin/media', [])
        ->assertForbidden();
});

test('users without the media delete permission cannot delete files', function () {
    Storage::fake('public');
    Permission::findOrCreate('atlas.media.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.view');

    $media = Media::query()->create([
        'disk' => 'public',
        'path' => 'media/example.jpg',
        'filename' => 'example.jpg',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'size' => 1200,
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete("/admin/media/{$media->id}")
        ->assertForbidden();
});

test('users with the media delete permission can delete files', function () {
    Storage::fake('public');
    Permission::findOrCreate('atlas.media.delete', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.delete');

    Storage::disk('public')->put('media/example.jpg', 'demo');

    $media = Media::query()->create([
        'disk' => 'public',
        'path' => 'media/example.jpg',
        'filename' => 'example.jpg',
        'mime_type' => 'image/jpeg',
        'extension' => 'jpg',
        'size' => 1200,
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete("/admin/media/{$media->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('media', ['id' => $media->id]);
    Storage::disk('public')->assertMissing('media/example.jpg');
});

test('users with the themes view permission can access themes', function () {
    Permission::findOrCreate('atlas.themes.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.themes.view');

    $this->actingAs($user)
        ->get('/admin/themes')
        ->assertOk();
});

test('users without the themes activate permission cannot activate themes', function () {
    Permission::findOrCreate('atlas.themes.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.themes.view');
    $theme = Theme::query()->create([
        'name' => 'Atlas Test Theme',
        'slug' => 'atlas-test-theme',
        'version' => '1.0.0',
        'is_active' => false,
    ]);

    $this->actingAs($user)
        ->post("/admin/themes/{$theme->id}/activate")
        ->assertForbidden();
});

test('users with the plugins view permission can access plugins', function () {
    Permission::findOrCreate('atlas.plugins.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.plugins.view');

    $this->actingAs($user)
        ->get('/admin/plugins')
        ->assertOk();
});

test('users without the plugins toggle permission cannot toggle plugins', function () {
    Permission::findOrCreate('atlas.plugins.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.plugins.view');
    $plugin = Plugin::query()->create([
        'name' => 'Atlas Test Plugin',
        'slug' => 'atlas-test-plugin',
        'version' => '1.0.0',
        'is_active' => false,
    ]);

    $this->actingAs($user)
        ->post("/admin/plugins/{$plugin->id}/toggle")
        ->assertForbidden();
});

test('users with the settings view permission can access settings', function () {
    Permission::findOrCreate('atlas.settings.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.settings.view');

    $this->actingAs($user)
        ->get('/admin/settings')
        ->assertOk();
});

test('users without the settings edit permission cannot update settings', function () {
    Permission::findOrCreate('atlas.settings.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.settings.view');

    $this->actingAs($user)
        ->put('/admin/settings', [
            'site_name' => 'Blocked',
        ])
        ->assertForbidden();
});
