<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('modulos', 'translations')) {
            Schema::table('modulos', function (Blueprint $table) {
                $table->json('translations')->nullable()->after('activo');
            });
        }

        if (! Schema::hasColumn('menu', 'translations')) {
            Schema::table('menu', function (Blueprint $table) {
                $table->json('translations')->nullable()->after('permission_name');
            });
        }

        $moduleMap = [
            'Dashboard' => ['es' => 'Dashboard', 'en' => 'Dashboard'],
            'Posts' => ['es' => 'Entradas', 'en' => 'Posts'],
            'Pages' => ['es' => 'P?ginas', 'en' => 'Pages'],
            'Content' => ['es' => 'Contenido', 'en' => 'Content'],
            'System' => ['es' => 'Sistema', 'en' => 'System'],
            'Admin' => ['es' => 'Administraci?n', 'en' => 'Admin'],
        ];

        foreach (DB::table('modulos')->get() as $module) {
            $translations = $moduleMap[$module->nmodulo] ?? ['es' => $module->nmodulo, 'en' => $module->nmodulo];
            DB::table('modulos')->where('idModulos', $module->idModulos)->update([
                'translations' => json_encode($translations, JSON_UNESCAPED_UNICODE),
            ]);
        }

        $menuMap = [
            'Dashboard' => ['es' => 'Dashboard', 'en' => 'Dashboard'],
            'Posts' => ['es' => 'Entradas', 'en' => 'Posts'],
            'Pages' => ['es' => 'P?ginas', 'en' => 'Pages'],
            'Content' => ['es' => 'Contenido', 'en' => 'Content'],
            'System' => ['es' => 'Sistema', 'en' => 'System'],
            'Admin' => ['es' => 'Administraci?n', 'en' => 'Admin'],
            'List' => ['es' => 'Listado', 'en' => 'List'],
            'New post' => ['es' => 'Nueva entrada', 'en' => 'New post'],
            'New page' => ['es' => 'Nueva p?gina', 'en' => 'New page'],
            'Taxonomias' => ['es' => 'Taxonom?as', 'en' => 'Taxonomies'],
            'Taxonom?as' => ['es' => 'Taxonom?as', 'en' => 'Taxonomies'],
            'Media' => ['es' => 'Media', 'en' => 'Media'],
            'Menus' => ['es' => 'Men?s', 'en' => 'Menus'],
            'Men?s' => ['es' => 'Men?s', 'en' => 'Menus'],
            'Temas' => ['es' => 'Temas', 'en' => 'Themes'],
            'Themes' => ['es' => 'Temas', 'en' => 'Themes'],
            'Plugins' => ['es' => 'Plugins', 'en' => 'Plugins'],
            'Configuracion' => ['es' => 'Configuraci?n', 'en' => 'Settings'],
            'Configuraci?n' => ['es' => 'Configuraci?n', 'en' => 'Settings'],
            'Usuarios' => ['es' => 'Usuarios', 'en' => 'Users'],
            'Roles y Permisos' => ['es' => 'Roles y permisos', 'en' => 'Roles & permissions'],
            'Permisos por Usuario' => ['es' => 'Permisos por usuario', 'en' => 'User permissions'],
            'Modulos y Menus' => ['es' => 'M?dulos y men?s', 'en' => 'Modules & menus'],
            'M?dulos y Men?s' => ['es' => 'M?dulos y men?s', 'en' => 'Modules & menus'],
        ];

        foreach (DB::table('menu')->get() as $menu) {
            $translations = $menuMap[$menu->nombre] ?? ['es' => $menu->nombre, 'en' => $menu->nombre];
            DB::table('menu')->where('id', $menu->id)->update([
                'translations' => json_encode($translations, JSON_UNESCAPED_UNICODE),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('menu', 'translations')) {
            Schema::table('menu', function (Blueprint $table) {
                $table->dropColumn('translations');
            });
        }

        if (Schema::hasColumn('modulos', 'translations')) {
            Schema::table('modulos', function (Blueprint $table) {
                $table->dropColumn('translations');
            });
        }
    }
};
