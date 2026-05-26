<?php

use App\Models\CmsMenu;
use App\Models\MenuItem;
use App\Models\Permission;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('non super admins cannot access menu management', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/admin/menus')
        ->assertForbidden();
});

test('super admins can access menu management', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get('/admin/menus')
        ->assertOk();
});

test('users with the menus permission can access menu management', function () {
    Permission::findOrCreate('atlas.menus.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo('atlas.menus.view');

    $this->actingAs($user)
        ->get('/admin/menus')
        ->assertOk();
});

test('menu items can be reordered', function () {
    $role = Role::findOrCreate('super-admin', 'web');
    $user = User::factory()->create();
    $user->assignRole($role);

    $menu = CmsMenu::query()->create([
        'name' => 'Primary',
        'location' => 'primary',
    ]);

    $first = MenuItem::query()->create([
        'menu_id' => $menu->id,
        'type' => 'custom',
        'label' => 'First',
        'url' => '/first',
        'sort_order' => 1,
    ]);

    $second = MenuItem::query()->create([
        'menu_id' => $menu->id,
        'type' => 'custom',
        'label' => 'Second',
        'url' => '/second',
        'sort_order' => 2,
    ]);

    $this->actingAs($user)
        ->put("/admin/menus/{$menu->id}/items/reorder", [
            'ordered_ids' => [$second->id, $first->id],
        ])
        ->assertRedirect();

    expect($second->fresh()->sort_order)->toBe(1)
        ->and($first->fresh()->sort_order)->toBe(2);
});
