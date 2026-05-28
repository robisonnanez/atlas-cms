<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Modulo;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $moduleDefinitions = [
            ['idModulos' => 3, 'nmodulo' => 'Dashboard', 'orden' => 1, 'icono' => 'pi pi-home', 'color' => '#38bdf8', 'detalle' => 'Dashboard', 'activo' => true],
            ['idModulos' => 4, 'nmodulo' => 'Posts', 'orden' => 2, 'icono' => 'pi pi-book', 'color' => '#818cf8', 'detalle' => 'Editorial posts', 'activo' => true],
            ['idModulos' => 5, 'nmodulo' => 'Pages', 'orden' => 3, 'icono' => 'pi pi-file', 'color' => '#22c55e', 'detalle' => 'Site pages', 'activo' => true],
            ['idModulos' => 6, 'nmodulo' => 'Content', 'orden' => 4, 'icono' => 'pi pi-folder', 'color' => '#f59e0b', 'detalle' => 'Content systems', 'activo' => true],
            ['idModulos' => 7, 'nmodulo' => 'System', 'orden' => 5, 'icono' => 'pi pi-cog', 'color' => '#94a3b8', 'detalle' => 'Themes and settings', 'activo' => true],
            ['idModulos' => 8, 'nmodulo' => 'Admin', 'orden' => 6, 'icono' => 'pi pi-shield', 'color' => '#f97316', 'detalle' => 'Governance', 'activo' => true],
        ];

        $permissions = [
            'dashboard.view',
            'admin.roles_permissions.view',
            'admin.roles_permissions.manage',
            'admin.user_permissions.view',
            'admin.user_permissions.manage',
            'admin.navigation.view',
            'admin.navigation.manage',
            'admin.users.view',
            'admin.users.create',
            'admin.users.edit',
            'admin.users.delete',
            'module.3.access',
            'module.4.access',
            'module.5.access',
            'module.6.access',
            'module.7.access',
            'module.8.access',
            'atlas.pages.view',
            'atlas.pages.create',
            'atlas.pages.edit',
            'atlas.pages.delete',
            'atlas.pages.restore',
            'atlas.posts.view',
            'atlas.posts.create',
            'atlas.posts.edit',
            'atlas.posts.delete',
            'atlas.posts.restore',
            'atlas.taxonomies.view',
            'atlas.taxonomies.create',
            'atlas.taxonomies.edit',
            'atlas.taxonomies.delete',
            'atlas.media.view',
            'atlas.media.create',
            'atlas.media.edit',
            'atlas.media.delete',
            'atlas.menus.view',
            'atlas.menus.create',
            'atlas.menus.edit',
            'atlas.menus.delete',
            'atlas.menus.reorder',
            'atlas.themes.view',
            'atlas.themes.activate',
            'atlas.plugins.view',
            'atlas.plugins.toggle',
            'atlas.settings.view',
            'atlas.settings.edit',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $role = Role::findOrCreate('super-admin', 'web');
        foreach (['admin', 'editor', 'author', 'collaborator', 'subscriber'] as $roleName) {
            Role::findOrCreate($roleName, 'web');
        }

        Menu::query()->whereIn('idModulos', [1, 2, 3, 4, 5, 6, 7, 8])->delete();
        Modulo::query()->whereIn('idModulos', [1, 2, 3, 4, 5, 6, 7, 8])->delete();

        Modulo::query()->upsert($moduleDefinitions, ['idModulos'], ['nmodulo', 'orden', 'icono', 'color', 'detalle', 'activo']);

        Permission::query()->whereIn('name', [
            'apps.calendar.view',
            'apps.chat.view',
            'apps.mail.view',
            'apps.tasklist.view',
            'module.1.access',
            'module.2.access',
        ])->delete();

        $menuRows = [
            ['idModulos' => 3, 'nombre' => 'Dashboard', 'url' => '/dashboard', 'icono' => 'pi pi-home', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'dashboard.view'],
            ['idModulos' => 4, 'nombre' => 'Posts', 'url' => '#', 'icono' => 'pi pi-book', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 5, 'nombre' => 'Pages', 'url' => '#', 'icono' => 'pi pi-file', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 6, 'nombre' => 'Content', 'url' => '#', 'icono' => 'pi pi-folder', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 7, 'nombre' => 'System', 'url' => '#', 'icono' => 'pi pi-cog', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 8, 'nombre' => 'Admin', 'url' => '#', 'icono' => 'pi pi-shield', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => null],
        ];

        foreach ($menuRows as $row) {
            Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
        }

        $postsParent = Menu::query()->where('nombre', 'Posts')->whereNull('id_menu')->first();
        $pagesParent = Menu::query()->where('nombre', 'Pages')->whereNull('id_menu')->first();
        $contentParent = Menu::query()->where('nombre', 'Content')->whereNull('id_menu')->first();
        $systemParent = Menu::query()->where('nombre', 'System')->whereNull('id_menu')->first();
        $adminParent = Menu::query()->where('nombre', 'Admin')->whereNull('id_menu')->first();

        if ($postsParent) {
            foreach ([
                ['idModulos' => 4, 'nombre' => 'List', 'url' => '/admin/posts', 'icono' => 'pi pi-list', 'id_menu' => $postsParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.posts.view'],
                ['idModulos' => 4, 'nombre' => 'New post', 'url' => '/admin/posts/create', 'icono' => 'pi pi-plus-circle', 'id_menu' => $postsParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.posts.create'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($pagesParent) {
            foreach ([
                ['idModulos' => 5, 'nombre' => 'List', 'url' => '/admin/pages', 'icono' => 'pi pi-list', 'id_menu' => $pagesParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.pages.view'],
                ['idModulos' => 5, 'nombre' => 'New page', 'url' => '/admin/pages/create', 'icono' => 'pi pi-plus-circle', 'id_menu' => $pagesParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.pages.create'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($contentParent) {
            foreach ([
                ['idModulos' => 6, 'nombre' => 'Taxonomias', 'url' => '/admin/categories', 'icono' => 'pi pi-tags', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.taxonomies.view'],
                ['idModulos' => 6, 'nombre' => 'Media', 'url' => '/admin/media', 'icono' => 'pi pi-images', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.media.view'],
                ['idModulos' => 6, 'nombre' => 'Menus', 'url' => '/admin/menus', 'icono' => 'pi pi-sitemap', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'atlas.menus.view'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($systemParent) {
            foreach ([
                ['idModulos' => 7, 'nombre' => 'Temas', 'url' => '/admin/themes', 'icono' => 'pi pi-palette', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.themes.view'],
                ['idModulos' => 7, 'nombre' => 'Plugins', 'url' => '/admin/plugins', 'icono' => 'pi pi-box', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.plugins.view'],
                ['idModulos' => 7, 'nombre' => 'Configuracion', 'url' => '/admin/settings', 'icono' => 'pi pi-cog', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'atlas.settings.view'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($adminParent) {
            foreach ([
                ['idModulos' => 8, 'nombre' => 'Usuarios', 'url' => '/admin/users', 'icono' => 'pi pi-users', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'admin.users.view'],
                ['idModulos' => 8, 'nombre' => 'Roles y Permisos', 'url' => '/admin/roles-permissions', 'icono' => 'pi pi-lock', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'admin.roles_permissions.view'],
                ['idModulos' => 8, 'nombre' => 'Permisos por Usuario', 'url' => '/admin/users-permissions', 'icono' => 'pi pi-users', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'admin.user_permissions.view'],
                ['idModulos' => 8, 'nombre' => 'Modulos y Menus', 'url' => '/admin/navigation-management', 'icono' => 'pi pi-sitemap', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 4, 'cesdo' => true, 'permission_name' => 'admin.navigation.view'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        $permissionMap = [
            'admin' => [
                'module.3.access', 'module.4.access', 'module.5.access', 'module.6.access', 'module.7.access', 'module.8.access',
                'dashboard.view',
                'admin.users.view', 'admin.users.create', 'admin.users.edit', 'admin.users.delete',
                'admin.roles_permissions.view', 'admin.roles_permissions.manage',
                'admin.user_permissions.view', 'admin.user_permissions.manage',
                'admin.navigation.view', 'admin.navigation.manage',
                'atlas.pages.view', 'atlas.pages.create', 'atlas.pages.edit', 'atlas.pages.delete', 'atlas.pages.restore',
                'atlas.posts.view', 'atlas.posts.create', 'atlas.posts.edit', 'atlas.posts.delete', 'atlas.posts.restore',
                'atlas.taxonomies.view', 'atlas.taxonomies.create', 'atlas.taxonomies.edit', 'atlas.taxonomies.delete',
                'atlas.media.view', 'atlas.media.create', 'atlas.media.edit', 'atlas.media.delete',
                'atlas.menus.view', 'atlas.menus.create', 'atlas.menus.edit', 'atlas.menus.delete', 'atlas.menus.reorder',
                'atlas.themes.view', 'atlas.themes.activate',
                'atlas.plugins.view', 'atlas.plugins.toggle',
                'atlas.settings.view', 'atlas.settings.edit',
            ],
            'editor' => [
                'module.3.access', 'module.4.access', 'module.5.access', 'module.6.access',
                'dashboard.view',
                'atlas.pages.view', 'atlas.pages.create', 'atlas.pages.edit',
                'atlas.posts.view', 'atlas.posts.create', 'atlas.posts.edit',
                'atlas.taxonomies.view', 'atlas.taxonomies.create', 'atlas.taxonomies.edit',
                'atlas.media.view', 'atlas.media.create', 'atlas.media.edit', 'atlas.media.delete',
            ],
            'author' => [
                'module.3.access', 'module.4.access', 'module.6.access',
                'dashboard.view',
                'atlas.posts.view', 'atlas.posts.create', 'atlas.posts.edit',
                'atlas.media.view', 'atlas.media.create', 'atlas.media.edit',
            ],
            'collaborator' => [
                'module.3.access', 'module.4.access',
                'dashboard.view',
                'atlas.posts.view', 'atlas.posts.create',
            ],
            'subscriber' => [
                'module.3.access',
                'dashboard.view',
            ],
        ];

        foreach ($permissionMap as $roleName => $grants) {
            Role::findByName($roleName, 'web')->syncPermissions($grants);
        }

        Permission::query()->where('name', 'settings.passkeys.manage')->delete();
        Menu::query()->where('permission_name', 'settings.passkeys.manage')->orWhere('nombre', 'Passkeys')->orWhere('nombre', 'Apps')->delete();

        $role->syncPermissions(Permission::all());
    }
}
