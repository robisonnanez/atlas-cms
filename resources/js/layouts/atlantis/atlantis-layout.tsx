import { logout } from '@/routes';
import profile from '@/routes/profile';
import security from '@/routes/security';
import { Link, router, usePage } from '@inertiajs/react';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import type { MenuItem as PrimeMenuItem } from 'primereact/menuitem';
import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavItem = { id: number; label: string; href: string; icon?: string | null; children?: NavItem[] };
type PageProps = {
    auth: { user?: { name?: string; avatar?: string | null; profile_photo_url?: string | null } };
    navigation?: NavItem[];
    sidebarOpen?: boolean;
    locale?: { current?: string; available?: Array<{ label?: string; value: string }> };
};

const localeMeta = {
    es: { label: 'Español', short: 'ES' },
    en: { label: 'English', short: 'EN' },
} as const;

function LocaleFlag({ locale }: { locale: 'es' | 'en' }) {
    return <span className={`atlas-locale-flag atlas-locale-flag-${locale}`} aria-hidden="true" />;
}

function userInitials(name: string): string {
    const chunks = name.trim().split(/\s+/).filter(Boolean);
    if (!chunks.length) return 'U';
    if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase();
    return `${chunks[0][0] ?? ''}${chunks[1][0] ?? ''}`.toUpperCase();
}

function matchesPath(currentPath: string, href: string): boolean {
    const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '') || '/';
    if (normalizedHref === '#' || normalizedHref === '') return false;
    if (normalizedHref === '/dashboard') return normalizedCurrent === normalizedHref;
    return normalizedCurrent === normalizedHref || normalizedCurrent.startsWith(`${normalizedHref}/`);
}

function containsActive(item: NavItem, currentPath: string): boolean {
    if (matchesPath(currentPath, item.href)) return true;
    return item.children?.some((child) => containsActive(child, currentPath)) ?? false;
}

function persistSidebarState(value: boolean) {
    if (typeof document === 'undefined') return;
    document.cookie = `sidebar_state=${value ? 'true' : 'false'}; path=/; max-age=31536000; samesite=lax`;
}

function MenuNode({ item, currentPath }: { item: NavItem; currentPath: string }) {
    const hasChildren = !!item.children?.length;
    const isActive = matchesPath(currentPath, item.href);
    const childActive = item.children?.some((child) => containsActive(child, currentPath)) ?? false;
    const [open, setOpen] = useState(childActive);

    useEffect(() => {
        if (childActive) setOpen(true);
    }, [childActive]);

    return (
        <li className="atlantis-menu-node">
            {hasChildren ? (
                <button type="button" className={`atlantis-menu-item atlantis-menu-parent ${childActive ? 'atlantis-active' : ''}`} onClick={() => setOpen((value) => !value)}>
                    <span className="atlantis-menu-left">
                        {item.icon && <i className={item.icon} />}
                        <span>{item.label}</span>
                    </span>
                    <i className={`pi ${open ? 'pi-chevron-down' : 'pi-chevron-right'} atlantis-menu-caret`} />
                </button>
            ) : (
                <Link href={item.href} className={`atlantis-menu-item ${isActive ? 'atlantis-active' : ''}`}>
                    <span className="atlantis-menu-left">
                        {item.icon && <i className={item.icon} />}
                        <span>{item.label}</span>
                    </span>
                </Link>
            )}
            {hasChildren && open ? <ul className="atlantis-submenu">{item.children!.map((child) => <MenuNode key={child.id} item={child} currentPath={currentPath} />)}</ul> : null}
        </li>
    );
}

export default function AtlantisLayout({ children }: PropsWithChildren) {
    const page = usePage<PageProps>();
    const { t } = useAtlasLocale();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(page.props.sidebarOpen ?? true);
    const userMenuRef = useRef<Menu>(null);
    const localeMenuRef = useRef<Menu>(null);
    const username = page.props.auth.user?.name ?? t('Usuario', 'User');
    const avatarImageValue = page.props.auth.user?.avatar ?? page.props.auth.user?.profile_photo_url ?? null;
    const hasAvatarImage = typeof avatarImageValue === 'string' && avatarImageValue.trim() !== '' && avatarImageValue.trim().toLowerCase() !== 'null';
    const avatarImage = hasAvatarImage ? avatarImageValue : undefined;
    const avatarLabel = userInitials(username);
    const navigation = page.props.navigation ?? [];
    const currentPath = page.url.split('?')[0];
    const currentLocale = (page.props.locale?.current ?? 'es') as 'es' | 'en';
    const locales = page.props.locale?.available ?? [{ label: 'Español', value: 'es' }, { label: 'English', value: 'en' }];

    useEffect(() => {
        setDesktopOpen(page.props.sidebarOpen ?? true);
    }, [page.props.sidebarOpen]);

    const breadcrumbs = useMemo(() => {
        const path = currentPath.replace(/\/$/, '');
        if (path.startsWith('/admin/pages/create')) return [t('Páginas', 'Pages'), t('Nueva página', 'New page')];
        if (path.startsWith('/admin/pages/')) return [t('Páginas', 'Pages'), t('Editar página', 'Edit page')];
        if (path === '/admin/pages') return [t('Páginas', 'Pages'), t('Listado', 'List')];
        if (path.startsWith('/admin/posts/create')) return [t('Entradas', 'Posts'), t('Nueva entrada', 'New post')];
        if (path.startsWith('/admin/posts/')) return [t('Entradas', 'Posts'), t('Editar entrada', 'Edit post')];
        if (path === '/admin/posts') return [t('Entradas', 'Posts'), t('Listado', 'List')];
        if (path.startsWith('/admin/categories')) return [t('Contenido', 'Content'), t('Taxonomías', 'Taxonomies')];
        if (path.startsWith('/admin/media')) return [t('Contenido', 'Content'), t('Media', 'Media')];
        if (path.startsWith('/admin/menus')) return [t('Contenido', 'Content'), t('Menús', 'Menus')];
        if (path.startsWith('/admin/themes')) return [t('Sistema', 'System'), t('Temas', 'Themes')];
        if (path.startsWith('/admin/plugins')) return [t('Sistema', 'System'), t('Plugins', 'Plugins')];
        if (path.startsWith('/admin/settings')) return [t('Sistema', 'System'), t('Configuración', 'Settings')];
        if (path.startsWith('/admin/users')) return [t('Administración', 'Admin'), t('Usuarios', 'Users')];
        if (path.startsWith('/admin/roles-permissions')) return [t('Administración', 'Admin'), t('Roles y permisos', 'Roles & permissions')];
        if (path.startsWith('/admin/users-permissions')) return [t('Administración', 'Admin'), t('Permisos por usuario', 'User permissions')];
        if (path.startsWith('/admin/navigation-management')) return [t('Administración', 'Admin'), t('Módulos y menús', 'Modules & menus')];
        if (path.startsWith('/settings/security')) return [t('Configuración', 'Settings'), t('Seguridad', 'Security')];
        return [t('Dashboard', 'Dashboard')];
    }, [currentPath, t]);

    const avatarMenuItems: PrimeMenuItem[] = [
        { label: t('Perfil', 'Profile'), icon: 'pi pi-user', command: () => router.visit(profile.edit.url()) },
        { label: t('Seguridad', 'Security'), icon: 'pi pi-cog', command: () => router.visit(security.edit.url()) },
        { label: t('Cerrar sesión', 'Sign out'), icon: 'pi pi-sign-out', command: () => router.post(logout.url()) },
    ];

    const localeMenuItems: PrimeMenuItem[] = locales.map((locale) => ({
        label: locale.value === 'es' ? 'ES ? Español' : 'EN - English',
        command: () => router.post('/locale', { locale: locale.value }, { preserveScroll: true, preserveState: true }),
    }));

    const toggleSidebar = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
            const next = !desktopOpen;
            setDesktopOpen(next);
            persistSidebarState(next);
            return;
        }

        setMobileOpen((value) => !value);
    };

    return (
        <div className="atlantis-theme min-h-screen">
            <div className="atlantis-shell">
                <aside className={`atlantis-sidebar ${mobileOpen ? 'atlantis-open' : ''} ${desktopOpen ? '' : 'atlantis-sidebar-collapsed'}`}>
                    <div className="atlantis-sidebar-brand">
                        <Link href="/dashboard" className="atlantis-brand-wrap" aria-label="Atlas CMS dashboard">
                            <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="atlantis-brand-logo" />
                        </Link>
                    </div>
                    <nav>
                        <ul className="atlantis-menu">{navigation.map((item) => <MenuNode key={item.id} item={item} currentPath={currentPath} />)}</ul>
                    </nav>
                </aside>

                <div className="atlantis-main">
                    <header className="atlantis-topbar">
                        <div className="atlantis-topbar-left">
                            <Button type="button" className="atlantis-toggle p-button-text" icon="pi pi-bars" onClick={toggleSidebar} />
                            <div className="atlantis-breadcrumbs">
                                {breadcrumbs.map((crumb, index) => (
                                    <span key={`${crumb}-${index}`} className="atlantis-breadcrumb-item">
                                        {index > 0 ? <span className="atlantis-breadcrumb-sep">/</span> : null}
                                        {crumb}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="atlantis-topbar-right gap-3">
                            <button type="button" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#0b2347] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12305f]" onClick={(event) => localeMenuRef.current?.toggle(event)} aria-label={t('Cambiar idioma', 'Change language')}>
                                <LocaleFlag locale={currentLocale} />
                                <span>{localeMeta[currentLocale]?.short ?? currentLocale.toUpperCase()}</span>
                                <i className="pi pi-chevron-down text-xs" />
                            </button>
                            <Menu model={localeMenuItems} popup ref={localeMenuRef} />

                            <button type="button" className="atlantis-avatar-button" onClick={(event) => userMenuRef.current?.toggle(event)}>
                                <Avatar image={avatarImage} label={hasAvatarImage ? undefined : avatarLabel} className="bg-slate-500 text-white font-semibold" shape="circle" />
                            </button>
                            <Menu model={avatarMenuItems} popup ref={userMenuRef} />
                        </div>
                    </header>

                    <main className="atlantis-content" onClick={() => setMobileOpen(false)}>
                        {children}
                    </main>
                </div>
            </div>

            {mobileOpen ? <button type="button" className="atlantis-overlay" onClick={() => setMobileOpen(false)} aria-label={t('Cerrar navegación', 'Close navigation')} /> : null}
        </div>
    );
}
