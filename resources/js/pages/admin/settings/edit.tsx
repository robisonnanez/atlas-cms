import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'America/Bogota', value: 'America/Bogota' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'Europe/Madrid', value: 'Europe/Madrid' },
];

const localeOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'Portuguese', value: 'pt-BR' },
];

export default function SettingsEdit({
    settings,
}: {
    settings: {
        identity?: { value?: { name?: string; tagline?: string } };
        seo?: { value?: { title?: string; description?: string } };
        system?: { value?: { timezone?: string; locale?: string; maintenance?: boolean } };
    };
}) {
    const form = useForm({
        site_name: settings.identity?.value?.name ?? 'Atlas CMS',
        site_tagline: settings.identity?.value?.tagline ?? '',
        timezone: settings.system?.value?.timezone ?? 'UTC',
        locale: settings.system?.value?.locale ?? 'en',
        maintenance: settings.system?.value?.maintenance ?? false,
        seo_title: settings.seo?.value?.title ?? '',
        seo_description: settings.seo?.value?.description ?? '',
    });

    return (
        <>
            <Head title="Settings" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas control center</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Site settings</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Keep the brand, system defaults and search metadata aligned before opening Atlas to editors.
                            </p>
                        </div>
                        <Button
                            label={form.processing ? 'Saving...' : 'Save settings'}
                            icon="pi pi-save"
                            type="button"
                            onClick={() => form.put('/admin/settings')}
                            loading={form.processing}
                            className="rounded-full px-6"
                        />
                    </div>
                </section>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put('/admin/settings');
                    }}
                    className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Identity</CardTitle>
                                <CardDescription>Define the public-facing name and tone of the CMS instance.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Site name</span>
                                    <InputText
                                        value={form.data.site_name}
                                        onChange={(event) => form.setData('site_name', event.target.value)}
                                        placeholder="Atlas CMS"
                                        className="w-full"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Tagline</span>
                                    <InputText
                                        value={form.data.site_tagline}
                                        onChange={(event) => form.setData('site_tagline', event.target.value)}
                                        placeholder="A modern modular CMS."
                                        className="w-full"
                                    />
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>SEO defaults</CardTitle>
                                <CardDescription>Set the metadata Atlas will use when content does not override it.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">SEO title</span>
                                    <InputText
                                        value={form.data.seo_title}
                                        onChange={(event) => form.setData('seo_title', event.target.value)}
                                        placeholder="Atlas CMS"
                                        className="w-full"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">SEO description</span>
                                    <InputTextarea
                                        value={form.data.seo_description}
                                        onChange={(event) => form.setData('seo_description', event.target.value)}
                                        rows={5}
                                        autoResize
                                        placeholder="A modern modular CMS powered by Laravel and React."
                                        className="w-full"
                                    />
                                </label>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>System defaults</CardTitle>
                                <CardDescription>Choose the locale assumptions Atlas should apply across the admin and public site.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Timezone</span>
                                    <Dropdown
                                        value={form.data.timezone}
                                        options={timezoneOptions}
                                        onChange={(event) => form.setData('timezone', event.value)}
                                        placeholder="Select a timezone"
                                        editable
                                        className="w-full"
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-sm font-medium text-slate-700">Locale</span>
                                    <Dropdown
                                        value={form.data.locale}
                                        options={localeOptions}
                                        onChange={(event) => form.setData('locale', event.value)}
                                        placeholder="Select a locale"
                                        editable
                                        className="w-full"
                                    />
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Maintenance</CardTitle>
                                <CardDescription>Gate the site while administrators continue configuring content and themes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-900">Maintenance mode</p>
                                        <p className="text-sm text-slate-600">Show visitors that Atlas is being prepared before launch.</p>
                                    </div>
                                    <InputSwitch
                                        checked={form.data.maintenance}
                                        onChange={(event) => form.setData('maintenance', Boolean(event.value))}
                                    />
                                </div>

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                                    <p className="text-sm font-medium text-slate-900">Current configuration</p>
                                    <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span>Site</span>
                                            <span className="font-medium text-slate-900">{form.data.site_name || 'Atlas CMS'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Locale</span>
                                            <span className="font-medium text-slate-900">{form.data.locale || 'en'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Timezone</span>
                                            <span className="font-medium text-slate-900">{form.data.timezone || 'UTC'}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            label={form.processing ? 'Saving...' : 'Save settings'}
                            icon="pi pi-save"
                            type="submit"
                            loading={form.processing}
                            className="w-full rounded-full"
                        />
                    </div>
                </form>
            </div>
        </>
    );
}
