
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Counter } from '@/app/admin/counters/page';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';

const counterFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  office: z.string().min(2, { message: 'Office name must be at least 2 characters.'}),
  type: z.enum(['General', 'Priority', 'Specialized'], { required_error: 'Counter type is required.' }),
  priority: z.boolean().default(false),
  status: z.enum(['Open', 'Closed'], { required_error: 'Status is required.' }),
});

export type CounterFormValues = z.infer<typeof counterFormSchema>;

interface CounterFormProps {
  onSubmit: (values: CounterFormValues) => void;
  initialData?: Counter | null;
  onCancel: () => void;
}

export function CounterForm({ onSubmit, initialData, onCancel }: CounterFormProps) {
  const form = useForm<CounterFormValues>({
    resolver: zodResolver(counterFormSchema),
    defaultValues: initialData || {
      name: '',
      office: '',
      type: 'General',
      priority: false,
      status: 'Open',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        name: '',
        office: '',
        type: 'General',
        priority: false,
        status: 'Open',
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: CounterFormValues) => {
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
              <FormLabel>Counter Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Counter 1, Information Desk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="office"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office / Branch</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Branch, Downtown Office" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Counter Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Priority">Priority</SelectItem>
                  <SelectItem value="Specialized">Specialized</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Priority Counter</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
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
            {initialData ? 'Save Changes' : 'Create Counter'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
