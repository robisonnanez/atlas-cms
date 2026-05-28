<?php

use App\Models\Menu;
use App\Models\Modulo;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

it('allows viewing governance screens with view permissions only', function () {
    Permission::findOrCreate('admin.roles_permissions.view', 'web');
    Permission::findOrCreate('admin.user_permissions.view', 'web');
    Permission::findOrCreate('admin.navigation.view', 'web');

    $user = User::factory()->create();
    $user->givePermissionTo([
        'admin.roles_permissions.view',
        'admin.user_permissions.view',
        'admin.navigation.view',
    ]);

    $this->actingAs($user)->get('/admin/roles-permissions')->assertOk();
    $this->actingAs($user)->get('/admin/users-permissions')->assertOk();
    $this->actingAs($user)->get('/admin/navigation-management')->assertOk();
});

it('blocks governance mutations without manage permissions', function () {
    Permission::findOrCreate('admin.roles_permissions.view', 'web');
    Permission::findOrCreate('admin.user_permissions.view', 'web');
    Permission::findOrCreate('admin.navigation.view', 'web');

    Role::findOrCreate('editor', 'web');

    $user = User::factory()->create();
    $target = User::factory()->create();
    $user->givePermissionTo([
        'admin.roles_permissions.view',
        'admin.user_permissions.view',
        'admin.navigation.view',
    ]);

    $module = Modulo::query()->create([
        'idModulos' => 99,
        'nmodulo' => 'QA Module',
        'orden' => 99,
        'icono' => 'pi pi-box',
        'color' => '#000000',
        'detalle' => 'QA',
        'activo' => true,
    ]);

    $menu = Menu::query()->create([
        'idModulos' => $module->idModulos,
        'nombre' => 'QA Menu',
        'url' => '/qa-menu',
        'icono' => 'pi pi-link',
        'main' => false,
        'orden' => 1,
        'cesdo' => true,
        'permission_name' => 'dashboard.view',
    ]);

    $this->actingAs($user)->post('/admin/roles-permissions/roles', ['name' => 'qa-role'])->assertForbidden();
    $this->actingAs($user)->post("/admin/users-permissions/{$target->id}/role", ['role' => 'editor'])->assertForbidden();
    $this->actingAs($user)->post('/admin/navigation/modules', [
        'idModulos' => 120,
        'nmodulo' => 'Blocked',
    ])->assertForbidden();
    $this->actingAs($user)->delete("/admin/navigation/menus/{$menu->id}")->assertForbidden();
});
