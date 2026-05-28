import { Head, router, usePage } from '@inertiajs/react';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UserEntry = {
    id: number;
    name: string;
    email: string;
    roles: Array<{ id: number; name: string }>;
    permissions: Array<{ id: number; name: string }>;
    role_permissions: string[];
};
type RoleEntry = { id: number; name: string };
type MenuEntry = { id: number; nombre: string; permission_name?: string | null };
type ModuleEntry = { idModulos: number; nmodulo: string; menus: MenuEntry[] };

const modulePermissionName = (moduleId: number) => `module.${moduleId}.access`;

export default function UsersPermissionsPage() {
    const page = usePage<{ users: UserEntry[]; roles: RoleEntry[]; modules: ModuleEntry[] }>();
    const [userId, setUserId] = useState<number>(page.props.users[0]?.id ?? 0);
    const [overrides, setOverrides] = useState<Record<number, Set<string>>>({});

    const user = useMemo(() => {
        return page.props.users.find((entry) => entry.id === userId) ?? null;
    }, [page.props.users, userId]);

    const selectedDirect = useMemo(() => {
        if (!user) return new Set<string>();
        return overrides[user.id] ?? new Set(user.permissions.map((permission) => permission.name));
    }, [user, overrides]);

    const rolePermissionNames = new Set(user?.role_permissions ?? []);
    const userOptions = page.props.users.map((entry) => ({ label: `${entry.name} (${entry.email})`, value: entry.id }));
    const roleOptions = [{ label: 'Sin rol', value: '' }, ...page.props.roles.map((entry) => ({ label: entry.name, value: entry.name }))];

    const persistDirectPermissions = (next: Set<string>) => {
        if (!user) return;

        setOverrides((previous) => ({
            ...previous,
            [user.id]: new Set(next),
        }));

        router.post(`/admin/users-permissions/${user.id}/permissions`, {
            permissions: Array.from(next),
        }, { preserveScroll: true });
    };

    const toggleModule = (module: ModuleEntry, enabled: boolean) => {
        const next = new Set(selectedDirect);
        const modulePermission = modulePermissionName(module.idModulos);

        if (enabled) {
            next.add(modulePermission);
        } else {
            next.delete(modulePermission);
            module.menus
                .map((menu) => menu.permission_name)
                .filter((permission): permission is string => !!permission)
                .forEach((permission) => next.delete(permission));
        }

        persistDirectPermissions(next);
    };

    if (!user) return null;

    return (
        <>
            <Head title="Permisos por Usuario" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas governance</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Permisos por usuario</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Combina el rol principal del usuario con permisos directos para habilitar excepciones controladas sin romper el modelo general del CMS.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Usuarios</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.users.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Permisos directos</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedDirect.size}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Usuario activo</CardTitle>
                            <CardDescription>Selecciona una cuenta y ajusta su rol base o sus permisos directos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Usuario</span>
                                <Dropdown value={user.id} options={userOptions} onChange={(event) => setUserId(event.value)} className="w-full" />
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Rol principal</span>
                                <Dropdown value={user.roles[0]?.name ?? ''} options={roleOptions} onChange={(event) => router.post(`/admin/users-permissions/${user.id}/role`, { role: event.value || null }, { preserveScroll: true })} className="w-full" />
                            </label>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Tag value={user.roles[0]?.name ?? 'Sin rol'} severity="info" rounded />
                                    <Tag value={`${rolePermissionNames.size} heredados`} severity="secondary" rounded />
                                    <Tag value={`${selectedDirect.size} directos`} severity="success" rounded />
                                </div>
                                <p className="text-sm text-slate-600">Los permisos marcados como heredados vienen del rol. Los directos se asignan solo a este usuario.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {page.props.modules.map((module) => {
                            const modulePermission = modulePermissionName(module.idModulos);
                            const moduleEnabled = selectedDirect.has(modulePermission) || rolePermissionNames.has(modulePermission);

                            return (
                                <Card key={module.idModulos} className="rounded-3xl border border-slate-200/80 shadow-sm">
                                    <CardHeader>
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <CardTitle>{module.nmodulo}</CardTitle>
                                                <CardDescription>Activa el modulo para este usuario y luego afina las excepciones por menu.</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <span className="text-sm font-medium text-slate-700">Modulo activo</span>
                                                <InputSwitch checked={moduleEnabled} onChange={(event) => toggleModule(module, !!event.value)} />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {module.menus.map((menu) => {
                                                const permissionName = menu.permission_name ?? '';
                                                const isDirect = permissionName ? selectedDirect.has(permissionName) : false;
                                                const isInherited = permissionName ? rolePermissionNames.has(permissionName) && !isDirect : false;

                                                return (
                                                    <label key={menu.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{menu.nombre}</p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                {isInherited ? <Tag value="Heredado" severity="secondary" rounded /> : null}
                                                                {isDirect ? <Tag value="Directo" severity="success" rounded /> : null}
                                                            </div>
                                                        </div>
                                                        <InputSwitch
                                                            checked={isDirect}
                                                            disabled={!permissionName || !moduleEnabled}
                                                            onChange={(event) => {
                                                                if (!permissionName) return;

                                                                const next = new Set(selectedDirect);
                                                                if (!!event.value) {
                                                                    next.add(permissionName);
                                                                    next.add(modulePermission);
                                                                } else {
                                                                    next.delete(permissionName);
                                                                }
                                                                persistDirectPermissions(next);
                                                            }}
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
