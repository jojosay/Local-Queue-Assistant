
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SettingsIcon, BuildingIcon, UsersIcon as CounterIcon, UserCogIcon, TvIcon, Trash2Icon, AlertTriangleIcon, FileDownIcon, FileUpIcon, DatabaseBackupIcon, InfoIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Office } from '@/app/admin/offices/page';

const LOCALSTORAGE_KEYS_TO_MANAGE = ['appOffices', 'appCounters', 'appUsers', 'appQueue', 'nextTicketNumber'];
const LOCALSTORAGE_PREFIX_TO_MANAGE = 'appCurrentTicket-';

export default function AdminDashboardPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDataMissing, setIsDataMissing] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [activeOfficeCount, setActiveOfficeCount] = useState(0);

  useEffect(() => {
    // Check for missing essential data after a short delay to ensure localStorage is accessible
    const timer = setTimeout(() => {
      try {
        const storedOfficesRaw = localStorage.getItem('appOffices');
        const offices: Office[] = storedOfficesRaw ? JSON.parse(storedOfficesRaw) : [];
        if (!Array.isArray(offices) || offices.length === 0) {
          setIsDataMissing(true);
        }
        setActiveOfficeCount(offices.filter(o => o.status === 'Active').length);
      } catch (e) {
        // If parsing fails, it's likely corrupt or missing
        setIsDataMissing(true);
        setActiveOfficeCount(0);
      }
      setIsInitialLoadComplete(true);
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, []);


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
        description: 'All transactional and configuration data has been cleared. User accounts remain.',
      });
      setIsDataMissing(true); // After reset, data is missing
      setActiveOfficeCount(0);
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

        clearApplicationData();

        Object.keys(importedData).forEach(key => {
          if (importedData[key] !== null && importedData[key] !== undefined && typeof importedData[key] === 'string') {
            localStorage.setItem(key, importedData[key]);
          } else if (typeof importedData[key] === 'object' && importedData[key] !== null) {
            localStorage.setItem(key, JSON.stringify(importedData[key]));
          } else if (importedData[key] === null) {
             localStorage.removeItem(key);
          }
        });

        toast({
          title: 'Data Imported Successfully',
          description: 'Application data has been restored. Please refresh the page for changes to take full effect.',
        });
        setIsDataMissing(false); // Data is no longer missing
        // Re-check office count after import
        const storedOfficesRaw = localStorage.getItem('appOffices');
        const offices: Office[] = storedOfficesRaw ? JSON.parse(storedOfficesRaw) : [];
        setActiveOfficeCount(Array.isArray(offices) ? offices.filter(o => o.status === 'Active').length : 0);

      } catch (error) {
        console.error("Error importing data:", error);
        toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not parse or import the JSON file. Ensure it is a valid export.' });
      } finally {
        setIsImportDialogOpen(false);
        setFileToImport(null);
         // A full page reload might be good here to ensure all components pick up new data
        window.location.reload();
      }
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
        setIsImportDialogOpen(false);
        setFileToImport(null);
    };
    reader.readAsText(fileToImport);
  };


  if (!isInitialLoadComplete) {
    return (
      <AdminLayout>
        <PageHeader
          title="Administrator Dashboard"
          description="Manage system settings, offices, counters, and staff."
          icon={SettingsIcon}
        />
        <div className="flex justify-center items-center h-64">
          <DatabaseBackupIcon className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-xl">Loading dashboard & checking data status...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Administrator Dashboard"
        description="Manage system settings, offices, counters, and staff."
        icon={SettingsIcon}
      />

      {isDataMissing && (
        <Card className="mb-8 border-primary bg-primary/5 animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <InfoIcon className="h-7 w-7 text-primary" />
              <CardTitle className="font-headline text-xl text-primary">Application Data May Be Missing</CardTitle>
            </div>
            <CardDescription>
              It looks like there's no office data configured, or it might have been cleared.
              If you have a backup file, you can import it to restore your settings, including offices, counters, users, and ticket queues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => importFileInputRef.current?.click()} className="w-full md:w-auto">
              <FileUpIcon className="mr-2 h-4 w-4" /> Import Data from Backup File
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              If this is a fresh setup, you can start by adding offices.
            </p>
          </CardContent>
        </Card>
      )}

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
          disabled={activeOfficeCount === 0 && !isDataMissing} // Disable if no active offices, unless data is missing (then import is primary)
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
          disabled={activeOfficeCount === 0 && !isDataMissing}
        />

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <DatabaseBackupIcon className="h-7 w-7 text-primary" />
              <CardTitle className="font-headline text-xl">Data Utilities</CardTitle>
            </div>
            <CardDescription>Manage application data. Export creates a backup. Import overwrites current data with file content.</CardDescription>
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
                Export includes offices, counters, users, current ticket queues, and ticket numbering.
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
                        <strong className="block mt-2">Registered user accounts (from the 'User Management' page) and their login credentials will NOT be affected.</strong>
                        This cannot be undone. Consider exporting your data first.
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
                  This clears operational data. User accounts are preserved.
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
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-7 w-7 ${disabled ? 'text-muted-foreground': 'text-primary'}`} />
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full" disabled={disabled}>
          <Link 
            href={disabled ? '#' : linkHref} 
            target={linkHref === "/display" ? "_blank" : undefined} 
            rel={linkHref === "/display" ? "noopener noreferrer" : undefined}
            aria-disabled={disabled}
            onClick={(e) => disabled && e.preventDefault()}
          >
            {linkText}
          </Link>
        </Button>
         {disabled && title === "Counter Management" && <p className="text-xs text-muted-foreground mt-2">Add an active office first to manage counters.</p>}
         {disabled && title === "Live Queue Display" && <p className="text-xs text-muted-foreground mt-2">Add an active office first to view the display.</p>}
      </CardContent>
    </Card>
  );
}

