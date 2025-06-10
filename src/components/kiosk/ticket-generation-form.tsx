
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

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

interface QueueItem {
  id: string;
  number: string;
  service: string;
  officeId: string;
  priority?: boolean;
  timestamp: number;
}

const ticketFormSchema = z.object({
  officeId: z.string().min(1, { message: 'Please select an office.' }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

function TicketGenerationFormComponent({ offices }: TicketGenerationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<QueueItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [nextTicketNumber, setNextTicketNumber] = useState(100);

  const searchParams = useSearchParams();
  const preselectedOfficeId = searchParams.get('officeId');

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      officeId: preselectedOfficeId && offices.some(o => o.id === preselectedOfficeId) ? preselectedOfficeId : '',
    },
  });

  useEffect(() => {
    // If preselectedOfficeId is valid and different from current form value, update it
    if (preselectedOfficeId && offices.some(o => o.id === preselectedOfficeId) && form.getValues('officeId') !== preselectedOfficeId) {
      form.setValue('officeId', preselectedOfficeId);
    }
  }, [preselectedOfficeId, offices, form]);


  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000);

    const storedTicketNum = localStorage.getItem('nextTicketNumber');
    if (storedTicketNum) {
      setNextTicketNumber(parseInt(storedTicketNum, 10));
    }

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('nextTicketNumber', nextTicketNumber.toString());
  }, [nextTicketNumber]);

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
      service: selectedOffice.name,
      officeId: selectedOffice.id,
      priority: false,
      timestamp: Date.now(),
    };

    let queue: QueueItem[] = [];
    try {
        const storedQueue = localStorage.getItem('appQueue');
        if (storedQueue) {
            const parsedQueue = JSON.parse(storedQueue);
            if(Array.isArray(parsedQueue)) queue = parsedQueue;
        }
    } catch (e) { /* ignore */ }
    
    queue.push(newTicket);
    localStorage.setItem('appQueue', JSON.stringify(queue));

    setGeneratedTicket(newTicket);
    setIsLoading(false);
    toast({
      title: 'Ticket Generated!',
      description: `Your ticket number is ${newTicket.number}. Please note it down.`,
    });
    // Do not reset officeId if it was preselected via URL
    form.reset({ officeId: preselectedOfficeId && offices.some(o => o.id === preselectedOfficeId) ? preselectedOfficeId : '' });
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
              <Select
                onValueChange={field.onChange}
                value={field.value || ""} // Ensure value is not undefined for Select
                disabled={!!(preselectedOfficeId && offices.some(o => o.id === preselectedOfficeId))} // Disable if preselected
              >
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


export function TicketGenerationForm(props: TicketGenerationFormProps) {
  return (
    // Wrap with Suspense because useSearchParams() needs it for SSR components or during initial client render.
    <Suspense fallback={<div>Loading form...</div>}>
      <TicketGenerationFormComponent {...props} />
    </Suspense>
  );
}

    