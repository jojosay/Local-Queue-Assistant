'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { SiteLogo } from '@/components/shared/site-logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { LayoutDashboardIcon, LogOutIcon, SettingsIcon, BuildingIcon, UsersIcon as CounterIcon, UserCogIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('mockAuthToken');
    const role = localStorage.getItem('mockUserRole');
    if (!token || role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the admin area.',
      });
      router.push('/login');
    }
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('mockAuthToken');
    localStorage.removeItem('mockUserRole');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  const menuItems = [
    { href: '/admin/dashboard', icon: SettingsIcon, label: 'Admin Dashboard' },
    { href: '/admin/offices', icon: BuildingIcon, label: 'Office Management' },
    { href: '/admin/counters', icon: CounterIcon, label: 'Counter Management' },
    { href: '/admin/users', icon: UserCogIcon, label: 'User Management' },
    { href: '/staff/dashboard', icon: LayoutDashboardIcon, label: 'Staff View' },
  ];


  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <SiteLogo />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} >
                    <Link href={item.href}>
                      <item.icon />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOutIcon className="h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-2 md:p-0 mb-4 md:hidden"> 
             <SidebarTrigger />
        </div>
        <main className="flex-1 p-4 md:p-8 bg-background rounded-lg md:m-2 md:shadow-sm">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
