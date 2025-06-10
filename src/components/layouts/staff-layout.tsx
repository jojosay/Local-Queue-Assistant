'use client';

import React, { useEffect, useState } from 'react'; // Added useState
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added usePathname
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
import { LayoutDashboardIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null); // State for userRole

  useEffect(() => {
    const token = localStorage.getItem('mockAuthToken');
    const role = localStorage.getItem('mockUserRole');
    setUserRole(role); // Set userRole state
    if (!token || (role !== 'staff' && role !== 'admin')) { // Admin can also access staff dashboard
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Please log in as staff to access this page.',
      });
      router.push('/login');
    }
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem('mockAuthToken');
    localStorage.removeItem('mockUserRole');
    setUserRole(null); // Clear userRole state
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <SiteLogo />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/staff/dashboard'}>
                  <Link href="/staff/dashboard">
                    <LayoutDashboardIcon />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Add more staff links here if needed */}
              {userRole === 'admin' && (
                 <>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/admin/dashboard'}>
                        <Link href="/admin/dashboard">
                            <SettingsIcon />
                            Admin Panel
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </>
              )}
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
        <div className="p-2 md:p-0 mb-4 md:hidden"> {/* Only show trigger on mobile */}
             <SidebarTrigger />
        </div>
        <main className="flex-1 p-4 md:p-8 bg-background rounded-lg md:m-2 md:shadow-sm">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
