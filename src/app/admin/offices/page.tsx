import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { BuildingIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data
const mockOffices = [
  { id: 'off001', name: 'Main City Branch', address: '123 Main St, Anytown', counters: 5, status: 'Active' },
  { id: 'off002', name: 'North Suburb Office', address: '456 North Rd, Suburbia', counters: 3, status: 'Active' },
  { id: 'off003', name: 'Westside Kiosk', address: '789 West Ave, Westville', counters: 1, status: 'Inactive' },
];

export default function OfficesPage() {
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
          <Button disabled> {/* Disabled as it's a placeholder */}
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
              {mockOffices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell className="font-medium">{office.id}</TableCell>
                  <TableCell>{office.name}</TableCell>
                  <TableCell>{office.address}</TableCell>
                  <TableCell className="text-center">{office.counters}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${office.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                      {office.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button> {/* Disabled */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {mockOffices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No offices found. Click "Add New Office" to get started.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-muted-foreground mt-6 text-sm">
        Full office management functionality (add, edit, delete) is a placeholder.
      </p>
    </AdminLayout>
  );
}
