
'use client';

import React, { useState, useRef } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SettingsIcon, BuildingIcon, UsersIcon as CounterIcon, UserCogIcon, TvIcon, Trash2Icon, AlertTriangleIcon, FileDownIcon, FileUpIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const LOCALSTORAGE_KEYS_TO_MANAGE = ['appOffices', 'appCounters', 'appUsers', 'appQueue', 'nextTicketNumber'];
const LOCALSTORAGE_PREFIX_TO_MANAGE = 'appCurrentTicket-';

export default function AdminDashboardPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const clearApplicationData = () => {
    LOCALSTORAGE_KEYS_TO_MANAGE.forEach(key => localStorage.removeItem(key));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LOCALSTORAGE_PREFIX_TO_MANAGE)) {
        localStorage.removeItem(key);
      }
    }
  };

  const handleResetData = () => {
    try {
      clearApplicationData();
      toast({
        title: 'Application Data Reset',
        description: 'All transactional and configuration data has been cleared. User accounts remain if managed separately or if "appUsers" was not in LOCALSTORAGE_KEYS_TO_MANAGE.',
      });
    } catch (error) {
      console.error("Error resetting application data:", error);
      toast({
        variant: 'destructive',
        title: 'Error Resetting Data',
        description: 'Could not clear all application data. Check console for details.',
      });
    }
    setIsResetDialogOpen(false);
  };

  const handleExportData = () => {
    try {
      const dataToExport: { [key: string]: string | null } = {};
      LOCALSTORAGE_KEYS_TO_MANAGE.forEach(key => {
        dataToExport[key] = localStorage.getItem(key);
      });

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCALSTORAGE_PREFIX_TO_MANAGE)) {
          dataToExport[key] = localStorage.getItem(key);
        }
      }

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const SuffixDate = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `local_queue_data_${SuffixDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Data Exported', description: 'Application data has been downloaded.' });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export data.' });
    }
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/json') {
        setFileToImport(file);
        setIsImportDialogOpen(true);
      } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a valid JSON file.' });
        setFileToImport(null);
      }
    }
    // Reset file input to allow selecting the same file again if needed
    if (importFileInputRef.current) {
      importFileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (!fileToImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not a string.');
        }
        const importedData = JSON.parse(text);

        // Clear existing data first
        clearApplicationData();

        // Import new data
        Object.keys(importedData).forEach(key => {
          if (importedData[key] !== null && importedData[key] !== undefined) {
             // Ensure all managed keys are set from the file, even if they were not in LOCALSTORAGE_KEYS_TO_MANAGE or started with prefix
            localStorage.setItem(key, importedData[key]);
          } else {
            // If a key in the file has a null value, ensure it's removed from localStorage
            localStorage.removeItem(key);
          }
        });

        toast({
          title: 'Data Imported Successfully',
          description: 'Application data has been restored. Please refresh the page for changes to take full effect.',
        });
      } catch (error) {
        console.error("Error importing data:", error);
        toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not parse or import the JSON file. Ensure it is a valid export.' });
      } finally {
        setIsImportDialogOpen(false);
        setFileToImport(null);
      }
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
        setIsImportDialogOpen(false);
        setFileToImport(null);
    };
    reader.readAsText(fileToImport);
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
              <SettingsIcon className="h-7 w-7 text-primary" />
              <CardTitle className="font-headline text-xl">System Utilities</CardTitle>
            </div>
            <CardDescription>Perform system-wide actions. Use with caution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept=".json"
                ref={importFileInputRef}
                onChange={handleImportFileSelect}
                className="hidden"
                id="import-file-input"
              />
              <Button onClick={() => importFileInputRef.current?.click()} className="w-full mb-2" variant="outline">
                <FileUpIcon className="mr-2 h-4 w-4" /> Import Data from File
              </Button>
              <Button onClick={handleExportData} className="w-full" variant="outline">
                <FileDownIcon className="mr-2 h-4 w-4" /> Export Data to File
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Export current application data to a JSON file or import from a previously exported file. Import will overwrite existing data.
              </p>
            </div>
            <hr/>
            <div>
                <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                    <Trash2Icon className="mr-2 h-4 w-4" /> Reset Application Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete all offices, counters, current queue tickets, and reset ticket numbering from local storage.
                        <strong className="block mt-2">User accounts and their login credentials will NOT be affected if they are managed by a separate system or if 'appUsers' is not part of the reset routine.</strong>
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
                This will clear all non-user application data from local storage.
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isImportDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setIsImportDialogOpen(false); setFileToImport(null); }}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import data from "{fileToImport?.name}"?
              This will <strong className="text-destructive">overwrite all current application data</strong> (offices, counters, queues, etc.) with the contents of this file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsImportDialogOpen(false); setFileToImport(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} className="bg-primary hover:bg-primary/90">
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

