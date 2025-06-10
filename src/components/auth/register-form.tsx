
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { User } from '@/app/admin/users/page';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay

    try {
      let users: User[] = [];
      const storedUsersRaw = localStorage.getItem('appUsers');
      console.log('REGISTER FORM: Raw from localStorage appUsers:', storedUsersRaw);

      if (storedUsersRaw) {
        try {
          const parsedUsers = JSON.parse(storedUsersRaw);
          if (Array.isArray(parsedUsers)) {
            users = parsedUsers;
          } else {
            console.warn("'appUsers' in localStorage was not an array. Starting new list for registration.");
            // `users` remains `[]` as initialized
          }
        } catch (parseError) {
          console.error("Failed to parse 'appUsers' from localStorage. Starting new list for registration. Error:", parseError);
          // `users` remains `[]` as initialized
        }
      }
      // At this point, `users` is guaranteed to be a User[] (possibly empty)

      if (users.some(user => user.email === values.email)) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: 'This email address is already registered.',
        });
        setIsLoading(false);
        return;
      }
      
      const newUser: User = {
        id: `usr${Date.now()}${Math.floor(Math.random() * 100)}`,
        name: values.name,
        email: values.email,
        role: 'Staff', 
        status: 'Active', 
      };

      users.push(newUser);
      console.log('REGISTER FORM: Attempting to save to localStorage appUsers:', JSON.stringify(users));
      localStorage.setItem('appUsers', JSON.stringify(users));

      toast({
        title: 'Registration Successful',
        description: 'You can now log in with your credentials.',
      });
      router.push('/login');

    } catch (error) {
      console.error("Error during user registration or saving to localStorage:", error);
      toast({
        variant: 'destructive',
        title: 'Registration Error',
        description: 'Could not save user data. Please try again.',
      });
    }
    
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Registering...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
