import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MenusIndex({ menus }: { menus: Array<{ id: number; name: string; location: string; items: Array<{ id: number; label: string; url: string | null; sort_order: number; type?: string }> }> }) {
    const menuForm = useForm({ name: '', location: '', description: '' });
    const itemForm = useForm<{ label: string; url: string; type: string; parent_id: string; target: string; sort_order: number }>({
        label: '',
        url: '',
        type: 'custom',
        parent_id: '',
        target: '_self',
        sort_order: 1,
    });

    return (
        <>
            <Head title="Menus" />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create menu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                menuForm.post('/admin/menus');
                            }}
                            className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                        >
                            <InputText value={menuForm.data.name} onChange={(event) => menuForm.setData('name', event.target.value)} placeholder="Menu name" />
                            <InputText value={menuForm.data.location} onChange={(event) => menuForm.setData('location', event.target.value)} placeholder="Location" />
                            <Button label="Create" icon="pi pi-plus" />
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-2">
                    {menus.map((menu) => (
                        <Card key={menu.id}>
                            <CardHeader>
                                <CardTitle>{menu.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        itemForm.post(`/admin/menus/${menu.id}/items`);
                                    }}
                                    className="grid gap-3 rounded-2xl border border-slate-200 p-4"
                                >
                                    <InputText value={itemForm.data.label} onChange={(event) => itemForm.setData('label', event.target.value)} placeholder="Label" />
                                    <InputText value={itemForm.data.url} onChange={(event) => itemForm.setData('url', event.target.value)} placeholder="URL" />
                                    <Dropdown
                                        value={itemForm.data.type}
                                        options={[
                                            { label: 'Custom', value: 'custom' },
                                            { label: 'Page', value: 'page' },
                                            { label: 'Category', value: 'category' },
                                        ]}
                                        onChange={(event) => itemForm.setData('type', event.value)}
                                        placeholder="Type"
                                    />
                                    <InputNumber value={itemForm.data.sort_order} onValueChange={(event) => itemForm.setData('sort_order', event.value ?? 1)} placeholder="Order" />
                                    <Button label="Add item" icon="pi pi-plus" />
                                </form>

                                <DataTable value={menu.items} dataKey="id" paginator rows={6} stripedRows size="small" className="rounded-2xl border border-slate-200">
                                    <Column field="label" header="Label" sortable />
                                    <Column field="url" header="URL" />
                                    <Column field="sort_order" header="Order" sortable />
                                </DataTable>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
