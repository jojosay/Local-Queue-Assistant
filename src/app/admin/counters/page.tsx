import { AdminLayout } from '@/components/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { UsersIcon } from 'lucide-react'; // Using UsersIcon as a stand-in for counters
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, StarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


// Mock data
const mockCounters = [
  { id: 'ctr001', name: 'Counter 1', office: 'Main City Branch', type: 'General', priority: false, status: 'Open' },
  { id: 'ctr002', name: 'Counter 2', office: 'Main City Branch', type: 'Priority', priority: true, status: 'Open' },
  { id: 'ctr003', name: 'Counter 3', office: 'Main City Branch', type: 'Specialized', priority: false, status: 'Closed' },
  { id: 'ctr004', name: 'Service Desk A', office: 'North Suburb Office', type: 'General', priority: false, status: 'Open' },
];


export default function CountersPage() {
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
          <Button disabled> {/* Disabled as it's a placeholder */}
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
              {mockCounters.map((counter) => (
                <TableRow key={counter.id}>
                  <TableCell className="font-medium">{counter.id}</TableCell>
                  <TableCell>{counter.name}</TableCell>
                  <TableCell>{counter.office}</TableCell>
                  <TableCell><Badge variant="secondary">{counter.type}</Badge></TableCell>
                  <TableCell className="text-center">
                    {counter.priority ? <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-400 inline" /> : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${counter.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}`}>
                      {counter.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" disabled>Edit</Button> {/* Disabled */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {mockCounters.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No counters found. Click "Add New Counter" to get started.</p>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-muted-foreground mt-6 text-sm">
        Full counter management functionality (add, edit, priority settings) is a placeholder.
      </p>
    </AdminLayout>
  );
}
