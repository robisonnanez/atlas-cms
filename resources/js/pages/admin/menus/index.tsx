import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Tree, type TreeDragDropEvent, type TreeNode } from 'primereact/tree';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MenuItemRecord = {
    id: number;
    label: string;
    url: string | null;
    sort_order: number;
    type?: string;
    parent_id?: number | null;
    target?: string | null;
};

type MenuRecord = {
    id: number;
    name: string;
    location: string;
    description?: string | null;
    items: MenuItemRecord[];
};

const typeOptions = [
    { label: 'Custom', value: 'custom' },
    { label: 'Page', value: 'page' },
    { label: 'Category', value: 'category' },
];

const targetOptions = [
    { label: 'Same tab', value: '_self' },
    { label: 'New tab', value: '_blank' },
];

function buildTree(items: MenuItemRecord[], parentId: number | null = null, depth = 1): TreeNode[] {
    return items
        .filter((item) => (item.parent_id ?? null) === parentId)
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((item) => ({
            key: String(item.id),
            label: item.label,
            data: { ...item, depth },
            children: buildTree(items, item.id, depth + 1),
        }));
}

function flattenTree(nodes: TreeNode[], result: MenuItemRecord[] = []): MenuItemRecord[] {
    for (const node of nodes) {
        if (node.data) {
            result.push(node.data as MenuItemRecord);
        }
        if (node.children?.length) {
            flattenTree(node.children, result);
        }
    }
    return result;
}

export default function MenusIndex({ menus }: { menus: MenuRecord[] }) {
    const [menuState, setMenuState] = useState<MenuRecord[]>(menus);
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(menus[0]?.id ?? null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(menus[0]?.items?.[0]?.id ?? null);

    const menuForm = useForm({ name: '', location: 'primary', description: '' });
    const createItemForm = useForm({
        label: '',
        url: '',
        type: 'custom',
        parent_id: null as number | null,
        target: '_self',
        sort_order: 1,
    });
    const editItemForm = useForm({
        label: '',
        url: '',
        type: 'custom',
        parent_id: null as number | null,
        target: '_self',
        sort_order: 1,
    });

    const selectedMenu = menuState.find((menu) => menu.id === selectedMenuId) ?? menuState[0] ?? null;
    const orderedItems = useMemo(() => [...(selectedMenu?.items ?? [])].sort((left, right) => left.sort_order - right.sort_order), [selectedMenu]);
    const treeNodes = useMemo(() => buildTree(orderedItems), [orderedItems]);
    const flattened = useMemo(() => flattenTree(treeNodes), [treeNodes]);
    const selectedItem = flattened.find((item) => item.id === selectedItemId) ?? flattened[0] ?? null;

    const parentOptions = useMemo(() => [
        { label: 'Top level', value: null },
        ...flattened.map((item) => ({ label: item.label, value: item.id })),
    ], [flattened]);

    useEffect(() => setMenuState(menus), [menus]);
    useEffect(() => {
        if (menuState.length > 0 && !selectedMenu) setSelectedMenuId(menuState[0].id);
    }, [menuState, selectedMenu]);
    useEffect(() => setSelectedItemId(flattened[0]?.id ?? null), [selectedMenu?.id, flattened]);
    useEffect(() => {
        editItemForm.setData({
            label: selectedItem?.label ?? '',
            url: selectedItem?.url ?? '',
            type: selectedItem?.type ?? 'custom',
            parent_id: selectedItem?.parent_id ?? null,
            target: selectedItem?.target ?? '_self',
            sort_order: selectedItem?.sort_order ?? 1,
        });
    }, [selectedItem?.id]);

    const removeMenu = () => {
        if (!selectedMenu) return;
        if (!window.confirm(`Delete the menu "${selectedMenu.name}" and all of its items?`)) return;
        router.delete(`/admin/menus/${selectedMenu.id}`, { preserveScroll: true, onSuccess: () => { setSelectedMenuId(null); setSelectedItemId(null); } });
    };

    const removeItem = () => {
        if (!selectedItem) return;
        if (!window.confirm(`Delete the menu item "${selectedItem.label}"? Child items will move to top level.`)) return;
        router.delete(`/admin/menu-items/${selectedItem.id}`, { preserveScroll: true, onSuccess: () => setSelectedItemId(null) });
    };

    const onTreeDrop = (event: TreeDragDropEvent) => {
        if (!selectedMenu) return;
        const nextTree = (event.value ?? []) as TreeNode[];
        router.put(`/admin/menus/${selectedMenu.id}/items/tree`, {
            tree: nextTree,
        }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Menus" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas navigation</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Menu builder</h1>
                            <p className="max-w-2xl text-sm text-slate-600">Create navigation containers, then arrange links and submenus with real hierarchical drag and drop up to 4 levels.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            <span className="font-medium text-slate-900">{menuState.length}</span> menus registered
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Create menu</CardTitle>
                                <CardDescription>This creates the menu container itself, for example the main header menu, footer links or a sidebar navigation.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(event) => { event.preventDefault(); menuForm.post('/admin/menus', { onSuccess: () => menuForm.reset('name', 'description') }); }} className="grid gap-4">
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Menu name</span><InputText value={menuForm.data.name} onChange={(event) => menuForm.setData('name', event.target.value)} className="w-full" /></label>
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Location</span><InputText value={menuForm.data.location} onChange={(event) => menuForm.setData('location', event.target.value)} placeholder="primary" className="w-full" /></label>
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Description</span><InputText value={menuForm.data.description} onChange={(event) => menuForm.setData('description', event.target.value)} placeholder="Main header navigation" className="w-full" /></label>
                                    <Button label="Create menu" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Registered menus</CardTitle>
                                <CardDescription>Select one to manage its items, submenus and ordering rules.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable value={menuState} dataKey="id" selectionMode="single" selection={selectedMenu} onSelectionChange={(event) => setSelectedMenuId((event.value as MenuRecord | null)?.id ?? null)} className="rounded-2xl border border-slate-200" emptyMessage="Create the first navigation menu to start building the site structure.">
                                    <Column field="name" header="Menu" sortable />
                                    <Column field="location" header="Location" sortable />
                                    <Column header="Items" body={(row: MenuRecord) => <Tag value={String(row.items.length)} severity="secondary" rounded />} />
                                </DataTable>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <CardTitle>{selectedMenu ? selectedMenu.name : 'Select a menu'}</CardTitle>
                                        <CardDescription>{selectedMenu ? `Location: ${selectedMenu.location}` : 'Choose a menu from the left to manage its navigation items.'}</CardDescription>
                                    </div>
                                    {selectedMenu ? <Button label="Delete menu" icon="pi pi-trash" severity="danger" outlined onClick={removeMenu} className="rounded-full" /> : null}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {selectedMenu ? (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">Drag and drop items inside the tree to reorder or convert them into real submenus. Atlas currently supports <span className="font-semibold">4 levels</span>.</div>

                                        <form onSubmit={(event) => {
                                            event.preventDefault();
                                            createItemForm.post(`/admin/menus/${selectedMenu.id}/items`, { onSuccess: () => createItemForm.reset('label', 'url', 'parent_id', 'sort_order') });
                                        }} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Label</span><InputText value={createItemForm.data.label} onChange={(event) => createItemForm.setData('label', event.target.value)} placeholder="Blog" className="w-full" /></label>
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">URL</span><InputText value={createItemForm.data.url} onChange={(event) => createItemForm.setData('url', event.target.value)} placeholder="/blog" className="w-full" /></label>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Type</span><Dropdown value={createItemForm.data.type} options={typeOptions} onChange={(event) => createItemForm.setData('type', event.value)} className="w-full" /></label>
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Target</span><Dropdown value={createItemForm.data.target} options={targetOptions} onChange={(event) => createItemForm.setData('target', event.value)} className="w-full" /></label>
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Parent item</span><Dropdown value={createItemForm.data.parent_id} options={parentOptions} onChange={(event) => createItemForm.setData('parent_id', event.value)} placeholder="Choose parent" showClear className="w-full" /></label>
                                                <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Sort order</span><InputNumber value={createItemForm.data.sort_order} onValueChange={(event) => createItemForm.setData('sort_order', event.value ?? 1)} min={1} className="w-full" inputClassName="w-full" /></label>
                                            </div>
                                            <Button label="Add item" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                                        </form>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="mb-3">
                                                <h3 className="text-base font-semibold text-slate-950">Hierarchy tree</h3>
                                                <p className="text-sm text-slate-600">Select an item to edit it. Drag over another item to place it inside that submenu.</p>
                                            </div>
                                            <Tree value={treeNodes} selectionMode="single" selectionKeys={selectedItemId ? { [String(selectedItemId)]: true } : undefined} onSelectionChange={(event) => {
                                                const key = Object.keys((event.value as Record<string, boolean>) ?? {})[0];
                                                setSelectedItemId(key ? Number(key) : null);
                                            }} dragdropScope="atlas-menu-tree" onDragDrop={onTreeDrop} className="border-0 p-0" />
                                        </div>

                                        {selectedItem ? (
                                            <form onSubmit={(event) => {
                                                event.preventDefault();
                                                editItemForm.put(`/admin/menu-items/${selectedItem.id}`);
                                            }} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                    <div>
                                                        <h3 className="text-base font-semibold text-slate-950">Edit item</h3>
                                                        <p className="text-sm text-slate-600">Update the selected menu item or remove it from the hierarchy.</p>
                                                    </div>
                                                    <Button label="Delete item" icon="pi pi-trash" severity="danger" outlined onClick={removeItem} type="button" className="rounded-full" />
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Label</span><InputText value={editItemForm.data.label} onChange={(event) => editItemForm.setData('label', event.target.value)} className="w-full" /></label>
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">URL</span><InputText value={editItemForm.data.url} onChange={(event) => editItemForm.setData('url', event.target.value)} className="w-full" /></label>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Type</span><Dropdown value={editItemForm.data.type} options={typeOptions} onChange={(event) => editItemForm.setData('type', event.value)} className="w-full" /></label>
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Target</span><Dropdown value={editItemForm.data.target} options={targetOptions} onChange={(event) => editItemForm.setData('target', event.value)} className="w-full" /></label>
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Parent item</span><Dropdown value={editItemForm.data.parent_id} options={parentOptions.filter((option) => option.value !== selectedItem.id)} onChange={(event) => editItemForm.setData('parent_id', event.value)} placeholder="Choose parent" showClear className="w-full" /></label>
                                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Sort order</span><InputNumber value={editItemForm.data.sort_order} onValueChange={(event) => editItemForm.setData('sort_order', event.value ?? 1)} min={1} className="w-full" inputClassName="w-full" /></label>
                                                </div>
                                                <Button label="Save item" icon="pi pi-save" type="submit" className="w-full rounded-full" />
                                            </form>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Select a menu item to edit it, move it under a parent or delete it.</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">Select or create a menu to start building Atlas navigation.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
