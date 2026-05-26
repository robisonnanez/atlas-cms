<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Modulo;
use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view',
            'admin.roles_permissions.manage',
            'admin.user_permissions.manage',
            'admin.navigation.manage',
            'module.3.access',
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
            'atlas.menus.view',
            'atlas.menus.create',
            'atlas.menus.edit',
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

        Menu::query()->whereIn('idModulos', [1, 2])->delete();
        Modulo::query()->whereIn('idModulos', [1, 2])->delete();

        Modulo::query()->upsert([
            ['idModulos' => 3, 'nmodulo' => 'Admin', 'orden' => 1, 'icono' => 'pi pi-shield', 'color' => '#f59e0b', 'detalle' => 'Administracion', 'activo' => true],
        ], ['idModulos'], ['nmodulo', 'orden', 'icono', 'color', 'detalle', 'activo']);

        Permission::query()->whereIn('name', [
            'apps.calendar.view',
            'apps.chat.view',
            'apps.mail.view',
            'apps.tasklist.view',
            'module.1.access',
            'module.2.access',
        ])->delete();

        $role->syncPermissions(Permission::all());

        Menu::query()->whereIn('nombre', [
            'Dashboard',
            'Posts',
            'List',
            'New post',
            'Pages',
            'New page',
            'Content',
            'Taxonomias',
            'Media',
            'Menus',
            'System',
            'Temas',
            'Plugins',
            'Configuracion',
            'Revisiones',
            'Roles y Permisos',
            'Permisos por Usuario',
            'Modulos y Menus',
        ])->delete();

        $menuRows = [
            ['idModulos' => 3, 'nombre' => 'Dashboard', 'url' => '/dashboard', 'icono' => 'pi pi-home', 'id_menu' => null, 'main' => true, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'dashboard.view'],
            ['idModulos' => 3, 'nombre' => 'Posts', 'url' => '#', 'icono' => 'pi pi-book', 'id_menu' => null, 'main' => true, 'orden' => 2, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 3, 'nombre' => 'Pages', 'url' => '#', 'icono' => 'pi pi-file', 'id_menu' => null, 'main' => true, 'orden' => 3, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 3, 'nombre' => 'Content', 'url' => '#', 'icono' => 'pi pi-folder', 'id_menu' => null, 'main' => true, 'orden' => 4, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 3, 'nombre' => 'System', 'url' => '#', 'icono' => 'pi pi-cog', 'id_menu' => null, 'main' => true, 'orden' => 5, 'cesdo' => true, 'permission_name' => null],
            ['idModulos' => 3, 'nombre' => 'Admin', 'url' => '#', 'icono' => 'pi pi-shield', 'id_menu' => null, 'main' => true, 'orden' => 6, 'cesdo' => true, 'permission_name' => null],
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
                ['idModulos' => 3, 'nombre' => 'List', 'url' => '/admin/posts', 'icono' => 'pi pi-list', 'id_menu' => $postsParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.posts.view'],
                ['idModulos' => 3, 'nombre' => 'New post', 'url' => '/admin/posts/create', 'icono' => 'pi pi-plus-circle', 'id_menu' => $postsParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.posts.create'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($pagesParent) {
            foreach ([
                ['idModulos' => 3, 'nombre' => 'List', 'url' => '/admin/pages', 'icono' => 'pi pi-list', 'id_menu' => $pagesParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.pages.view'],
                ['idModulos' => 3, 'nombre' => 'New page', 'url' => '/admin/pages/create', 'icono' => 'pi pi-plus-circle', 'id_menu' => $pagesParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.pages.create'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($contentParent) {
            foreach ([
                ['idModulos' => 3, 'nombre' => 'Taxonomias', 'url' => '/admin/categories', 'icono' => 'pi pi-tags', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.taxonomies.view'],
                ['idModulos' => 3, 'nombre' => 'Media', 'url' => '/admin/media', 'icono' => 'pi pi-images', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.media.view'],
                ['idModulos' => 3, 'nombre' => 'Menus', 'url' => '/admin/menus', 'icono' => 'pi pi-sitemap', 'id_menu' => $contentParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'atlas.menus.view'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($systemParent) {
            foreach ([
                ['idModulos' => 3, 'nombre' => 'Temas', 'url' => '/admin/themes', 'icono' => 'pi pi-palette', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'atlas.themes.view'],
                ['idModulos' => 3, 'nombre' => 'Plugins', 'url' => '/admin/plugins', 'icono' => 'pi pi-box', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'atlas.plugins.view'],
                ['idModulos' => 3, 'nombre' => 'Configuracion', 'url' => '/admin/settings', 'icono' => 'pi pi-cog', 'id_menu' => $systemParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'atlas.settings.view'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        if ($adminParent) {
            foreach ([
                ['idModulos' => 3, 'nombre' => 'Roles y Permisos', 'url' => '/admin/roles-permissions', 'icono' => 'pi pi-lock', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 1, 'cesdo' => true, 'permission_name' => 'admin.roles_permissions.manage'],
                ['idModulos' => 3, 'nombre' => 'Permisos por Usuario', 'url' => '/admin/users-permissions', 'icono' => 'pi pi-users', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 2, 'cesdo' => true, 'permission_name' => 'admin.user_permissions.manage'],
                ['idModulos' => 3, 'nombre' => 'Modulos y Menus', 'url' => '/admin/navigation-management', 'icono' => 'pi pi-sitemap', 'id_menu' => $adminParent->id, 'main' => false, 'orden' => 3, 'cesdo' => true, 'permission_name' => 'admin.navigation.manage'],
            ] as $row) {
                Menu::query()->updateOrCreate(['nombre' => $row['nombre'], 'id_menu' => $row['id_menu']], $row);
            }
        }

        $permissionMap = [
            'admin' => [
                'module.3.access',
                'dashboard.view',
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
                'atlas.menus.view',
                'atlas.menus.create',
                'atlas.menus.edit',
                'atlas.menus.reorder',
                'atlas.themes.view',
                'atlas.themes.activate',
                'atlas.plugins.view',
                'atlas.plugins.toggle',
                'atlas.settings.view',
                'atlas.settings.edit',
            ],
            'editor' => [
                'module.3.access',
                'dashboard.view',
                'atlas.pages.view',
                'atlas.pages.create',
                'atlas.pages.edit',
                'atlas.posts.view',
                'atlas.posts.create',
                'atlas.posts.edit',
                'atlas.taxonomies.view',
                'atlas.taxonomies.create',
                'atlas.taxonomies.edit',
                'atlas.media.view',
                'atlas.media.create',
                'atlas.media.edit',
            ],
            'author' => [
                'module.3.access',
                'dashboard.view',
                'atlas.posts.view',
                'atlas.posts.create',
                'atlas.posts.edit',
                'atlas.media.view',
                'atlas.media.create',
                'atlas.media.edit',
            ],
            'collaborator' => [
                'module.3.access',
                'dashboard.view',
                'atlas.posts.view',
                'atlas.posts.create',
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
        Menu::query()
            ->where('permission_name', 'settings.passkeys.manage')
            ->orWhere('nombre', 'Passkeys')
            ->orWhere('nombre', 'Apps')
            ->delete();

        $role->syncPermissions(Permission::all());
    }
}
