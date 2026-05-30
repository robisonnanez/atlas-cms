import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type SiteMenuItem = { id: number; label: string; url: string; target?: string | null; children?: SiteMenuItem[] };
type ChromeHeader = { notice_label?: string; notice_text?: string; cta_label?: string; cta_url?: string };
type ChromeFooterColumn = { title?: string; body?: string };
type ChromeFooter = { intro_title?: string; intro_body?: string; columns?: ChromeFooterColumn[]; bottom_text?: string };

type SiteLayoutProps = {
    title?: string;
    site: {
        identity?: { name?: string; tagline?: string };
        chrome?: { header?: ChromeHeader; footer?: ChromeFooter; header_html?: string; footer_html?: string };
    };
    menu?: SiteMenuItem[];
    children: React.ReactNode;
};

function hasLink(url?: string | null): boolean {
    return !!url && url !== '#';
}

function lines(text?: string | null): string[] {
    return (text ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
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
        return <Link href={item.url} target={item.target ?? '_self'} className={depth === 1 ? 'text-slate-600 transition hover:text-slate-950' : 'block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950'}>{item.label}</Link>;
    }

    const labelClass = depth === 1 ? 'text-slate-600 transition hover:text-slate-950' : 'block flex-1 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950';
    const toggleClass = depth === 1 ? 'inline-flex size-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950' : 'inline-flex size-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950';

    return (
        <div ref={rootRef} className={`relative ${depth === 1 ? '' : 'w-full'}`}>
            <div className={depth === 1 ? 'inline-flex items-center gap-1' : 'flex w-full items-center justify-between gap-2'}>
                {hasLink(item.url) ? <Link href={item.url} target={item.target ?? '_self'} className={labelClass}>{item.label}</Link> : <span className={depth === 1 ? 'text-slate-700' : 'flex-1 rounded-xl px-3 py-2 text-sm text-slate-700'}>{item.label}</span>}
                <button type="button" className={toggleClass} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={`Abrir submenu de ${item.label}`}>
                    <i className={`pi ${open ? 'pi-angle-down' : 'pi-angle-right'} text-xs`} />
                </button>
            </div>
            {open ? <div className={`absolute z-40 ${panelClass}`}><div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70"><div className="space-y-1">{hasLink(item.url) ? <Link href={item.url} target={item.target ?? '_self'} className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">Ir a {item.label}</Link> : null}{item.children!.map((child) => <div key={child.id} className="relative"><PublicMenuNode item={child} depth={depth + 1} /></div>)}</div></div></div> : null}
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
                <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
                    {header && (header.notice_label || header.notice_text || header.cta_label) ? (
                        <div className="border-b border-slate-200 bg-sky-50/80">
                            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-wrap items-center gap-3">
                                    {header.notice_label ? <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">{header.notice_label}</span> : null}
                                    {header.notice_text ? <p>{header.notice_text}</p> : null}
                                </div>
                                {header.cta_label && header.cta_url ? <Link href={header.cta_url} className="inline-flex items-center rounded-full border border-sky-300 bg-white px-4 py-2 font-medium text-sky-700 transition hover:bg-sky-700 hover:text-white">{header.cta_label}</Link> : null}
                            </div>
                        </div>
                    ) : chrome.header_html ? <div className="border-b border-slate-200 bg-sky-50/80"><div className="mx-auto max-w-6xl px-6 py-3 text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: chrome.header_html }} /></div> : null}
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="h-12 w-auto rounded-2xl object-contain" />
                            <div><div className="text-sm font-semibold">{brand}</div><div className="text-xs text-slate-500">{site.identity?.tagline ?? 'Modern editorial control'}</div></div>
                        </Link>
                        <nav className="hidden items-center gap-6 text-sm md:flex">
                            {menu.map((item) => <PublicMenuNode key={item.id} item={item} />)}
                            <Link href="/login" className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-950 hover:text-white">Admin</Link>
                        </nav>
                    </div>
                </header>
                <main>{children}</main>
                <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
                    <div className="mx-auto max-w-6xl px-6 py-12">
                        {footer && (footer.intro_title || footer.intro_body || footer.columns?.length || footer.bottom_text) ? (
                            <div className="space-y-8">
                                <div className="grid gap-8 lg:grid-cols-[1.15fr_1.85fr]">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-white">{footer.intro_title || brand}</h2>
                                        {footer.intro_body ? <p className="mt-3 text-sm leading-7 text-slate-400">{footer.intro_body}</p> : null}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        {(footer.columns ?? []).map((column, index) => (
                                            <div key={index}>
                                                {column.title ? <h3 className="text-base font-semibold text-white">{column.title}</h3> : null}
                                                <div className="mt-3 space-y-2 text-sm text-slate-400">
                                                    {lines(column.body).map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {footer.bottom_text ? <div className="border-t border-slate-800 pt-4 text-sm text-slate-500">{footer.bottom_text}</div> : null}
                            </div>
                        ) : chrome.footer_html ? <div className="atlas-public-footer prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: chrome.footer_html }} /> : <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end"><div><h2 className="text-2xl font-semibold text-white">{brand}</h2><p className="mt-3 max-w-2xl text-sm text-slate-400">{site.identity?.tagline ?? 'Atlas CMS te ayuda a publicar y estructurar contenido institucional con una administracion clara.'}</p></div><div className="text-sm text-slate-400 md:text-right"><p>Contenido, menus, media y publicaciones gestionadas desde Atlas CMS.</p></div></div>}
                    </div>
                </footer>
            </div>
        </>
    );
}
