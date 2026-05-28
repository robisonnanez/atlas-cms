import { Head, router, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MenuEntry = { id: number; nombre: string; permission_name?: string | null };
type ModuleEntry = { idModulos: number; nmodulo: string; menus: MenuEntry[] };
type RoleEntry = { id: number; name: string; permissions: Array<{ id: number; name: string }> };

const modulePermissionName = (moduleId: number) => `module.${moduleId}.access`;

export default function RolesPermissionsPage() {
    const page = usePage<{ roles: RoleEntry[]; modules: ModuleEntry[] }>();
    const [roleName, setRoleName] = useState('');
    const [roleId, setRoleId] = useState<number>(page.props.roles[0]?.id ?? 0);
    const [roleOverrides, setRoleOverrides] = useState<Record<number, Set<string>>>({});

    const role = useMemo(() => {
        return page.props.roles.find((entry) => entry.id === roleId) ?? null;
    }, [page.props.roles, roleId]);

    const rolePermissionNames = useMemo(() => {
        return new Set(role?.permissions.map((permission) => permission.name) ?? []);
    }, [role]);

    const selectedPermissions = useMemo(() => {
        if (!role) return new Set<string>();
        return roleOverrides[role.id] ?? rolePermissionNames;
    }, [role, roleOverrides, rolePermissionNames]);

    const roleOptions = page.props.roles.map((entry) => ({ label: entry.name, value: entry.id }));

    const persistPermissions = (next: Set<string>) => {
        if (!role) return;

        setRoleOverrides((previous) => ({
            ...previous,
            [role.id]: new Set(next),
        }));

        router.post(`/admin/roles-permissions/${role.id}/permissions`, {
            permissions: Array.from(next),
        }, { preserveScroll: true });
    };

    const togglePermission = (permissionName: string, enabled: boolean) => {
        const next = new Set(selectedPermissions);
        if (enabled) next.add(permissionName);
        else next.delete(permissionName);
        persistPermissions(next);
    };

    const toggleModule = (module: ModuleEntry, enabled: boolean) => {
        const next = new Set(selectedPermissions);
        const modulePermission = modulePermissionName(module.idModulos);

        if (enabled) {
            next.add(modulePermission);
            module.menus
                .map((menu) => menu.permission_name)
                .filter((permission): permission is string => !!permission)
                .forEach((permission) => next.add(permission));
        } else {
            next.delete(modulePermission);
            module.menus
                .map((menu) => menu.permission_name)
                .filter((permission): permission is string => !!permission)
                .forEach((permission) => next.delete(permission));
        }

        persistPermissions(next);
    };

    const totalPermissions = selectedPermissions.size;

    return (
        <>
            <Head title="Roles y Permisos" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas governance</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Roles y permisos</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Controla que modulos y capacidades puede usar cada rol del CMS. Los permisos de modulo activan o desactivan grupos completos y luego puedes afinar menu por menu.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Roles</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.roles.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Permisos activos</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{totalPermissions}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Seleccion de rol</CardTitle>
                            <CardDescription>Crea nuevos roles y elige cual quieres ajustar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">Rol activo</span>
                                <Dropdown value={roleId} options={roleOptions} onChange={(event) => setRoleId(event.value)} className="w-full" placeholder="Selecciona un rol" />
                            </label>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Rol actual</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <Tag value={role?.name ?? 'Sin rol'} severity="info" rounded />
                                    <span className="text-sm text-slate-600">{role?.permissions.length ?? 0} permisos base cargados</span>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Nuevo rol</span>
                                    <InputText value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="Ej. soporte-editorial" className="w-full" />
                                </label>
                                <Button
                                    label="Crear rol"
                                    icon="pi pi-plus"
                                    className="w-full rounded-full"
                                    onClick={() => {
                                        if (!roleName.trim()) return;
                                        router.post('/admin/roles-permissions/roles', { name: roleName.trim() }, { preserveScroll: true });
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {page.props.modules.map((module) => {
                            const modulePermission = modulePermissionName(module.idModulos);
                            const moduleEnabled = selectedPermissions.has(modulePermission);

                            return (
                                <Card key={module.idModulos} className="rounded-3xl border border-slate-200/80 shadow-sm">
                                    <CardHeader>
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div>
                                                <CardTitle>{module.nmodulo}</CardTitle>
                                                <CardDescription>Activa o desactiva el modulo completo y luego ajusta sus menus visibles.</CardDescription>
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
                                                const checked = permissionName ? selectedPermissions.has(permissionName) : false;

                                                return (
                                                    <label key={menu.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{menu.nombre}</p>
                                                            <p className="text-xs text-slate-500">{permissionName || 'Sin permiso asociado'}</p>
                                                        </div>
                                                        <InputSwitch
                                                            checked={checked}
                                                            disabled={!permissionName || !role || !moduleEnabled}
                                                            onChange={(event) => {
                                                                if (!permissionName) return;

                                                                if (!moduleEnabled) {
                                                                    const next = new Set(selectedPermissions);
                                                                    next.add(modulePermission);
                                                                    next.add(permissionName);
                                                                    persistPermissions(next);
                                                                    return;
                                                                }

                                                                togglePermission(permissionName, !!event.value);
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
