
'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layouts/staff-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StaffControls } from '@/components/staff/staff-controls';
import { NowServingCard } from '@/components/staff/now-serving-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecksIcon, UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for Ticket and QueueItem
interface Ticket {
  number: string;
  service: string;
  timeWaiting: string; // This could be calculated or come from data
}

interface QueueItem {
  number: string;
  service: string;
  priority?: boolean;
}

// Initial mock data
const initialMockQueue: QueueItem[] = [
  { number: 'A-103', service: 'General Inquiries' },
  { number: 'B-205', service: 'Account Opening' },
  { number: 'A-104', service: 'General Inquiries' },
  { number: 'P-007', service: 'Priority Service', priority: true },
  { number: 'C-311', service: 'Complaints' },
];

const initialCounterDetails = "Counter 3"; // Example counter detail, can be made dynamic later

export default function StaffDashboardPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>(initialMockQueue);
  const [counterDetails, setCounterDetails] = useState<string>(initialCounterDetails);
  const { toast } = useToast();

  const calculateWaitingTime = () => {
    // Basic random waiting time for mock purposes
    const minutes = Math.floor(Math.random() * 15);
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}m ${seconds}s`;
  };

  const handleCallNext = () => {
    if (queue.length === 0) {
      toast({ title: 'Queue Empty', description: 'There are no customers waiting in the queue.', variant: 'destructive' });
      setCurrentTicket(null); // Ensure current ticket is cleared if queue becomes empty
      return;
    }

    const nextCustomer = queue[0];
    const newCurrentTicket: Ticket = {
      number: nextCustomer.number,
      service: nextCustomer.service,
      timeWaiting: calculateWaitingTime(), // Simulate new waiting time
    };

    setCurrentTicket(newCurrentTicket);
    setQueue(prevQueue => prevQueue.slice(1));
    toast({ title: 'Called Next', description: `Now serving ticket ${newCurrentTicket.number}.` });
    // TODO: Consider auto-announcing here if desired
  };

  const handleCompleteTicket = () => {
    if (!currentTicket) {
      toast({ title: 'No Active Ticket', description: 'There is no ticket currently being served.', variant: 'destructive' });
      return;
    }
    const completedTicketNumber = currentTicket.number;
    setCurrentTicket(null);
    toast({ title: 'Ticket Completed', description: `Ticket ${completedTicketNumber} has been marked as complete.` });
  };

  const handleSkipTicket = () => {
    if (!currentTicket) {
      toast({ title: 'No Active Ticket', description: 'There is no ticket to skip.', variant: 'destructive' });
      return;
    }
    const skippedTicketNumber = currentTicket.number;
    setCurrentTicket(null); // For now, just clear the ticket
    // Could re-add to end of queue: setQueue(prevQueue => [...prevQueue, { number: skippedTicketNumber, service: 'Skipped Service' }]);
    toast({ title: 'Ticket Skipped', description: `Ticket ${skippedTicketNumber} has been skipped.` });
  };

  // Effect to add more tickets to the queue to simulate a live environment (for testing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (queue.length < 10 && Math.random() < 0.3) { // Add tickets if queue is short
        const type = Math.random() > 0.7 ? 'P' : (Math.random() > 0.4 ? 'B' : 'A');
        const newTicketNumber = `${type}-${Math.floor(100 + Math.random() * 900)}`;
        const services = ['General Inquiries', 'Account Opening', 'Loan Application', 'Card Services'];
        const randomService = services[Math.floor(Math.random() * services.length)];
        
        setQueue(prevQueue => [...prevQueue, { 
          number: newTicketNumber, 
          service: randomService, 
          priority: type === 'P' 
        }]);
      }
    }, 15000); // Add a ticket every 15 seconds randomly

    return () => clearInterval(interval);
  }, [queue.length]);


  return (
    <StaffLayout>
      <PageHeader 
        title="Staff Dashboard" 
        description="Manage customer queues and provide service efficiently."
        icon={UsersIcon}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          <NowServingCard ticket={currentTicket} counterDetails={counterDetails} />
          <StaffControls 
            currentTicketNumber={currentTicket?.number} 
            counterDetails={counterDetails}
            onCallNext={handleCallNext}
            onComplete={handleCompleteTicket}
            onSkip={handleSkipTicket}
            isQueueEmpty={queue.length === 0}
            isTicketActive={!!currentTicket}
          />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListChecksIcon className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-xl">Upcoming Queue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {queue.map((ticket, index) => (
                  <li key={`${ticket.number}-${index}`} className={`p-3 rounded-md ${ticket.priority ? 'bg-accent/20 border-accent border' : 'bg-secondary'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${ticket.priority ? 'text-accent-foreground dark:text-yellow-400' : 'text-foreground'}`}>{ticket.number}</span>
                      <span className="text-sm text-muted-foreground">{ticket.service}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">The queue is currently empty.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
}
