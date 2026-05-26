<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use App\Services\PermissionSyncService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $navigation = [];

        if ($user) {
            $rows = Menu::query()
                ->where('cesdo', true)
                ->whereHas('modulo', fn ($query) => $query->where('activo', true))
                ->orderBy('idModulos')
                ->orderByRaw('COALESCE(orden, 9999) asc')
                ->get();

            $directPermissions = $user->getDirectPermissions()->pluck('name')->flip();

            $moduleDirectOverrides = $rows
                ->groupBy('idModulos')
                ->map(function ($menus, $moduleId) use ($directPermissions) {
                    $modulePermission = PermissionSyncService::modulePermissionName((int) $moduleId);

                    if ($directPermissions->has($modulePermission)) {
                        return true;
                    }

                    return $menus
                        ->pluck('permission_name')
                        ->filter()
                        ->contains(fn ($permission) => $directPermissions->has($permission));
                });

            $allowed = $rows->filter(function (Menu $item) use ($user, $directPermissions, $moduleDirectOverrides) {
                $moduleId = (int) $item->idModulos;
                $modulePermission = PermissionSyncService::modulePermissionName($moduleId);
                $hasDirectOverride = (bool) $moduleDirectOverrides->get($moduleId, false);

                if ($hasDirectOverride) {
                    if (! $directPermissions->has($modulePermission)) {
                        return false;
                    }

                    if (! $item->permission_name) {
                        return true;
                    }

                    return $directPermissions->has($item->permission_name);
                }

                if (! $user->can($modulePermission)) {
                    return false;
                }

                if (! $item->permission_name) {
                    return true;
                }

                return $user->can($item->permission_name);
            });

            $tree = $allowed
                ->whereNull('id_menu')
                ->map(function (Menu $item) use ($allowed) {
                    $children = $allowed
                        ->where('id_menu', $item->id)
                        ->sortBy(fn (Menu $menu) => $menu->orden ?? 9999)
                        ->values()
                        ->map(fn (Menu $menu) => [
                            'id' => $menu->id,
                            'label' => $menu->nombre,
                            'href' => $menu->url,
                            'icon' => $menu->icono,
                        ])
                        ->all();

                    return [
                        'id' => $item->id,
                        'label' => $item->nombre,
                        'href' => $item->url,
                        'icon' => $item->icono,
                        'children' => $children,
                    ];
                })->filter(function (array $item) {
                    $href = (string) ($item['href'] ?? '');
                    $hasChildren = ! empty($item['children']);

                    return $hasChildren || ($href !== '' && $href !== '#');
                })
                ->values()
                ->all();

            $navigation = collect($tree)->values()->all();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
                'permissions' => $user?->getAllPermissions()->pluck('name')->values()->all() ?? [],
                'is_super_admin' => $user?->hasRole('super-admin') ?? false,
            ],
            'navigation' => $navigation,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
