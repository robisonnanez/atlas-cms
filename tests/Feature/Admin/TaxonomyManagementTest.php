<?php

use App\Models\Category;
use App\Models\Permission;
use App\Models\Tag;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('super admins can create categories and tags', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)->post('/admin/categories', [
        'name' => 'Docs',
        'slug' => 'docs',
        'description' => 'Documentation',
        'parent_id' => null,
    ])->assertRedirect();

    $this->actingAs($user)->post('/admin/tags', [
        'name' => 'Guide',
        'slug' => 'guide',
        'description' => 'Guides',
    ])->assertRedirect();

    $this->assertDatabaseHas('categories', ['slug' => 'docs']);
    $this->assertDatabaseHas('tags', ['slug' => 'guide']);
});

test('non super admins cannot manage taxonomies', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/admin/categories', [
        'name' => 'Forbidden',
        'slug' => 'forbidden',
    ])->assertForbidden();
});

test('users with the taxonomies create permission can manage categories', function () {
    Permission::findOrCreate('atlas.taxonomies.create', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.taxonomies.create');

    $this->actingAs($user)->post('/admin/categories', [
        'name' => 'Release notes',
        'slug' => 'release-notes',
    ])->assertRedirect();

    $this->assertDatabaseHas('categories', ['slug' => 'release-notes']);
});
