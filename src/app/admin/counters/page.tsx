
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UsersIcon, PlusCircleIcon, Trash2Icon, EditIcon, StarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CounterForm, type CounterFormValues } from '@/components/admin/counters/counter-form';
import { useToast } from '@/hooks/use-toast';
import type { Office } from '@/app/admin/offices/page';

export interface Counter {
  id: string;
  name: string;
  officeId: string;
  officeName?: string;
  type: 'General' | 'Priority' | 'Specialized';
  priority: boolean;
  status: 'Open' | 'Closed';
}

export default function CountersPage() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [availableOffices, setAvailableOffices] = useState<Office[]>([]);
  const [isCounterFormOpen, setIsCounterFormOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [counterToDelete, setCounterToDelete] = useState<Counter | null>(null);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false); // Flag to track initial load

  useEffect(() => {
    let loadedCounters: Counter[] = [];
    try {
      const storedCountersRaw = localStorage.getItem('appCounters');
      if (storedCountersRaw) {
        const parsedCounters = JSON.parse(storedCountersRaw);
        if (Array.isArray(parsedCounters)) {
          loadedCounters = parsedCounters;
        } else {
          localStorage.setItem('appCounters', JSON.stringify([]));
        }
      } else {
        localStorage.setItem('appCounters', JSON.stringify([]));
      }
    } catch (error) {
      localStorage.setItem('appCounters', JSON.stringify([]));
    }
    setCounters(loadedCounters);

    // Load offices from localStorage
    let activeOffices: Office[] = [];
    try {
      const storedOfficesRaw = localStorage.getItem('appOffices');
      if (storedOfficesRaw) {
        const allOffices: Office[] = JSON.parse(storedOfficesRaw);
        if (Array.isArray(allOffices)) {
          activeOffices = allOffices.filter(o => o.status === 'Active');
        }
      }
    } catch (error) {
      console.error("Error loading offices for counters page:", error);
    }
    setAvailableOffices(activeOffices);
    setIsLoaded(true); // Mark initial load as complete
  }, []);

  useEffect(() => {
    if (isLoaded) { // Only persist after initial load
      localStorage.setItem('appCounters', JSON.stringify(counters));

      // Update counter count in offices
      const storedOfficesRaw = localStorage.getItem('appOffices');
      if (storedOfficesRaw) {
        try {
          let offices: Office[] = JSON.parse(storedOfficesRaw);
          if (Array.isArray(offices)) {
            offices = offices.map(office => ({
              ...office,
              counters: counters.filter(c => c.officeId === office.id).length
            }));
            localStorage.setItem('appOffices', JSON.stringify(offices));
          }
        } catch (error) {
            console.error("Error updating office counter counts:", error);
        }
      }
    }
  }, [counters, isLoaded]);


  const handleOpenCounterForm = (counter?: Counter) => {
    setEditingCounter(counter || null);
    setIsCounterFormOpen(true);
  };

  const handleCloseCounterForm = () => {
    setIsCounterFormOpen(false);
    setEditingCounter(null);
  };

  const handleSaveCounter = (data: CounterFormValues) => {
    const selectedOffice = availableOffices.find(o => o.id === data.officeId);
    const officeName = selectedOffice ? selectedOffice.name : 'Unknown Office';

    if (editingCounter) {
      setCounters(counters.map(c => c.id === editingCounter.id ? { ...editingCounter, ...data, officeName } : c));
      toast({ title: "Counter Updated", description: `Counter ${data.name} has been updated successfully.` });
    } else {
      const newCounter: Counter = {
        ...data,
        officeName,
        id: `ctr${Date.now()}${Math.floor(Math.random() * 100)}`,
      };
      setCounters(prevCounters => [...prevCounters, newCounter]);
      toast({ title: "Counter Added", description: `Counter ${data.name} has been added successfully.` });
    }
    handleCloseCounterForm();
  };

  const handleOpenDeleteDialog = (counter: Counter) => {
    setCounterToDelete(counter);
  };

  const handleConfirmDelete = () => {
    if (counterToDelete) {
      setCounters(counters.filter(c => c.id !== counterToDelete.id));
      toast({ title: "Counter Deleted", description: `Counter ${counterToDelete.name} has been deleted.` });
      setCounterToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Counter Management"
        description="Configure and manage service counters for all offices."
        icon={UsersIcon}
      />
       <Card className="shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">Service Counters</CardTitle>
            <CardDescription>List of all counters and their configurations.</CardDescription>
          </div>
          <Button onClick={() => handleOpenCounterForm()} disabled={availableOffices.length === 0}>
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Counter
          </Button>
           {availableOffices.length === 0 && (
            <p className="text-sm text-destructive">Please add active offices before adding counters.</p>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {counters.map((counter) => (
                <TableRow key={counter.id}>
                  <TableCell className="font-medium">{counter.id}</TableCell>
                  <TableCell>{counter.name}</TableCell>
                  <TableCell>{counter.officeName || counter.officeId}</TableCell>
                  <TableCell><Badge variant={counter.type === 'Priority' ? 'default' : 'secondary'}>{counter.type}</Badge></TableCell>
                  <TableCell className="text-center">
                    {counter.priority ? <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-400 inline" /> : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${counter.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}`}>
                      {counter.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenCounterForm(counter)} disabled={availableOffices.length === 0 && !editingCounter}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(counter)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {!isLoaded && counters.length === 0 && (
             <p className="text-center text-muted-foreground py-8">Loading counters...</p>
           )}
           {isLoaded && counters.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No counters found. Click "Add New Counter" to get started.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCounterFormOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseCounterForm(); else setIsCounterFormOpen(true); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCounter ? 'Edit Counter' : 'Add New Counter'}</DialogTitle>
            <DialogDescription>
              {editingCounter ? 'Update the details for this counter.' : 'Fill in the details for the new counter.'}
            </DialogDescription>
          </DialogHeader>
          <CounterForm
            onSubmit={handleSaveCounter}
            initialData={editingCounter}
            onCancel={handleCloseCounterForm}
            availableOffices={availableOffices}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!counterToDelete} onOpenChange={(isOpen) => {if(!isOpen) setCounterToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the counter
              "{counterToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCounterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Counter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminLayout>
  );
}

