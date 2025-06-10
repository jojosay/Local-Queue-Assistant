
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
import type { Office } from '@/app/admin/offices/page'; 

interface TicketGenerationFormProps {
  offices: Office[]; 
}

// Define QueueItem structure, as tickets will be added to a shared queue
interface QueueItem {
  id: string;
  number: string;
  service: string; // Could be office name or a specific service type later
  officeId: string;
  priority?: boolean;
  timestamp: number;
}


const ticketFormSchema = z.object({
  officeId: z.string().min(1, { message: 'Please select an office.' }),
  // Add other fields like service type if needed in the future
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export function TicketGenerationForm({ offices }: TicketGenerationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<QueueItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [nextTicketNumber, setNextTicketNumber] = useState(100);


  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateCurrentTime(); 
    const timer = setInterval(updateCurrentTime, 1000); 
    
    // Load next ticket number from local storage to maintain sequence across sessions
    const storedTicketNum = localStorage.getItem('nextTicketNumber');
    if (storedTicketNum) {
      setNextTicketNumber(parseInt(storedTicketNum, 10));
    }

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('nextTicketNumber', nextTicketNumber.toString());
  }, [nextTicketNumber]);


  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      officeId: '',
    },
  });

  async function onSubmit(values: TicketFormValues) {
    setIsLoading(true);
    setGeneratedTicket(null);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const selectedOffice = offices.find(o => o.id === values.officeId);
    if (!selectedOffice) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected office not found.' });
      setIsLoading(false);
      return;
    }

    const prefix = selectedOffice.name.substring(0, 1).toUpperCase();
    const ticketNumberStr = `${prefix}-${nextTicketNumber}`;
    setNextTicketNumber(prev => prev + 1);
    
    const newTicket: QueueItem = {
      id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      number: ticketNumberStr,
      service: selectedOffice.name, // Using office name as service for now
      officeId: selectedOffice.id,
      priority: false, // Default to non-priority
      timestamp: Date.now(),
    };

    // Add to a shared queue in localStorage
    const storedQueue = localStorage.getItem('appQueue');
    const queue: QueueItem[] = storedQueue ? JSON.parse(storedQueue) : [];
    queue.push(newTicket);
    localStorage.setItem('appQueue', JSON.stringify(queue));
    
    setGeneratedTicket(newTicket);
    setIsLoading(false);
    toast({
      title: 'Ticket Generated!',
      description: `Your ticket number is ${newTicket.number}. Please note it down.`,
    });
    form.reset(); 
  }

  if (generatedTicket) {
    return (
      <Card className="text-center animate-fade-in bg-primary/10 border-primary">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">Your Ticket</CardTitle>
          <CardDescription>Please wait for your number to be called for {generatedTicket.service}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-6xl font-bold text-primary">{generatedTicket.number}</p>
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
              <FormLabel>Select Office / Service Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an office" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {offices.map(office => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name} ({office.address})
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
