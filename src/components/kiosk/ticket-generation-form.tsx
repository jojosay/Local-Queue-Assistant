'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

interface Office {
  id: string;
  name: string;
}

interface TicketGenerationFormProps {
  offices: Office[];
}

const ticketFormSchema = z.object({
  officeId: z.string().min(1, { message: 'Please select a service or office.' }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export function TicketGenerationForm({ offices }: TicketGenerationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);


  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      officeId: '',
    },
  });

  // Mock ticket generation
  async function onSubmit(values: TicketFormValues) {
    setIsLoading(true);
    setGeneratedTicket(null);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    const selectedOffice = offices.find(o => o.id === values.officeId);
    const prefix = selectedOffice ? selectedOffice.name.substring(0, 1).toUpperCase() : 'T';
    const ticketNumber = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    
    setGeneratedTicket(ticketNumber);
    setIsLoading(false);
    toast({
      title: 'Ticket Generated!',
      description: `Your ticket number is ${ticketNumber}.`,
    });
    form.reset(); // Reset form after successful generation
  }

  if (generatedTicket) {
    return (
      <Card className="text-center animate-fade-in bg-primary/10 border-primary">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Your Ticket</CardTitle>
          <CardDescription>Please wait for your number to be called.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-6xl font-bold text-primary">{generatedTicket}</p>
          <p className="text-muted-foreground">Issued at: {currentTime || 'Loading time...'}</p>
          <Button onClick={() => setGeneratedTicket(null)} className="w-full">Get Another Ticket</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="officeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Service / Office</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an option" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {offices.map(office => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Generating...' : 'Get Ticket'}
        </Button>
      </form>
    </Form>
  );
}
