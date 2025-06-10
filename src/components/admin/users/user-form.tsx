
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { User } from '@/app/admin/users/page';
import type { Office } from '@/app/admin/offices/page';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';

const UNASSIGNED_OFFICE_VALUE = "__UNASSIGNED__";
const NO_OFFICES_DUMMY_VALUE = "__NO_OFFICES_DUMMY__";

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.enum(['Admin', 'Staff'], { required_error: 'Role is required.' }),
  status: z.enum(['Active', 'Inactive'], { required_error: 'Status is required.' }),
  officeId: z.string(), // Internally, officeId will be a string (actual ID or UNASSIGNED_OFFICE_VALUE)
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// This is the type the parent component (UsersPage) expects for submission
export type UserSubmitValues = Omit<UserFormValues, 'officeId'> & {
  officeId?: string;
};

interface UserFormProps {
  onSubmit: (values: UserSubmitValues) => void;
  initialData?: User | null;
  onCancel: () => void;
  availableOffices: Office[];
}

export function UserForm({ onSubmit, initialData, onCancel, availableOffices }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      role: initialData.role,
      status: initialData.status,
      officeId: initialData.officeId || UNASSIGNED_OFFICE_VALUE,
    } : {
      name: '',
      email: '',
      role: 'Staff',
      status: 'Active',
      officeId: UNASSIGNED_OFFICE_VALUE,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status,
        officeId: initialData.officeId || UNASSIGNED_OFFICE_VALUE,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        role: 'Staff',
        status: 'Active',
        officeId: UNASSIGNED_OFFICE_VALUE,
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: UserFormValues) => {
    const submissionValues: UserSubmitValues = {
      ...values,
      officeId: values.officeId === UNASSIGNED_OFFICE_VALUE ? undefined : values.officeId,
    };
    onSubmit(submissionValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="officeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Office (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an office" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_OFFICE_VALUE}>Unassigned / N/A</SelectItem>
                  {availableOffices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                   {availableOffices.length === 0 && (
                    <SelectItem value={NO_OFFICES_DUMMY_VALUE} disabled>No offices available to assign.</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">
            {initialData ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
