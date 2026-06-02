import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

type RoleOption = { id: number; name: string };
type UserRecord = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    email_verified_at?: string | null;
    created_at?: string | null;
};

type UserFormState = {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: string | null;
};

const emptyForm: UserFormState = {
    name: '',
    email: '',
    password: '',
    role: null,
};

export default function UsersIndex() {
    const page = usePage<{ users: UserRecord[]; roles: RoleOption[] }>();
    const { t } = useAtlasLocale();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<UserFormState>(emptyForm);

    const roleOptions = page.props.roles.map((role) => ({ label: role.name, value: role.name }));

    const submit = () => {
        const payload = {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
        };

        if (form.id) {
            router.put(`/admin/users/${form.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setForm(emptyForm);
                },
            });

            return;
        }

        router.post('/admin/users', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setDialogOpen(false);
                setForm(emptyForm);
            },
        });
    };

    return (
        <>
            <Head title={t('Usuarios', 'Users')} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{t('Atlas usuarios', 'Atlas users')}</p>
                            <CardTitle className="text-3xl">{t('Gestión de usuarios', 'User management')}</CardTitle>
                            <CardDescription>{t('Crea, actualiza y elimina usuarios del CMS desde el área de gobernanza administrativa.', 'Create, update and remove CMS users from the admin governance area.')}</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('Resumen', 'Overview')}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <span className="text-slate-600">{t('Usuarios', 'Users')}</span>
                                <span className="text-lg font-semibold text-slate-950">{page.props.users.length}</span>
                            </div>
                            <Button label={t('Nuevo usuario', 'New user')} icon="pi pi-plus" className="w-full rounded-full" onClick={() => {
                                setForm(emptyForm);
                                setDialogOpen(true);
                            }} />
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('Usuarios registrados', 'Registered users')}</CardTitle>
                        <CardDescription>{t('Gestiona administradores, editores y cuentas de apoyo para Atlas CMS.', 'Manage administrators, editors and supporting accounts for Atlas CMS.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable value={page.props.users} dataKey="id" paginator rows={10} stripedRows className="rounded-2xl border border-slate-200" emptyMessage={t('Todavía no hay usuarios registrados.', 'No users registered yet.')}>
                            <Column field="name" header={t('Nombre', 'Name')} sortable />
                            <Column field="email" header="Email" sortable />
                            <Column header={t('Rol', 'Role')} body={(row: UserRecord) => row.roles[0] ?? t('Sin rol', 'No role')} />
                            <Column header={t('Verificado', 'Verified')} body={(row: UserRecord) => row.email_verified_at ? t('Sí', 'Yes') : t('No', 'No')} />
                            <Column header={t('Creado', 'Created')} body={(row: UserRecord) => row.created_at ? row.created_at.slice(0, 10) : '-'} />
                            <Column
                                header={t('Acciones', 'Actions')}
                                body={(row: UserRecord) => (
                                    <div className="flex gap-2">
                                        <Button
                                            icon="pi pi-pencil"
                                            text
                                            rounded
                                            onClick={() => {
                                                setForm({
                                                    id: row.id,
                                                    name: row.name,
                                                    email: row.email,
                                                    password: '',
                                                    role: row.roles[0] ?? null,
                                                });
                                                setDialogOpen(true);
                                            }}
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            onClick={() => {
                                                if (window.confirm(t(`¿Eliminar el usuario "${row.name}"?`, `Delete user "${row.name}"?`))) {
                                                    router.delete(`/admin/users/${row.id}`, { preserveScroll: true });
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </DataTable>
                    </CardContent>
                </Card>
            </div>

            <Dialog header={form.id ? t('Editar usuario', 'Edit user') : t('Crear usuario', 'Create user')} visible={dialogOpen} onHide={() => setDialogOpen(false)} className="w-full max-w-2xl">
                <div className="grid gap-4">
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">{t('Nombre', 'Name')}</span>
                        <InputText value={form.name} onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))} className="w-full" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">Email</span>
                        <InputText value={form.email} onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))} className="w-full" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">{t('Contraseña', 'Password')} {form.id ? t('(opcional)', '(optional)') : ''}</span>
                        <InputText type="password" value={form.password} onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))} className="w-full" />
                    </label>
                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">{t('Rol', 'Role')}</span>
                        <Dropdown value={form.role} options={roleOptions} onChange={(event) => setForm((previous) => ({ ...previous, role: event.value }))} showClear className="w-full" />
                    </label>
                    <Button label={form.id ? t('Actualizar usuario', 'Update user') : t('Crear usuario', 'Create user')} icon="pi pi-save" className="w-full rounded-full" onClick={submit} />
                </div>
            </Dialog>
        </>
    );
}
