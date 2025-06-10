import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UserCogIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockUsers = [
  { id: 'usr001', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'usr002', name: 'Bob Johnson', email: 'bob@example.com', role: 'Staff', status: 'Active' },
  { id: 'usr003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Staff', status: 'Inactive' },
  { id: 'usr004', name: 'Diana Prince', email: 'diana@example.com', role: 'Staff', status: 'Active' },
];

export default function UsersPage() {
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
          <Button disabled> {/* Disabled as it's a placeholder */}
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
              {mockUsers.map((user) => (
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
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled className="mr-2">Edit</Button> {/* Disabled */}
                    <Button variant="ghost" size="sm" disabled className="text-destructive hover:text-destructive">Delete</Button> {/* Disabled */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {mockUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found. Click "Add New User" to get started.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-muted-foreground mt-6 text-sm">
        Full user management functionality (add, edit roles, delete) is a placeholder.
      </p>
    </AdminLayout>
  );
}
