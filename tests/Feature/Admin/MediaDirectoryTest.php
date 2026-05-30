<?php

use App\Models\MediaDirectory;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('allows users with media permissions to create directories', function () {
    Permission::findOrCreate('atlas.media.create', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.create');

    $this->actingAs($user)
        ->post('/admin/media/directories', [
            'name' => 'Carousel',
            'description' => 'Slides del home',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('media_directories', ['slug' => 'carousel']);
});

it('stores uploads inside the selected media directory', function () {
    Storage::fake('public');
    Permission::findOrCreate('atlas.media.create', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.media.create');

    $directory = MediaDirectory::query()->create([
        'name' => 'Carousel',
        'slug' => 'carousel',
        'description' => 'Slides del home',
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->post('/admin/media', [
            'file' => UploadedFile::fake()->create('banner.jpg', 120, 'image/jpeg'),
            'title' => 'Banner principal',
            'directory_id' => $directory->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('media', [
        'title' => 'Banner principal',
        'directory_id' => $directory->id,
    ]);

    expect(Storage::disk('public')->allFiles('atlas-media/carousel'))->toHaveCount(1);
});
