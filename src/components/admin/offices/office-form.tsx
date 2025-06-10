
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Office } from '@/app/admin/offices/page';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';

const officeFormSchema = z.object({
  name: z.string().min(2, { message: 'Office name must be at least 2 characters.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.'}),
  status: z.enum(['Active', 'Inactive'], { required_error: 'Status is required.' }),
});

export type OfficeFormValues = z.infer<typeof officeFormSchema>;

interface OfficeFormProps {
  onSubmit: (values: OfficeFormValues) => void;
  initialData?: Office | null;
  onCancel: () => void;
}

export function OfficeForm({ onSubmit, initialData, onCancel }: OfficeFormProps) {
  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(officeFormSchema),
    defaultValues: initialData ? {
        name: initialData.name,
        address: initialData.address,
        status: initialData.status,
    } : {
      name: '',
      address: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address,
        status: initialData.status,
      });
    } else {
      form.reset({
        name: '',
        address: '',
        status: 'Active',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: OfficeFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Branch, Downtown Office" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., 123 Main St, Anytown, ST 12345" {...field} />
              </FormControl>
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
                    <SelectValue placeholder="Select status" />
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
            {initialData ? 'Save Changes' : 'Create Office'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
