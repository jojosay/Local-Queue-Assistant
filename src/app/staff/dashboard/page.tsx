
'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layouts/staff-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StaffControls } from '@/components/staff/staff-controls';
import { NowServingCard } from '@/components/staff/now-serving-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecksIcon, UsersIcon, AlertTriangleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Ticket {
  id: string; // Add id for key prop
  number: string;
  service: string;
  timeWaiting: string; 
  officeId?: string; // For filtering
}

interface QueueItem {
  id: string; // Add id for key prop
  number: string;
  service: string;
  priority?: boolean;
  officeId?: string; // For filtering
}

export default function StaffDashboardPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [counterDetails, setCounterDetails] = useState<string>("Loading...");
  const [staffOfficeId, setStaffOfficeId] = useState<string | null>(null);
  const [staffOfficeName, setStaffOfficeName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [nextTicketId, setNextTicketId] = useState(1); // For generating unique ticket IDs

  const { toast } = useToast();

  useEffect(() => {
    // Load context from localStorage
    const role = localStorage.getItem('mockUserRole');
    const officeId = localStorage.getItem('mockUserOfficeId');
    const officeName = localStorage.getItem('mockUserOfficeName');
    
    setUserRole(role);
    setStaffOfficeId(officeId);
    setStaffOfficeName(officeName);

    if (role === 'admin') {
      setCounterDetails("Admin View (All Offices)");
    } else if (officeName) {
      setCounterDetails(officeName);
    } else if (role === 'staff') {
      setCounterDetails("Unassigned Counter");
    } else {
      setCounterDetails("General Staff View");
    }
    
    // Load tickets from localStorage (simulating a shared queue)
    const storedQueue = localStorage.getItem('appQueue');
    if (storedQueue) {
      const allTickets: QueueItem[] = JSON.parse(storedQueue);
      if (role === 'admin') {
        setQueue(allTickets);
      } else if (officeId) {
        setQueue(allTickets.filter(t => t.officeId === officeId || !t.officeId)); // Show office-specific and general tickets
      } else {
         setQueue(allTickets.filter(t => !t.officeId)); // Show only general tickets if staff not assigned
      }
    }

    const storedCurrentTicket = localStorage.getItem('appCurrentTicket-' + (officeId || 'general'));
    if(storedCurrentTicket) {
        const parsedTicket = JSON.parse(storedCurrentTicket);
        // Ensure current ticket matches staff's office or is general if staff unassigned
        if ( (officeId && parsedTicket.officeId === officeId) || (!officeId && !parsedTicket.officeId) || role === 'admin'){
            setCurrentTicket(parsedTicket);
        }
    }


    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    // Persist queue to localStorage
    if(isDataLoaded) { // Only save after initial load
      localStorage.setItem('appQueue', JSON.stringify(queue));
    }
  }, [queue, isDataLoaded]);

  useEffect(() => {
    // Persist current ticket to localStorage, namespaced by officeId or 'general'
    if (isDataLoaded) {
        const key = 'appCurrentTicket-' + (staffOfficeId || 'general');
        if (currentTicket) {
            localStorage.setItem(key, JSON.stringify(currentTicket));
        } else {
            localStorage.removeItem(key);
        }
    }
  }, [currentTicket, staffOfficeId, isDataLoaded]);


  const calculateWaitingTime = () => {
    const minutes = Math.floor(Math.random() * 15);
    const seconds = Math.floor(Math.random() * 60);
    return `${minutes}m ${seconds}s`;
  };

  const handleCallNext = () => {
    if (queue.length === 0) {
      toast({ title: 'Queue Empty', description: 'There are no customers waiting.', variant: 'destructive' });
      setCurrentTicket(null);
      return;
    }

    // Prioritize tickets for the current staff's office if they are assigned
    // Or, if admin, or unassigned staff, pick any.
    let nextCustomerIndex = -1;
    if (userRole !== 'admin' && staffOfficeId) {
      nextCustomerIndex = queue.findIndex(item => item.officeId === staffOfficeId);
    }
    if (nextCustomerIndex === -1) { // Fallback to any ticket if no office-specific or if admin/unassigned
      nextCustomerIndex = 0;
    }
    
    const nextCustomer = queue[nextCustomerIndex];

    const newCurrentTicket: Ticket = {
      id: nextCustomer.id,
      number: nextCustomer.number,
      service: nextCustomer.service,
      timeWaiting: calculateWaitingTime(),
      officeId: nextCustomer.officeId,
    };

    setCurrentTicket(newCurrentTicket);
    setQueue(prevQueue => prevQueue.filter((_, index) => index !== nextCustomerIndex));
    toast({ title: 'Called Next', description: `Now serving ticket ${newCurrentTicket.number}.` });
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
    const skippedTicket = { ...currentTicket, id: `skipped-${currentTicket.id}-${Date.now()}` }; // Give it a new ID to avoid key conflicts if re-added
    // Re-add to end of queue for simplicity, could be more complex (e.g. specific skipped queue)
    // For now, it just clears it. If re-queuing is desired:
    // setQueue(prevQueue => [...prevQueue, { number: skippedTicket.number, service: skippedTicket.service, officeId: skippedTicket.officeId, id: skippedTicket.id, priority: false }]);
    toast({ title: 'Ticket Skipped', description: `Ticket ${skippedTicket.number} has been skipped.` });
    setCurrentTicket(null);
  };

  if (!isDataLoaded) {
    return (
      <StaffLayout>
        <PageHeader title="Staff Dashboard" description="Loading user data..." icon={UsersIcon} />
        <div className="flex justify-center items-center h-64">
          <ListChecksIcon className="h-12 w-12 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <PageHeader 
        title="Staff Dashboard" 
        description={`Manage customer queues for ${staffOfficeName || (userRole === 'admin' ? 'all offices' : 'your assigned area')}.`}
        icon={UsersIcon}
      />

      {userRole === 'staff' && !staffOfficeId && (
        <Card className="mb-6 bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangleIcon />
              Office Assignment Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 dark:text-yellow-500">
              You are not currently assigned to a specific office. Please contact an administrator to get assigned.
              You can currently only manage general queue tickets.
            </p>
          </CardContent>
        </Card>
      )}

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecksIcon className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-xl">Upcoming Queue</CardTitle>
              </div>
              {userRole === 'admin' && (
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/kiosk" target="_blank">Add Test Ticket</Link>
                 </Button>
              )}
            </div>
             <CardDescription>
                {staffOfficeId ? `Showing tickets for ${staffOfficeName}.` : (userRole === 'admin' ? 'Showing all tickets.' : 'Showing general tickets.')}
             </CardDescription>
          </CardHeader>
          <CardContent>
            {queue.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {queue.map((ticketItem) => (
                  <li key={ticketItem.id} className={`p-3 rounded-md ${ticketItem.priority ? 'bg-accent/20 border-accent border' : 'bg-secondary'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${ticketItem.priority ? 'text-accent-foreground dark:text-yellow-400' : 'text-foreground'}`}>{ticketItem.number}</span>
                      <span className="text-sm text-muted-foreground">{ticketItem.service}</span>
                    </div>
                    {userRole === 'admin' && ticketItem.officeId && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Office ID: {ticketItem.officeId}
                        </div>
                    )}
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
