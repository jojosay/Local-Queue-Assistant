
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { User } from '@/app/admin/users/page'; // Import User type

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Load registered users from localStorage on component mount
    try {
      const storedUsersRaw = localStorage.getItem('appUsers');
      if (storedUsersRaw) {
        const parsedUsers = JSON.parse(storedUsersRaw);
        if (Array.isArray(parsedUsers)) {
          setRegisteredUsers(parsedUsers);
        } else {
          setRegisteredUsers([]);
        }
      }
    } catch (error) {
      console.error("Failed to load registered users from localStorage:", error);
      setRegisteredUsers([]);
    }
  }, []);

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    // Clear previous session
    localStorage.removeItem('mockAuthToken');
    localStorage.removeItem('mockUserRole');
    localStorage.removeItem('mockUserEmail');
    localStorage.removeItem('mockUserOfficeId');
    localStorage.removeItem('mockUserOfficeName');

    let loginSuccessful = false;
    let userRole: User['role'] | null = null;
    let redirectPath = '/login'; // Default to login page on failure

    // Check hardcoded admin credentials
    if (values.email === 'admin@example.com' && values.password === 'password') {
      localStorage.setItem('mockAuthToken', 'admin-token');
      localStorage.setItem('mockUserRole', 'admin');
      localStorage.setItem('mockUserEmail', values.email);
      // No office for admin by default
      userRole = 'admin';
      redirectPath = '/admin/dashboard';
      loginSuccessful = true;
      toast({ title: 'Login Successful', description: 'Redirecting to admin dashboard...' });
    } 
    // Check hardcoded staff credentials
    else if (values.email === 'staff@example.com' && values.password === 'password') {
      localStorage.setItem('mockAuthToken', 'staff-token');
      localStorage.setItem('mockUserRole', 'staff');
      localStorage.setItem('mockUserEmail', values.email);
      localStorage.setItem('mockUserOfficeId', 'staff-office-001'); 
      localStorage.setItem('mockUserOfficeName', 'Staff Assigned Office (Default)');
      userRole = 'staff';
      redirectPath = '/staff/dashboard';
      loginSuccessful = true;
      toast({ title: 'Login Successful', description: 'Redirecting to staff dashboard...' });
    } 
    // Check registered users from localStorage
    else {
      const foundUser = registeredUsers.find(user => user.email === values.email);
      // For registered users, we'll also assume password is "password" for this mock
      if (foundUser && values.password === 'password') { 
        localStorage.setItem('mockAuthToken', `${foundUser.role.toLowerCase()}-token-${foundUser.id}`);
        localStorage.setItem('mockUserRole', foundUser.role);
        localStorage.setItem('mockUserEmail', foundUser.email);
        if (foundUser.officeId && foundUser.officeName) {
          localStorage.setItem('mockUserOfficeId', foundUser.officeId);
          localStorage.setItem('mockUserOfficeName', foundUser.officeName);
        }
        userRole = foundUser.role;
        redirectPath = foundUser.role === 'Admin' ? '/admin/dashboard' : '/staff/dashboard';
        loginSuccessful = true;
        toast({ title: 'Login Successful', description: `Redirecting to ${foundUser.role.toLowerCase()} dashboard...` });
      }
    }

    if (loginSuccessful) {
      router.push(redirectPath);
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
