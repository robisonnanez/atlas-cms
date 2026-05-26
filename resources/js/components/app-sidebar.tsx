import { Link, usePage } from '@inertiajs/react';
import { BookOpenText, FilePlus2, FileText, FolderKanban, Images, LayoutGrid, LayoutTemplate, PenSquare, Plug, ScrollText, Settings2, Tags } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Pages',
        href: '/admin/pages',
        icon: FileText,
        permission: 'atlas.pages.view',
    },
    {
        title: 'New page',
        href: '/admin/pages/create',
        icon: FilePlus2,
        permission: 'atlas.pages.create',
    },
    {
        title: 'Posts',
        href: '/admin/posts',
        icon: ScrollText,
        permission: 'atlas.posts.view',
    },
    {
        title: 'New post',
        href: '/admin/posts/create',
        icon: PenSquare,
        permission: 'atlas.posts.create',
    },
    {
        title: 'Taxonomies',
        href: '/admin/categories',
        icon: Tags,
        permission: 'atlas.taxonomies.view',
    },
    {
        title: 'Media',
        href: '/admin/media',
        icon: Images,
        permission: 'atlas.media.view',
    },
    {
        title: 'Menus',
        href: '/admin/menus',
        icon: FolderKanban,
        permission: 'atlas.menus.view',
    },
    {
        title: 'Themes',
        href: '/admin/themes',
        icon: LayoutTemplate,
        permission: 'atlas.themes.view',
    },
    {
        title: 'Plugins',
        href: '/admin/plugins',
        icon: Plug,
        permission: 'atlas.plugins.view',
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings2,
        permission: 'atlas.settings.view',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'View site',
        href: '/',
        icon: BookOpenText,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const permissions = new Set(auth.permissions ?? []);
    const visibleItems = mainNavItems.filter((item) => !item.permission || permissions.has(item.permission));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
