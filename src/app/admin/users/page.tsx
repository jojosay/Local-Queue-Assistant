
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UserCogIcon, PlusCircleIcon, Trash2Icon, EditIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserForm, type UserSubmitValues } from '@/components/admin/users/user-form';
import { useToast } from '@/hooks/use-toast';
import type { Office } from '@/app/admin/offices/page';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  status: 'Active' | 'Inactive';
  officeId?: string;
  officeName?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [availableOffices, setAvailableOffices] = useState<Office[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false); // Flag to track initial load

  useEffect(() => {
    // Load users from localStorage
    let loadedUsers: User[] = [];
    try {
      const storedUsersRaw = localStorage.getItem('appUsers');
      console.log('USER MGMT PAGE: Raw from localStorage appUsers:', storedUsersRaw);
      if (storedUsersRaw) {
        const parsedUsers = JSON.parse(storedUsersRaw);
        if (Array.isArray(parsedUsers)) {
          loadedUsers = parsedUsers;
        } else {
          console.warn("'appUsers' in localStorage was not an array. Resetting localStorage for 'appUsers'.");
          localStorage.setItem('appUsers', JSON.stringify([])); 
        }
      } else {
        console.log("'appUsers' not found in localStorage. Initializing 'appUsers' in localStorage.");
        localStorage.setItem('appUsers', JSON.stringify([])); 
      }
    } catch (error) {
      console.error("Error processing 'appUsers' from localStorage. Resetting 'appUsers' in localStorage. Error:", error);
      localStorage.setItem('appUsers', JSON.stringify([])); 
    }
    console.log('USER MGMT PAGE: Setting users state to:', loadedUsers);
    setUsers(loadedUsers);

    // Load offices from localStorage
    const storedOffices = localStorage.getItem('appOffices');
    if (storedOffices) {
      try {
        const allOffices: Office[] = JSON.parse(storedOffices);
         if (Array.isArray(allOffices)) {
          setAvailableOffices(allOffices.filter(o => o.status === 'Active'));
        } else {
          console.warn("'appOffices' in localStorage was not an array. Setting availableOffices to empty.");
          setAvailableOffices([]);
        }
      } catch (e) {
        console.error("Failed to parse 'appOffices' from localStorage in UsersPage. Error:", e);
        setAvailableOffices([]);
      }
    } else {
      setAvailableOffices([]);
    }
    setIsLoaded(true); // Mark initial load as complete
  }, []);

  useEffect(() => {
    // Persist users to localStorage ONLY after initial load is complete
    if (isLoaded) {
        console.log('USER MGMT PAGE: Persisting users to localStorage:', users);
        localStorage.setItem('appUsers', JSON.stringify(users));
    }
  }, [users, isLoaded]);

  const handleOpenUserForm = (user?: User) => {
    setEditingUser(user || null);
    setIsUserFormOpen(true);
  };

  const handleCloseUserForm = () => {
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (data: UserSubmitValues) => {
    const selectedOffice = availableOffices.find(o => o.id === data.officeId);
    const officeName = data.officeId && selectedOffice ? selectedOffice.name : undefined;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...data, officeName, officeId: data.officeId } : u));
      toast({ title: "User Updated", description: `User ${data.name} has been updated successfully.` });
    } else {
      const newUser: User = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        officeId: data.officeId,
        officeName,
        id: `usr${Date.now()}${Math.floor(Math.random() * 100)}`,
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
      toast({ title: "User Added", description: `User ${data.name} has been added successfully.` });
    }
    handleCloseUserForm();
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast({ title: "User Deleted", description: `User ${userToDelete.name} has been deleted.` });
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="User Management" 
        description="Manage staff and administrator accounts."
        icon={UserCogIcon}
      />
       <Card className="shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">System Users</CardTitle>
            <CardDescription>List of all registered users, their roles, and assigned offices.</CardDescription>
          </div>
          <Button onClick={() => handleOpenUserForm()}>
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Office</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.officeName || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenUserForm(user)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(user)}>
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {!isLoaded && users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Loading users...</p>
           )}
           {isLoaded && users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found. Click "Add New User" to get started or register a new user.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isUserFormOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseUserForm(); else setIsUserFormOpen(true); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update the details for this user.' : 'Fill in the details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm 
            onSubmit={handleSaveUser} 
            initialData={editingUser} 
            onCancel={handleCloseUserForm}
            availableOffices={availableOffices}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => {if(!isOpen) setUserToDelete(null)}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for {userToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AdminLayout>
  );
}
