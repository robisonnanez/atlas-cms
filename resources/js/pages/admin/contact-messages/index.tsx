import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type ContactMessageItem = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    ip_address?: string | null;
    is_read: boolean;
    created_at: string;
};

type PaginatedMessages = {
    data: ContactMessageItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function ContactMessagesIndex({
    messages,
    stats = { total: 0, unread: 0 },
    filters = {},
}: {
    messages: PaginatedMessages;
    stats: { total: number; unread: number };
    filters: { status?: string };
}) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const showToast = (severity: 'success' | 'warn' | 'error', detail: string) => {
        toast.current?.show({ severity, summary: t('Formulario de Contacto', 'Contact Form'), detail, life: 3000 });
    };

    const handleFilterStatus = (status: string | null) => {
        router.get('/admin/contact-messages', status ? { status } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleRead = (msg: ContactMessageItem) => {
        router.post(`/admin/contact-messages/${msg.id}/toggle-read`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast('success', t('Estado de lectura actualizado.', 'Read status updated.')),
        });
    };

    const handleDelete = (msg: ContactMessageItem) => {
        if (confirm(t(`¿Eliminar mensaje de '${msg.name}'?`, `Delete message from '${msg.name}'?`))) {
            router.delete(`/admin/contact-messages/${msg.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setViewDialogOpen(false);
                    showToast('success', t('Mensaje eliminado.', 'Message deleted.'));
                },
            });
        }
    };

    const openMessageDetail = (msg: ContactMessageItem) => {
        setSelectedMessage(msg);
        setViewDialogOpen(true);
        if (!msg.is_read) {
            router.post(`/admin/contact-messages/${msg.id}/toggle-read`, {}, { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            <Head title={t('Mensajes de Contacto - Atlas CMS', 'Contact Messages - Atlas CMS')} />
            <Toast ref={toast} />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('Mensajes de Contacto', 'Contact Messages')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('Consultas y mensajes recibidos a través de los formularios del sitio web.', 'Inquiries and messages received through website forms.')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('Total de Mensajes', 'Total Messages')}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-sky-500">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('Mensajes No Leídos', 'Unread Messages')}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-amber-500">{stats.unread}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t('Bandeja de Entrada', 'Inbox')}</CardTitle>
                    <div className="w-48">
                        <Dropdown
                            value={filters.status || ''}
                            options={[
                                { label: t('Todos los mensajes', 'All Messages'), value: '' },
                                { label: t('Solo no leídos', 'Unread Only'), value: 'unread' },
                                { label: t('Solo leídos', 'Read Only'), value: 'read' },
                            ]}
                            onChange={(e) => handleFilterStatus(e.value || null)}
                            className="w-full p-inputtext-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        value={messages?.data || []}
                        responsiveLayout="scroll"
                        emptyMessage={t('No hay mensajes de contacto registrados.', 'No contact messages recorded.')}
                        className="p-datatable-sm"
                    >
                        <Column
                            header={t('Estado', 'Status')}
                            body={(row: ContactMessageItem) => (
                                <Tag
                                    value={row.is_read ? t('Leído', 'Read') : t('Nuevo', 'New')}
                                    severity={row.is_read ? 'secondary' : 'warning'}
                                    className="cursor-pointer text-xs"
                                    onClick={() => handleToggleRead(row)}
                                />
                            )}
                        />
                        <Column field="name" header={t('Nombre', 'Name')} sortable />
                        <Column field="email" header={t('Correo', 'Email')} />
                        <Column field="subject" header={t('Asunto', 'Subject')} />
                        <Column
                            field="created_at"
                            header={t('Fecha', 'Date')}
                            body={(row: ContactMessageItem) => (
                                <span className="text-xs text-slate-500">
                                    {new Date(row.created_at).toLocaleString()}
                                </span>
                            )}
                        />
                        <Column
                            header={t('Acciones', 'Actions')}
                            body={(row: ContactMessageItem) => (
                                <div className="flex items-center gap-1">
                                    <Button
                                        icon="pi pi-eye"
                                        className="p-button-rounded p-button-text p-button-info"
                                        tooltip={t('Leer Mensaje', 'Read Message')}
                                        onClick={() => openMessageDetail(row)}
                                    />
                                    <Button
                                        icon={row.is_read ? 'pi pi-envelope' : 'pi pi-envelope-open'}
                                        className="p-button-rounded p-button-text p-button-secondary"
                                        tooltip={row.is_read ? t('Marcar no leído', 'Mark unread') : t('Marcar leído', 'Mark read')}
                                        onClick={() => handleToggleRead(row)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        tooltip={t('Eliminar', 'Delete')}
                                        onClick={() => handleDelete(row)}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                </CardContent>
            </Card>

            <Dialog
                header={selectedMessage ? `${t('Mensaje de', 'Message from')} ${selectedMessage.name}` : ''}
                visible={viewDialogOpen}
                style={{ width: '550px' }}
                onHide={() => setViewDialogOpen(false)}
                footer={(
                    <div className="flex justify-between items-center w-full">
                        {selectedMessage && (
                            <Button
                                label={t('Eliminar', 'Delete')}
                                icon="pi pi-trash"
                                className="p-button-danger p-button-text"
                                onClick={() => handleDelete(selectedMessage)}
                            />
                        )}
                        <Button
                            label={t('Cerrar', 'Close')}
                            className="p-button-primary"
                            onClick={() => setViewDialogOpen(false)}
                        />
                    </div>
                )}
            >
                {selectedMessage && (
                    <div className="space-y-4 pt-2 text-sm">
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                            <div><span className="text-slate-500 font-medium">De:</span> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</div>
                            {selectedMessage.phone && <div><span className="text-slate-500 font-medium">Teléfono:</span> {selectedMessage.phone}</div>}
                            <div><span className="text-slate-500 font-medium">Asunto:</span> {selectedMessage.subject || '-'}</div>
                            <div><span className="text-slate-500 font-medium">Fecha:</span> {new Date(selectedMessage.created_at).toLocaleString()}</div>
                        </div>
                        <div>
                            <span className="text-slate-500 font-medium block mb-2">{t('Contenido del Mensaje:', 'Message Content:')}</span>
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 whitespace-pre-wrap leading-relaxed">
                                {selectedMessage.message}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}