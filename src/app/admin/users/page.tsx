
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UserCogIcon, PlusCircleIcon, Trash2Icon, EditIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserForm, type UserFormValues } from '@/components/admin/users/user-form';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Staff';
  status: 'Active' | 'Inactive';
}

// Initial mock data
const initialMockUsers: User[] = [
  { id: 'usr001', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'usr002', name: 'Bob Johnson', email: 'bob@example.com', role: 'Staff', status: 'Active' },
  { id: 'usr003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff', status: 'Inactive' },
  { id: 'usr004', name: 'Diana Prince', email: 'diana@example.com', role: 'Staff', status: 'Active' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialMockUsers);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const handleOpenUserForm = (user?: User) => {
    setEditingUser(user || null);
    setIsUserFormOpen(true);
  };

  const handleCloseUserForm = () => {
    setIsUserFormOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = (data: UserFormValues) => {
    if (editingUser) {
      // Edit existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data, id: editingUser.id } : u));
      toast({ title: "User Updated", description: `User ${data.name} has been updated successfully.` });
    } else {
      // Add new user
      const newUser: User = {
        ...data,
        id: `usr${Math.floor(Math.random() * 1000) + 100}`, // Simple ID generation
      };
      setUsers([...users, newUser]);
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
      setUserToDelete(null); // Close dialog by clearing userToDelete
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
            <CardDescription>List of all registered users and their roles.</CardDescription>
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
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenUserForm(user)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(user)}>
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found. Click "Add New User" to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
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
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
