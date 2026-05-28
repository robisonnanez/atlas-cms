<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

test('users with the users view permission can access user management', function () {
    Permission::findOrCreate('admin.users.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('admin.users.view');

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertOk();
});

test('users with the users create permission can create users', function () {
    Permission::findOrCreate('admin.users.create', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('admin.users.create');

    Role::findOrCreate('editor', 'web');

    $this->actingAs($user)
        ->post('/admin/users', [
            'name' => 'Atlas Editor',
            'email' => 'atlas-editor@example.com',
            'password' => 'secret123',
            'role' => 'editor',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['email' => 'atlas-editor@example.com']);
});

test('users without the users delete permission cannot delete users', function () {
    Permission::findOrCreate('admin.users.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('admin.users.view');

    $target = User::factory()->create();

    $this->actingAs($user)
        ->delete("/admin/users/{$target->id}")
        ->assertForbidden();
});
