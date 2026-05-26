import { Head, useForm } from '@inertiajs/react';

export default function InstallSite() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        site_name: 'Atlas CMS',
        site_tagline: 'Modern content operations',
    });

    return (
        <>
            <Head title="Site setup" />
            <div className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-semibold">Site and admin setup</h1>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    form.post('/install/finish');
                }} className="mt-8 grid gap-4 rounded-3xl border p-8 shadow-sm">
                    {[
                        ['name', 'Administrator name'],
                        ['email', 'Administrator email'],
                        ['password', 'Administrator password'],
                        ['site_name', 'Site name'],
                        ['site_tagline', 'Site tagline'],
                    ].map(([key, label]) => (
                        <label key={key} className="grid gap-2 text-sm">
                            <span>{label}</span>
                            <input
                                type={key === 'password' ? 'password' : 'text'}
                                className="rounded-xl border px-4 py-3"
                                value={form.data[key as keyof typeof form.data]}
                                onChange={(event) => form.setData(key as keyof typeof form.data, event.target.value)}
                            />
                        </label>
                    ))}
                    <button className="mt-4 rounded-full bg-slate-950 px-5 py-3 font-medium text-white" disabled={form.processing}>
                        Finish installation
                    </button>
                </form>
            </div>
        </>
    );
}
