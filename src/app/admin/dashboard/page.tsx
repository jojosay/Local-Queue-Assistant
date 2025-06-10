
'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SettingsIcon, BuildingIcon, UsersIcon as CounterIcon, UserCogIcon, TvIcon, Trash2Icon, AlertTriangleIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleResetData = () => {
    try {
      // Keys to remove directly
      const keysToRemove = ['appOffices', 'appCounters', 'appQueue', 'nextTicketNumber'];
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Keys to remove by prefix
      const prefixToRemove = 'appCurrentTicket-';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefixToRemove)) {
          localStorage.removeItem(key);
        }
      }

      toast({
        title: 'Application Data Reset',
        description: 'All transactional data has been cleared. User accounts remain.',
      });
    } catch (error) {
      console.error("Error resetting application data:", error);
      toast({
        variant: 'destructive',
        title: 'Error Resetting Data',
        description: 'Could not clear all application data. Check console for details.',
      });
    }
    setIsResetDialogOpen(false); // Close the dialog
  };


  return (
    <AdminLayout>
      <PageHeader 
        title="Administrator Dashboard" 
        description="Manage system settings, offices, counters, and staff."
        icon={SettingsIcon}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in">
        <FeatureCard
          title="Office Management"
          description="Add, edit, or remove office locations."
          icon={BuildingIcon}
          linkHref="/admin/offices"
          linkText="Manage Offices"
        />
        <FeatureCard
          title="Counter Management"
          description="Configure counters for each office, including priority settings."
          icon={CounterIcon}
          linkHref="/admin/counters"
          linkText="Manage Counters"
        />
        <FeatureCard
          title="User Management"
          description="Manage staff and administrator accounts."
          icon={UserCogIcon}
          linkHref="/admin/users"
          linkText="Manage Users"
        />
        <FeatureCard
          title="Live Queue Display"
          description="View current ticket queues for all active offices."
          icon={TvIcon}
          linkHref="/display"
          linkText="View Display"
        />

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Trash2Icon className="h-7 w-7 text-destructive" />
              <CardTitle className="font-headline text-xl text-destructive">System Utilities</CardTitle>
            </div>
            <CardDescription>Perform system-wide actions. Use with caution.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangleIcon className="mr-2 h-4 w-4" /> Reset Application Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all offices, counters, current queue tickets, and reset ticket numbering. 
                    <strong className="block mt-2">User accounts and their login credentials will NOT be affected.</strong>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetData}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, Reset Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="mt-2 text-xs text-muted-foreground">
              This will clear all offices, counters, and ticket data from local storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  linkHref: string;
  linkText: string;
  disabled?: boolean;
}

function FeatureCard({ title, description, icon: Icon, linkHref, linkText, disabled = false }: FeatureCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-7 w-7 text-primary" />
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" disabled={disabled}>
          <Link href={disabled ? '#' : linkHref} target={linkHref === "/display" ? "_blank" : undefined} rel={linkHref === "/display" ? "noopener noreferrer" : undefined}>{linkText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
