import { Head, Link } from '@inertiajs/react';

export default function InstallAdmin() {
    return (
        <>
            <Head title="Admin user" />
            <div className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-semibold">Create the administrator</h1>
                <p className="text-muted-foreground mt-3">The final step will create a super-admin account and mark Atlas as installed.</p>
                <div className="mt-8 flex gap-3">
                    <Link href="/install/site" className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white">
                        Continue
                    </Link>
                </div>
            </div>
        </>
    );
}
