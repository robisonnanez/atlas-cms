import { Head, router, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useMemo, useRef, useState } from 'react';

type ModuleRow = {
    idModulos: number;
    nmodulo: string;
    orden?: number | null;
    icono?: string | null;
    color?: string | null;
    detalle?: string | null;
    activo: boolean;
};

type MenuRow = {
    id: number;
    idModulos: number;
    nombre: string;
    url: string;
    icono?: string | null;
    id_menu?: number | null;
    main: boolean;
    orden?: number | null;
    cesdo: boolean;
    permission_name?: string | null;
};

type ParentMenu = { id: number; nombre: string };

const emptyModule: ModuleRow = {
    idModulos: 0,
    nmodulo: '',
    orden: null,
    icono: '',
    color: '',
    detalle: '',
    activo: true,
};

const emptyMenu: Omit<MenuRow, 'id'> = {
    idModulos: 0,
    nombre: '',
    url: '',
    icono: '',
    id_menu: null,
    main: false,
    orden: null,
    cesdo: true,
    permission_name: '',
};

export default function NavigationManagementPage() {
    const toast = useRef<Toast>(null);
    const page = usePage<{ modules: ModuleRow[]; menus: MenuRow[]; parentMenus: ParentMenu[] }>();
    const [moduleDialog, setModuleDialog] = useState(false);
    const [menuDialog, setMenuDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleRow>(emptyModule);
    const [editingMenu, setEditingMenu] = useState<Omit<MenuRow, 'id'> & { id?: number }>(emptyMenu);

    const moduleMap = useMemo(() => new Map(page.props.modules.map((mod) => [mod.idModulos, mod.nmodulo])), [page.props.modules]);
    const moduleOptions = page.props.modules.map((module) => ({ label: module.nmodulo, value: module.idModulos }));
    const parentOptions = [{ label: 'Sin padre', value: null }, ...page.props.parentMenus.filter((menu) => menu.id !== editingMenu.id).map((menu) => ({ label: menu.nombre, value: menu.id }))];

    const showToast = (severity: 'success' | 'warn', detail: string) => {
        toast.current?.show({ severity, summary: severity === 'success' ? 'OK' : 'Validacion', detail, life: 2500 });
    };

    const submitModule = () => {
        if (editingModule.idModulos === 0 || !editingModule.nmodulo.trim()) {
            showToast('warn', 'Completa ID y nombre del modulo');
            return;
        }

        const payload = { ...editingModule, nmodulo: editingModule.nmodulo.trim() };

        if (page.props.modules.some((module) => module.idModulos === editingModule.idModulos)) {
            router.put(`/admin/navigation/modules/${editingModule.idModulos}`, payload, { preserveScroll: true, onSuccess: () => showToast('success', 'Modulo actualizado') });
        } else {
            router.post('/admin/navigation/modules', payload, { preserveScroll: true, onSuccess: () => showToast('success', 'Modulo creado') });
        }

        setModuleDialog(false);
        setEditingModule(emptyModule);
    };

    const submitMenu = () => {
        if (!editingMenu.idModulos || !editingMenu.nombre.trim() || !editingMenu.url.trim()) {
            showToast('warn', 'Completa modulo, nombre y URL');
            return;
        }

        const payload = {
            ...editingMenu,
            nombre: editingMenu.nombre.trim(),
            url: editingMenu.url.trim(),
        };

        if (editingMenu.id) {
            router.put(`/admin/navigation/menus/${editingMenu.id}`, payload, { preserveScroll: true, onSuccess: () => showToast('success', 'Menu actualizado') });
        } else {
            router.post('/admin/navigation/menus', payload, { preserveScroll: true, onSuccess: () => showToast('success', 'Menu creado') });
        }

        setMenuDialog(false);
        setEditingMenu(emptyMenu);
    };

    return (
        <>
            <Head title="Gestion de Navegacion" />
            <Toast ref={toast} position="top-right" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas governance</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Modulos y menus</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Administra la estructura de navegacion interna del panel, los modulos visibles y los permisos asociados a cada entrada administrativa.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Modulos</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.modules.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">Menus</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.menus.length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">Modulos del panel</h2>
                            <p className="text-sm text-slate-600">Define grupos de navegacion como Dashboard, Content, System o Admin.</p>
                        </div>
                        <Button label="Nuevo modulo" icon="pi pi-plus" className="rounded-full" onClick={() => { setEditingModule(emptyModule); setModuleDialog(true); }} />
                    </div>
                    <DataTable value={page.props.modules} dataKey="idModulos" stripedRows className="rounded-2xl border border-slate-200" emptyMessage="No hay modulos registrados.">
                        <Column field="idModulos" header="ID" sortable />
                        <Column field="nmodulo" header="Modulo" sortable />
                        <Column field="orden" header="Orden" sortable />
                        <Column field="detalle" header="Detalle" />
                        <Column header="Activo" body={(row: ModuleRow) => <Tag value={row.activo ? 'Activo' : 'Oculto'} severity={row.activo ? 'success' : 'secondary'} rounded />} />
                        <Column
                            header="Acciones"
                            body={(row: ModuleRow) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" text onClick={() => { setEditingModule(row); setModuleDialog(true); }} />
                                    <Button icon="pi pi-trash" text severity="danger" onClick={() => router.delete(`/admin/navigation/modules/${row.idModulos}`, { preserveScroll: true, onSuccess: () => showToast('success', 'Modulo eliminado') })} />
                                </div>
                            )}
                        />
                    </DataTable>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">Menus administrativos</h2>
                            <p className="text-sm text-slate-600">Cada menu puede pertenecer a un modulo, colgar de un padre y asociarse a un permiso concreto.</p>
                        </div>
                        <Button label="Nuevo menu" icon="pi pi-plus" className="rounded-full" onClick={() => { setEditingMenu(emptyMenu); setMenuDialog(true); }} />
                    </div>
                    <DataTable value={page.props.menus} dataKey="id" stripedRows className="rounded-2xl border border-slate-200" emptyMessage="No hay menus administrativos registrados.">
                        <Column field="id" header="ID" sortable />
                        <Column header="Modulo" body={(row: MenuRow) => moduleMap.get(row.idModulos) ?? row.idModulos} sortable />
                        <Column field="nombre" header="Nombre" sortable />
                        <Column field="url" header="URL" />
                        <Column header="Padre" body={(row: MenuRow) => row.id_menu ? page.props.parentMenus.find((menu) => menu.id === row.id_menu)?.nombre ?? `#${row.id_menu}` : 'Raiz'} />
                        <Column header="Permiso" body={(row: MenuRow) => row.permission_name ? <Tag value={row.permission_name} severity="info" rounded /> : <Tag value="Sin permiso" severity="secondary" rounded />} />
                        <Column
                            header="Acciones"
                            body={(row: MenuRow) => (
                                <div className="flex gap-2">
                                    <Button icon="pi pi-pencil" text onClick={() => { setEditingMenu(row); setMenuDialog(true); }} />
                                    <Button icon="pi pi-trash" text severity="danger" onClick={() => router.delete(`/admin/navigation/menus/${row.id}`, { preserveScroll: true, onSuccess: () => showToast('success', 'Menu eliminado') })} />
                                </div>
                            )}
                        />
                    </DataTable>
                </section>
            </div>

            <Dialog header={editingModule.idModulos ? 'Editar modulo' : 'Nuevo modulo'} visible={moduleDialog} onHide={() => setModuleDialog(false)} className="w-full max-w-2xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">ID</span>
                        <InputText value={`${editingModule.idModulos || ''}`} onChange={(event) => setEditingModule((prev) => ({ ...prev, idModulos: Number(event.target.value) || 0 }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Nombre</span>
                        <InputText value={editingModule.nmodulo} onChange={(event) => setEditingModule((prev) => ({ ...prev, nmodulo: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Orden</span>
                        <InputText value={`${editingModule.orden ?? ''}`} onChange={(event) => setEditingModule((prev) => ({ ...prev, orden: Number(event.target.value) || null }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Icono</span>
                        <InputText value={editingModule.icono ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, icono: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Color</span>
                        <InputText value={editingModule.color ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, color: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Detalle</span>
                        <InputText value={editingModule.detalle ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, detalle: event.target.value }))} />
                    </label>
                    <div className="col-span-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">Modulo activo</span>
                        <InputSwitch checked={!!editingModule.activo} onChange={(event) => setEditingModule((prev) => ({ ...prev, activo: !!event.value }))} />
                    </div>
                </div>
                <div className="mt-5 flex justify-end">
                    <Button label="Guardar modulo" className="rounded-full" onClick={submitModule} />
                </div>
            </Dialog>

            <Dialog header={editingMenu.id ? 'Editar menu' : 'Nuevo menu'} visible={menuDialog} onHide={() => setMenuDialog(false)} className="w-full max-w-3xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Modulo</span>
                        <Dropdown value={editingMenu.idModulos} options={moduleOptions} onChange={(event) => setEditingMenu((prev) => ({ ...prev, idModulos: event.value }))} className="w-full" placeholder="Selecciona modulo" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Nombre</span>
                        <InputText value={editingMenu.nombre} onChange={(event) => setEditingMenu((prev) => ({ ...prev, nombre: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">URL</span>
                        <InputText value={editingMenu.url} onChange={(event) => setEditingMenu((prev) => ({ ...prev, url: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Icono</span>
                        <InputText value={editingMenu.icono ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, icono: event.target.value }))} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Menu padre</span>
                        <Dropdown value={editingMenu.id_menu ?? null} options={parentOptions} onChange={(event) => setEditingMenu((prev) => ({ ...prev, id_menu: event.value }))} className="w-full" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Orden</span>
                        <InputText value={`${editingMenu.orden ?? ''}`} onChange={(event) => setEditingMenu((prev) => ({ ...prev, orden: Number(event.target.value) || null }))} />
                    </label>
                    <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-medium text-slate-700">Permiso asociado</span>
                        <InputText value={editingMenu.permission_name ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, permission_name: event.target.value }))} placeholder="ej. atlas.settings.view" />
                    </label>
                    <div className="col-span-full grid gap-3 md:grid-cols-2">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">Menu principal</span>
                            <InputSwitch checked={!!editingMenu.main} onChange={(event) => setEditingMenu((prev) => ({ ...prev, main: !!event.value }))} />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">Visible y activo</span>
                            <InputSwitch checked={!!editingMenu.cesdo} onChange={(event) => setEditingMenu((prev) => ({ ...prev, cesdo: !!event.value }))} />
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex justify-end">
                    <Button label="Guardar menu" className="rounded-full" onClick={submitMenu} />
                </div>
            </Dialog>
        </>
    );
}
