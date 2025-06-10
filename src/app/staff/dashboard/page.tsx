
'use client';

import React, { useState, useEffect } from 'react';
import { StaffLayout } from '@/components/layouts/staff-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StaffControls } from '@/components/staff/staff-controls';
import { NowServingCard } from '@/components/staff/now-serving-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecksIcon, UsersIcon, AlertTriangleIcon, TvIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Ticket {
  id: string; // Add id for key prop
  number: string;
  service: string;
  timeWaiting: string;
  officeId?: string; // For filtering
  timestamp: number; // Keep timestamp for sorting/logic
}

interface QueueItem {
  id: string; // Add id for key prop
  number: string;
  service: string;
  priority?: boolean;
  officeId?: string; // For filtering
  timestamp: number; // Keep timestamp for sorting/logic
}

export default function StaffDashboardPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [counterDetails, setCounterDetails] = useState<string>("Loading...");
  const [staffOfficeId, setStaffOfficeId] = useState<string | null>(null);
  const [staffOfficeName, setStaffOfficeName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem('mockUserRole');
    const officeId = localStorage.getItem('mockUserOfficeId');
    const officeName = localStorage.getItem('mockUserOfficeName');

    setUserRole(role);
    setStaffOfficeId(officeId);
    setStaffOfficeName(officeName);

    if (role === 'admin') {
      setCounterDetails("Admin View (All Offices)");
    } else if (officeName) {
      setCounterDetails(officeName); // Use the specific office name
    } else if (role === 'staff' && !officeId) {
      setCounterDetails("Unassigned Counter");
    } else {
      setCounterDetails("General Staff View"); // Fallback
    }

    let allTickets: QueueItem[] = [];
    try {
      const storedQueue = localStorage.getItem('appQueue');
      if (storedQueue) {
        const parsedQueue = JSON.parse(storedQueue);
        if (Array.isArray(parsedQueue)) {
          allTickets = parsedQueue;
        } else {
          localStorage.setItem('appQueue', JSON.stringify([]));
        }
      } else {
        localStorage.setItem('appQueue', JSON.stringify([]));
      }
    } catch (error) {
        localStorage.setItem('appQueue', JSON.stringify([]));
    }


    // Filter queue based on role and officeId
    if (role === 'admin') {
      setQueue(allTickets.sort((a,b) => a.timestamp - b.timestamp));
    } else if (officeId) {
      setQueue(allTickets.filter(t => t.officeId === officeId).sort((a,b) => a.timestamp - b.timestamp));
    } else {
      // Staff not assigned to an office, show tickets with no officeId (general queue)
      setQueue(allTickets.filter(t => !t.officeId).sort((a,b) => a.timestamp - b.timestamp));
    }

    // Load current ticket for this staff member's context
    const currentTicketKey = 'appCurrentTicket-' + (officeId || 'general');
    try {
      const storedCurrentTicket = localStorage.getItem(currentTicketKey);
      if (storedCurrentTicket) {
        const parsedTicket: Ticket = JSON.parse(storedCurrentTicket);
         // Ensure current ticket matches staff's office context or is general if staff unassigned, or if admin
        if ( (officeId && parsedTicket.officeId === officeId) ||
             (!officeId && !parsedTicket.officeId && role !== 'admin') || // Staff unassigned, only general tickets
             role === 'admin' // Admin can see any current ticket (though this state might be per-counter in reality)
           ) {
          setCurrentTicket(parsedTicket);
        }
      }
    } catch (error) {
        // console.error("Error loading current ticket:", error);
    }

    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      // Persist the *entire* queue back to localStorage, as staff actions modify it globally
      // but filtering for display happens in the initial load useEffect.
      const allTicketsFromStorageRaw = localStorage.getItem('appQueue');
      let allTicketsFromStorage: QueueItem[] = [];
      if(allTicketsFromStorageRaw){
        try {
          allTicketsFromStorage = JSON.parse(allTicketsFromStorageRaw);
        } catch (e) { /* ignore parse error, will be overwritten */ }
      }

      // Create a map of the current filtered queue for quick lookup
      const currentFilteredQueueMap = new Map(queue.map(item => [item.id, item]));

      // Update or add items from the filtered queue back to the global list
      // Remove items from global list that are no longer in filtered queue (e.g. called next)
      const newGlobalQueue = allTicketsFromStorage
        .filter(ticket => currentFilteredQueueMap.has(ticket.id) || ticket.officeId !== staffOfficeId ) // Keep tickets from other offices
        .map(ticket => currentFilteredQueueMap.get(ticket.id) || ticket) // Update if present in current filtered queue
        .concat(queue.filter(ticket => !allTicketsFromStorage.find(t => t.id === ticket.id))); // Add new tickets from filtered queue


      // Remove duplicates that might arise from concat logic if not careful
      const uniqueGlobalQueue = Array.from(new Map(newGlobalQueue.map(item => [item.id, item])).values());


      localStorage.setItem('appQueue', JSON.stringify(uniqueGlobalQueue.sort((a,b) => a.timestamp - b.timestamp)));
    }
  }, [queue, staffOfficeId, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      const key = 'appCurrentTicket-' + (staffOfficeId || 'general');
      if (currentTicket) {
        localStorage.setItem(key, JSON.stringify(currentTicket));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [currentTicket, staffOfficeId, isDataLoaded]);


  const calculateWaitingTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const handleCallNext = () => {
    if (queue.length === 0) {
      toast({ title: 'Queue Empty', description: 'There are no customers waiting for this office.', variant: 'destructive' });
      setCurrentTicket(null);
      return;
    }

    const nextCustomer = queue[0]; // Already sorted and filtered

    const newCurrentTicket: Ticket = {
      id: nextCustomer.id,
      number: nextCustomer.number,
      service: nextCustomer.service,
      timeWaiting: calculateWaitingTime(nextCustomer.timestamp),
      officeId: nextCustomer.officeId,
      timestamp: nextCustomer.timestamp,
    };

    setCurrentTicket(newCurrentTicket);
    setQueue(prevQueue => prevQueue.filter(ticket => ticket.id !== nextCustomer.id));
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
    const skippedTicketNumber = currentTicket.number;
    // For simplicity, skipping just removes the current ticket.
    // In a real app, it might go to a "skipped" list or back to the queue.
    setCurrentTicket(null);
    toast({ title: 'Ticket Skipped', description: `Ticket ${skippedTicketNumber} has been skipped.` });
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

  const displayLink = staffOfficeId ? `/display?officeId=${staffOfficeId}` : '/display';
  const displayLinkText = staffOfficeName ? `View Display for ${staffOfficeName}` : "View Full Display";

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

        <div className="space-y-6">
            <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListChecksIcon className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-xl">Upcoming Queue</CardTitle>
                </div>
                 {(userRole === 'admin' || staffOfficeId) && ( // Allow adding test ticket if admin or assigned to an office
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/kiosk${staffOfficeId ? `?officeId=${staffOfficeId}` : ''}`} target="_blank">Add Test Ticket</Link>
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
                                Office: {ticketItem.officeId}
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

            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TvIcon className="h-6 w-6 text-primary"/>
                        <CardTitle className="font-headline text-xl">Live Display</CardTitle>
                    </div>
                    <CardDescription>View the public queue display screen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href={displayLink} target="_blank" rel="noopener noreferrer">
                            {displayLinkText}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>


      </div>
    </StaffLayout>
  );
}

    