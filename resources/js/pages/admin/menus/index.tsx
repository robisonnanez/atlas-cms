import { useEffect, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
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

export default function MenusIndex({ menus }: { menus: MenuRecord[] }) {
    const [menuState, setMenuState] = useState<MenuRecord[]>(menus);
    const [selectedMenuId, setSelectedMenuId] = useState<number | null>(menus[0]?.id ?? null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(menus[0]?.items?.[0]?.id ?? null);

    const menuForm = useForm({ name: '', location: '', description: '' });
    const createItemForm = useForm({
        label: '',
        url: '',
        type: 'custom',
        parent_id: '',
        target: '_self',
        sort_order: 1,
    });
    const editItemForm = useForm({
        label: '',
        url: '',
        type: 'custom',
        parent_id: '',
        target: '_self',
        sort_order: 1,
    });

    const selectedMenu = menuState.find((menu) => menu.id === selectedMenuId) ?? menuState[0] ?? null;
    const selectedItem = selectedMenu?.items.find((item) => item.id === selectedItemId) ?? selectedMenu?.items[0] ?? null;

    useEffect(() => {
        setMenuState(menus);
    }, [menus]);

    useEffect(() => {
        if (menuState.length > 0 && !selectedMenu) {
            setSelectedMenuId(menuState[0].id);
        }
    }, [menuState, selectedMenu]);

    useEffect(() => {
        setSelectedItemId(selectedMenu?.items[0]?.id ?? null);
    }, [selectedMenu?.id]);

    useEffect(() => {
        editItemForm.setData({
            label: selectedItem?.label ?? '',
            url: selectedItem?.url ?? '',
            type: selectedItem?.type ?? 'custom',
            parent_id: selectedItem?.parent_id ? String(selectedItem.parent_id) : '',
            target: selectedItem?.target ?? '_self',
            sort_order: selectedItem?.sort_order ?? 1,
        });
    }, [selectedItem?.id]);

    return (
        <>
            <Head title="Menus" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas navigation</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Menu builder</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Create locations, assign links and tune ordering from a dedicated control surface for the site navigation.
                            </p>
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
                                <CardDescription>Define the menu name and where it should render in the theme.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        menuForm.post('/admin/menus');
                                    }}
                                    className="grid gap-4"
                                >
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Menu name</span>
                                        <InputText value={menuForm.data.name} onChange={(event) => menuForm.setData('name', event.target.value)} className="w-full" />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Location</span>
                                        <InputText
                                            value={menuForm.data.location}
                                            onChange={(event) => menuForm.setData('location', event.target.value)}
                                            placeholder="primary-navigation"
                                            className="w-full"
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Description</span>
                                        <InputText
                                            value={menuForm.data.description}
                                            onChange={(event) => menuForm.setData('description', event.target.value)}
                                            placeholder="Main header navigation"
                                            className="w-full"
                                        />
                                    </label>
                                    <Button label="Create menu" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Registered menus</CardTitle>
                                <CardDescription>Select one to manage its items and ordering rules.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    value={menuState}
                                    dataKey="id"
                                    selectionMode="single"
                                    selection={selectedMenu}
                                    onSelectionChange={(event) => setSelectedMenuId((event.value as MenuRecord | null)?.id ?? null)}
                                    className="rounded-2xl border border-slate-200"
                                    emptyMessage="Create the first navigation menu to start building the site structure."
                                >
                                    <Column field="name" header="Menu" sortable />
                                    <Column field="location" header="Location" sortable />
                                    <Column
                                        header="Items"
                                        body={(row: MenuRecord) => <Tag value={String(row.items.length)} severity="secondary" rounded />}
                                    />
                                </DataTable>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>{selectedMenu ? selectedMenu.name : 'Select a menu'}</CardTitle>
                                <CardDescription>
                                    {selectedMenu ? `Location: ${selectedMenu.location}` : 'Choose a menu from the left to manage its navigation items.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedMenu ? (
                                    <div className="space-y-6">
                                        <form
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                createItemForm.post(`/admin/menus/${selectedMenu.id}/items`);
                                            }}
                                            className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">Label</span>
                                                    <InputText
                                                        value={createItemForm.data.label}
                                                        onChange={(event) => createItemForm.setData('label', event.target.value)}
                                                        placeholder="Blog"
                                                        className="w-full"
                                                    />
                                                </label>
                                                <label className="space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">URL</span>
                                                    <InputText
                                                        value={createItemForm.data.url}
                                                        onChange={(event) => createItemForm.setData('url', event.target.value)}
                                                        placeholder="/blog"
                                                        className="w-full"
                                                    />
                                                </label>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <label className="space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">Type</span>
                                                    <Dropdown
                                                        value={createItemForm.data.type}
                                                        options={typeOptions}
                                                        onChange={(event) => createItemForm.setData('type', event.value)}
                                                        className="w-full"
                                                    />
                                                </label>
                                                <label className="space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">Target</span>
                                                    <Dropdown
                                                        value={createItemForm.data.target}
                                                        options={targetOptions}
                                                        onChange={(event) => createItemForm.setData('target', event.value)}
                                                        className="w-full"
                                                    />
                                                </label>
                                                <label className="space-y-2">
                                                    <span className="text-sm font-medium text-slate-700">Sort order</span>
                                                    <InputNumber
                                                        value={createItemForm.data.sort_order}
                                                        onValueChange={(event) => createItemForm.setData('sort_order', event.value ?? 1)}
                                                        min={1}
                                                        className="w-full"
                                                        inputClassName="w-full"
                                                    />
                                                </label>
                                            </div>
                                            <Button label="Add item" icon="pi pi-plus" type="submit" className="w-full rounded-full" />
                                        </form>

                                        <DataTable
                                            value={selectedMenu.items}
                                            dataKey="id"
                                            paginator
                                            rows={6}
                                            stripedRows
                                            size="small"
                                            reorderableRows
                                            selectionMode="single"
                                            selection={selectedItem}
                                            onRowReorder={(event) => {
                                                const nextItems = event.value as MenuItemRecord[];
                                                setMenuState((current) => current.map((menu) => (
                                                    menu.id === selectedMenu.id ? { ...menu, items: nextItems } : menu
                                                )));
                                                router.put(`/admin/menus/${selectedMenu.id}/items/reorder`, {
                                                    ordered_ids: nextItems.map((item) => item.id),
                                                }, {
                                                    preserveScroll: true,
                                                });
                                            }}
                                            onSelectionChange={(event) => setSelectedItemId((event.value as MenuItemRecord | null)?.id ?? null)}
                                            className="rounded-2xl border border-slate-200"
                                            emptyMessage="This menu has no items yet."
                                        >
                                            <Column rowReorder style={{ width: '3rem' }} />
                                            <Column field="label" header="Label" sortable />
                                            <Column field="url" header="URL" />
                                            <Column field="type" header="Type" />
                                            <Column field="sort_order" header="Order" sortable />
                                        </DataTable>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                        Select a menu to start composing navigation items.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Edit selected item</CardTitle>
                                <CardDescription>Refine the item currently highlighted in the menu list.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedMenu && selectedItem ? (
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            editItemForm.put(`/admin/menu-items/${selectedItem.id}`);
                                        }}
                                        className="grid gap-4"
                                    >
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">Label</span>
                                                <InputText
                                                    value={editItemForm.data.label}
                                                    onChange={(event) => editItemForm.setData('label', event.target.value)}
                                                    className="w-full"
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">URL</span>
                                                <InputText
                                                    value={editItemForm.data.url}
                                                    onChange={(event) => editItemForm.setData('url', event.target.value)}
                                                    className="w-full"
                                                />
                                            </label>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">Type</span>
                                                <Dropdown
                                                    value={editItemForm.data.type}
                                                    options={typeOptions}
                                                    onChange={(event) => editItemForm.setData('type', event.value)}
                                                    className="w-full"
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">Target</span>
                                                <Dropdown
                                                    value={editItemForm.data.target}
                                                    options={targetOptions}
                                                    onChange={(event) => editItemForm.setData('target', event.value)}
                                                    className="w-full"
                                                />
                                            </label>
                                            <label className="space-y-2">
                                                <span className="text-sm font-medium text-slate-700">Sort order</span>
                                                <InputNumber
                                                    value={editItemForm.data.sort_order}
                                                    onValueChange={(event) => editItemForm.setData('sort_order', event.value ?? 1)}
                                                    min={1}
                                                    className="w-full"
                                                    inputClassName="w-full"
                                                />
                                            </label>
                                        </div>
                                        <Button
                                            label={editItemForm.processing ? 'Saving...' : 'Save item'}
                                            icon="pi pi-save"
                                            type="submit"
                                            loading={editItemForm.processing}
                                            className="w-full rounded-full"
                                        />
                                    </form>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                        Select a menu item to edit its label, URL and target.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
