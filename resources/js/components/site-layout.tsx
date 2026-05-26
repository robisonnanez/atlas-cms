import { Head, Link } from '@inertiajs/react';

type SiteLayoutProps = {
    title?: string;
    site: { identity?: { name?: string; tagline?: string } };
    menu?: Array<{ id: number; label: string; url: string; children?: Array<{ id: number; label: string; url: string }> }>;
    children: React.ReactNode;
};

export default function SiteLayout({ title, site, menu = [], children }: SiteLayoutProps) {
    const brand = site.identity?.name ?? 'Atlas CMS';

    return (
        <>
            <Head title={title ?? brand} />
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_35%,_#ffffff_100%)] text-slate-900">
                <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                                AT
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{brand}</div>
                                <div className="text-xs text-slate-500">{site.identity?.tagline ?? 'Modern editorial control'}</div>
                            </div>
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm md:flex">
                            {menu.map((item) => (
                                <Link key={item.id} href={item.url} className="text-slate-600 transition hover:text-slate-950">
                                    {item.label}
                                </Link>
                            ))}
                            <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-950 hover:text-white">
                                Admin
                            </Link>
                        </nav>
                    </div>
                </header>
                <main>{children}</main>
            </div>
        </>
    );
}
