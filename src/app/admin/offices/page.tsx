
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { BuildingIcon, PlusCircleIcon, Trash2Icon, EditIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OfficeForm, type OfficeFormValues } from '@/components/admin/offices/office-form';
import { useToast } from '@/hooks/use-toast';

export interface Office {
  id: string;
  name: string;
  address: string;
  counters: number;
  status: 'Active' | 'Inactive';
}

// Minimal interface for Counter needed for cascading delete logic
interface Counter {
  id: string;
  officeId: string;
  // other counter properties aren't strictly needed here but might exist
}


export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isOfficeFormOpen, setIsOfficeFormOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [officeToDelete, setOfficeToDelete] = useState<Office | null>(null);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false); // Flag to track initial load

  useEffect(() => {
    let loadedOffices: Office[] = [];
    try {
      const storedOfficesRaw = localStorage.getItem('appOffices');
      if (storedOfficesRaw) {
        const parsedOffices = JSON.parse(storedOfficesRaw);
        if (Array.isArray(parsedOffices)) {
          loadedOffices = parsedOffices;
        } else {
          localStorage.setItem('appOffices', JSON.stringify([]));
        }
      } else {
        localStorage.setItem('appOffices', JSON.stringify([]));
      }
    } catch (error) {
      localStorage.setItem('appOffices', JSON.stringify([]));
    }
    setOffices(loadedOffices);
    setIsLoaded(true); // Mark initial load as complete
  }, []);

  useEffect(() => {
    if (isLoaded) { // Only persist after initial load
      localStorage.setItem('appOffices', JSON.stringify(offices));
    }
  }, [offices, isLoaded]);


  const handleOpenOfficeForm = (office?: Office) => {
    setEditingOffice(office || null);
    setIsOfficeFormOpen(true);
  };

  const handleCloseOfficeForm = () => {
    setIsOfficeFormOpen(false);
    setEditingOffice(null);
  };

  const handleSaveOffice = (data: OfficeFormValues) => {
    if (editingOffice) {
      setOffices(offices.map(o => o.id === editingOffice.id ? { ...editingOffice, ...data, counters: editingOffice.counters } : o));
      toast({ title: "Office Updated", description: `Office ${data.name} has been updated successfully.` });
    } else {
      const newOffice: Office = {
        ...data,
        id: `off${Date.now()}${Math.floor(Math.random() * 100)}`,
        counters: 0,
      };
      setOffices(prevOffices => [...prevOffices, newOffice]);
      toast({ title: "Office Added", description: `Office ${data.name} has been added successfully.` });
    }
    handleCloseOfficeForm();
  };

  const handleOpenDeleteDialog = (office: Office) => {
    setOfficeToDelete(office);
  };

  const handleConfirmDelete = () => {
    if (officeToDelete) {
      setOffices(offices.filter(o => o.id !== officeToDelete.id));
      // Also remove counters associated with this office
      const storedCountersRaw = localStorage.getItem('appCounters');
      if (storedCountersRaw) {
        try {
            const counters: Counter[] = JSON.parse(storedCountersRaw);
            if (Array.isArray(counters)) {
                const updatedCounters = counters.filter(c => c.officeId !== officeToDelete.id);
                localStorage.setItem('appCounters', JSON.stringify(updatedCounters));
            }
        } catch (error) {
            console.error("Error processing 'appCounters' for deletion:", error);
        }
      }
      toast({ title: "Office Deleted", description: `Office ${officeToDelete.name} has been deleted.` });
      setOfficeToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Office Management"
        description="View, add, and manage office locations."
        icon={BuildingIcon}
      />
      <Card className="shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">Office Locations</CardTitle>
            <CardDescription>A list of all registered offices in the system.</CardDescription>
          </div>
          <Button onClick={() => handleOpenOfficeForm()}>
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Office
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-center">Counters</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.id}</TableCell>
                  <TableCell>{office.name}</TableCell>
                  <TableCell>{office.address}</TableCell>
                  <TableCell className="text-center">{office.counters}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${office.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {office.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenOfficeForm(office)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(office)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {!isLoaded && offices.length === 0 && (
             <p className="text-center text-muted-foreground py-8">Loading offices...</p>
           )}
           {isLoaded && offices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No offices found. Click "Add New Office" to get started.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOfficeFormOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseOfficeForm(); else setIsOfficeFormOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOffice ? 'Edit Office' : 'Add New Office'}</DialogTitle>
            <DialogDescription>
              {editingOffice ? 'Update the details for this office.' : 'Fill in the details for the new office.'}
            </DialogDescription>
          </DialogHeader>
          <OfficeForm
            onSubmit={handleSaveOffice}
            initialData={editingOffice}
            onCancel={handleCloseOfficeForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!officeToDelete} onOpenChange={(isOpen) => {if(!isOpen) setOfficeToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the office
              "{officeToDelete?.name}". Related counters and staff assignments may also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOfficeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Office
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminLayout>
  );
}
