import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type SiteMenuItem = { id: number; label: string; url: string; target?: string | null; children?: SiteMenuItem[] };
type ChromeHeader = { advanced_html?: string };
type ChromeFooter = { advanced_html?: string };

type SiteLayoutProps = {
    title?: string;
    site: {
        identity?: { name?: string; tagline?: string };
        chrome?: { header?: ChromeHeader; footer?: ChromeFooter; header_html?: string; footer_html?: string };
        locale?: string;
    };
    menu?: SiteMenuItem[];
    children: React.ReactNode;
};

function hasLink(url?: string | null): boolean {
    return !!url && url !== '#';
}

function PublicMenuNode({ item, depth = 1 }: { item: SiteMenuItem; depth?: number }) {
    const [open, setOpen] = useState(false);
    const hasChildren = (item.children?.length ?? 0) > 0 && depth <= 4;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const panelClass = depth === 1 ? 'left-0 top-full pt-2 min-w-64' : 'left-full top-0 pl-2 min-w-60';

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    if (!hasChildren) {
        if (!hasLink(item.url)) return <span className="text-slate-500">{item.label}</span>;
        return (
            <Link
                href={item.url}
                target={item.target ?? '_self'}
                className={depth === 1 ? 'text-slate-600 transition hover:text-slate-950' : 'block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950'}
            >
                {item.label}
            </Link>
        );
    }

    const labelClass = depth === 1 ? 'text-slate-600 transition hover:text-slate-950' : 'block flex-1 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950';
    const toggleClass = depth === 1 ? 'inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950' : 'inline-flex size-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950';

    return (
        <div ref={rootRef} className={`relative ${depth === 1 ? '' : 'w-full'}`}>
            <div className={depth === 1 ? 'inline-flex items-center gap-1' : 'flex w-full items-center justify-between gap-2'}>
                {hasLink(item.url) ? (
                    <Link href={item.url} target={item.target ?? '_self'} className={labelClass}>
                        {item.label}
                    </Link>
                ) : (
                    <span className={depth === 1 ? 'text-slate-700' : 'flex-1 rounded-xl px-3 py-2 text-sm text-slate-700'}>{item.label}</span>
                )}
                <button type="button" className={toggleClass} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`Abrir submenú de ${item.label}`}>
                    <i className={`pi ${open ? 'pi-angle-down' : 'pi-angle-right'} text-xs`} />
                </button>
            </div>
            {open ? (
                <div className={`absolute z-40 ${panelClass}`}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
                        <div className="space-y-1">
                            {hasLink(item.url) ? <Link href={item.url} target={item.target ?? '_self'} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">Ir a {item.label}</Link> : null}
                            {item.children!.map((child) => (
                                <div key={child.id} className="relative">
                                    <PublicMenuNode item={child} depth={depth + 1} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function SiteLayout({ title, site, menu = [], children }: SiteLayoutProps) {
    const brand = site.identity?.name ?? 'Atlas CMS';
    const chrome = site.chrome ?? {};
    const header = chrome.header;
    const footer = chrome.footer;

    return (
        <>
            <Head title={title ?? brand} />
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_35%,_#ffffff_100%)] text-slate-900">
                {header?.advanced_html ? (
                    <div dangerouslySetInnerHTML={{ __html: header.advanced_html }} />
                ) : chrome.header_html ? (
                    <div dangerouslySetInnerHTML={{ __html: chrome.header_html }} />
                ) : (
                    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
                        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="h-12 w-auto rounded-2xl object-contain" />
                                <div>
                                    <div className="text-sm font-semibold">{brand}</div>
                                    <div className="text-xs text-slate-500">{site.identity?.tagline ?? 'Operaciones de contenido modernas'}</div>
                                </div>
                            </Link>

                            <nav className="hidden items-center gap-6 text-sm md:flex">
                                {menu.map((item) => <PublicMenuNode key={item.id} item={item} />)}
                                <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-950 hover:text-white">Admin</Link>
                            </nav>
                        </div>
                    </header>
                )}

                <main>{children}</main>

                {footer?.advanced_html ? (
                    <div dangerouslySetInnerHTML={{ __html: footer.advanced_html }} />
                ) : chrome.footer_html ? (
                    <div dangerouslySetInnerHTML={{ __html: chrome.footer_html }} />
                ) : (
                    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
                        <div className="mx-auto max-w-6xl px-6 py-12">
                            <div className="flex flex-col gap-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
                                <p>{brand}</p>
                                <p>Contenido, menús, media y publicaciones gestionadas desde Atlas CMS.</p>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </>
    );
}
