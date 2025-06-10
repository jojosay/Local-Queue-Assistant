
'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UsersIcon, PlusCircleIcon, Trash2Icon, EditIcon, StarIcon } from 'lucide-react'; // Using UsersIcon as a stand-in for counters
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CounterForm, type CounterFormValues } from '@/components/admin/counters/counter-form';
import { useToast } from '@/hooks/use-toast';

export interface Counter {
  id: string;
  name: string;
  office: string;
  type: 'General' | 'Priority' | 'Specialized';
  priority: boolean;
  status: 'Open' | 'Closed';
}

// Initial mock data
const initialMockCounters: Counter[] = [
  { id: 'ctr001', name: 'Counter 1', office: 'Main City Branch', type: 'General', priority: false, status: 'Open' },
  { id: 'ctr002', name: 'Counter 2', office: 'Main City Branch', type: 'Priority', priority: true, status: 'Open' },
  { id: 'ctr003', name: 'Counter 3', office: 'Main City Branch', type: 'Specialized', priority: false, status: 'Closed' },
  { id: 'ctr004', name: 'Service Desk A', office: 'North Suburb Office', type: 'General', priority: false, status: 'Open' },
];

export default function CountersPage() {
  const [counters, setCounters] = useState<Counter[]>(initialMockCounters);
  const [isCounterFormOpen, setIsCounterFormOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [counterToDelete, setCounterToDelete] = useState<Counter | null>(null);
  const { toast } = useToast();

  const handleOpenCounterForm = (counter?: Counter) => {
    setEditingCounter(counter || null);
    setIsCounterFormOpen(true);
  };

  const handleCloseCounterForm = () => {
    setIsCounterFormOpen(false);
    setEditingCounter(null);
  };

  const handleSaveCounter = (data: CounterFormValues) => {
    if (editingCounter) {
      // Edit existing counter
      setCounters(counters.map(c => c.id === editingCounter.id ? { ...editingCounter, ...data } : c));
      toast({ title: "Counter Updated", description: `Counter ${data.name} has been updated successfully.` });
    } else {
      // Add new counter
      const newCounter: Counter = {
        ...data,
        id: `ctr${Math.floor(Math.random() * 1000) + 100}`, // Simple ID generation
      };
      setCounters([...counters, newCounter]);
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
        icon={UsersIcon} // Still using UsersIcon as per original
      />
       <Card className="shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">Service Counters</CardTitle>
            <CardDescription>List of all counters and their configurations.</CardDescription>
          </div>
          <Button onClick={() => handleOpenCounterForm()}>
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New Counter
          </Button>
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
                  <TableCell>{counter.office}</TableCell>
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
                    <Button variant="outline" size="sm" onClick={() => handleOpenCounterForm(counter)}>
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
           {counters.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No counters found. Click "Add New Counter" to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Counter Form Dialog */}
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
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
