
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StaffLayout } from '@/components/layouts/staff-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StaffControls } from '@/components/staff/staff-controls';
import { NowServingCard } from '@/components/staff/now-serving-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecksIcon, UsersIcon, AlertTriangleIcon, TvIcon, Settings2Icon, BellRingIcon, MicIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Counter } from '@/app/admin/counters/page';
import type { Office } from '@/app/admin/offices/page';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { handleVoiceAnnouncement as serverHandleVoiceAnnouncement } from './actions';


interface Ticket {
  id: string;
  number: string;
  service: string; // Typically the office name or specific service
  timeWaiting: string; // Calculated at call time
  officeId: string;
  counterId: string; // ID of the counter serving this ticket
  timestamp: number;
}

interface QueueItem {
  id:string;
  number: string;
  service: string;
  priority?: boolean;
  officeId: string; // Ensure officeId is always present
  timestamp: number;
}

export type NotificationPreference = 'voice' | 'sound';

export default function StaffDashboardPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [counterDetails, setCounterDetails] = useState<string>("Loading...");
  const [staffOfficeId, setStaffOfficeId] = useState<string | null>(null);
  const [staffOfficeName, setStaffOfficeName] = useState<string | null>(null);
  const [assignedCounterId, setAssignedCounterId] = useState<string | null>(null);
  const [assignedCounterName, setAssignedCounterName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState<NotificationPreference>('voice');
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const { toast } = useToast();

  useEffect(() => {
    // Client-side only effect for audio element
    audioRef.current = new Audio('/audio/notification.mp3');
    audioRef.current.load(); // Preload the audio

    const role = localStorage.getItem('mockUserRole');
    const officeId = localStorage.getItem('mockUserOfficeId');
    const officeName = localStorage.getItem('mockUserOfficeName');

    setUserRole(role);
    setStaffOfficeId(officeId);
    setStaffOfficeName(officeName);

    const storedPreference = localStorage.getItem('appStaffNotificationPreference') as NotificationPreference | null;
    if (storedPreference && (storedPreference === 'voice' || storedPreference === 'sound')) {
      setNotificationPreference(storedPreference);
    }


    let currentAssignedCounter: Counter | null = null;

    if (officeId && role === 'staff') {
      try {
        const storedCountersRaw = localStorage.getItem('appCounters');
        if (storedCountersRaw) {
          const allCounters: Counter[] = JSON.parse(storedCountersRaw);
          const openCountersInOffice = allCounters.filter(c => c.officeId === officeId && c.status === 'Open');
          if (openCountersInOffice.length > 0) {
            currentAssignedCounter = openCountersInOffice[0]; 
            setAssignedCounterId(currentAssignedCounter.id);
            setAssignedCounterName(currentAssignedCounter.name);
            setCounterDetails(`${currentAssignedCounter.name} at ${officeName || 'Office'}`);
          } else {
            setCounterDetails(`No open counters at ${officeName || 'Office'}`);
          }
        } else {
           setCounterDetails(`Counters not configured for ${officeName || 'Office'}`);
        }
      } catch (e) {
        console.error("Error loading counters for staff dashboard:", e);
        setCounterDetails("Error loading counter details");
      }
    } else if (role === 'admin') {
      setCounterDetails("Admin Global View"); 
    } else {
      setCounterDetails("Unassigned");
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

    if (role === 'admin') {
      setQueue(allTickets.sort((a,b) => a.timestamp - b.timestamp));
    } else if (officeId) {
      setQueue(allTickets.filter(t => t.officeId === officeId).sort((a,b) => a.timestamp - b.timestamp));
    } else {
      setQueue(allTickets.filter(t => !t.officeId).sort((a,b) => a.timestamp - b.timestamp)); 
    }

    if (officeId && currentAssignedCounter) {
      const currentTicketKey = `appCurrentTicket-${officeId}-${currentAssignedCounter.id}`;
      try {
        const storedCurrentTicket = localStorage.getItem(currentTicketKey);
        if (storedCurrentTicket) {
          const parsedTicket: Ticket = JSON.parse(storedCurrentTicket);
          if (parsedTicket.officeId === officeId && parsedTicket.counterId === currentAssignedCounter.id) {
            setCurrentTicket(parsedTicket);
          }
        }
      } catch (error) {
          // console.error("Error loading current ticket:", error);
      }
    }
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const allTicketsFromStorageRaw = localStorage.getItem('appQueue');
      let allTicketsFromStorage: QueueItem[] = [];
      if(allTicketsFromStorageRaw){
        try {
          allTicketsFromStorage = JSON.parse(allTicketsFromStorageRaw);
        } catch (e) { /* ignore */ }
      }
      const currentFilteredQueueMap = new Map(queue.map(item => [item.id, item]));
      const newGlobalQueue = allTicketsFromStorage
        .filter(ticket => currentFilteredQueueMap.has(ticket.id) || ticket.officeId !== staffOfficeId )
        .map(ticket => currentFilteredQueueMap.get(ticket.id) || ticket)
        .concat(queue.filter(ticket => !allTicketsFromStorage.find(t => t.id === ticket.id)));
      const uniqueGlobalQueue = Array.from(new Map(newGlobalQueue.map(item => [item.id, item])).values());
      localStorage.setItem('appQueue', JSON.stringify(uniqueGlobalQueue.sort((a,b) => a.timestamp - b.timestamp)));
    }
  }, [queue, staffOfficeId, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded && staffOfficeId && assignedCounterId) {
      const key = `appCurrentTicket-${staffOfficeId}-${assignedCounterId}`;
      if (currentTicket) {
        if (currentTicket.officeId === staffOfficeId && currentTicket.counterId === assignedCounterId) {
            localStorage.setItem(key, JSON.stringify(currentTicket));
        }
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [currentTicket, staffOfficeId, assignedCounterId, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
        localStorage.setItem('appStaffNotificationPreference', notificationPreference);
    }
  }, [notificationPreference, isDataLoaded]);

  const calculateWaitingTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Rewind to start
      audioRef.current.play().catch(error => {
        console.error("Error playing notification sound:", error);
        toast({
          variant: 'destructive',
          title: 'Sound Playback Error',
          description: 'Could not play notification sound. Ensure audio is enabled in your browser.',
        });
      });
    }
  };

  const executeTicketNotification = async (ticketNumber: string, counterName: string, actionType: string) => {
    if (notificationPreference === 'voice') {
      setIsAnnouncing(true);
      try {
        const result = await serverHandleVoiceAnnouncement({ ticketNumber, counterDetails: counterName });
        toast({
          title: 'Voice Announcement Sent',
          description: `${actionType} ${ticketNumber} to ${counterName}. Announcement: "${result.announcementText}"`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Voice Announcement Failed',
          description: `Could not generate voice announcement. ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        setIsAnnouncing(false);
      }
    } else if (notificationPreference === 'sound') {
      playNotificationSound();
      toast({
        title: 'Notification Alert 🔔',
        description: `${actionType} ${ticketNumber} to ${counterName}.`,
      });
    }
  };


  const handleCallNext = () => {
    if (userRole === 'admin') {
        toast({ title: 'Admin Action', description: 'Admins observe queues, staff operate counters.', variant: 'default' });
        return;
    }
    if (!staffOfficeId || !assignedCounterId || !assignedCounterName) {
      toast({ title: 'Cannot Call Next', description: 'Staff not assigned to an active counter or office.', variant: 'destructive' });
      return;
    }
    if (queue.length === 0) {
      toast({ title: 'Queue Empty', description: `No customers waiting for ${staffOfficeName || 'this office'}.`, variant: 'destructive' });
      setCurrentTicket(null);
      return;
    }

    const nextCustomer = queue[0];

    const newCurrentTicket: Ticket = {
      id: nextCustomer.id,
      number: nextCustomer.number,
      service: nextCustomer.service,
      timeWaiting: calculateWaitingTime(nextCustomer.timestamp),
      officeId: staffOfficeId,
      counterId: assignedCounterId,
      timestamp: nextCustomer.timestamp,
    };

    setCurrentTicket(newCurrentTicket);
    setQueue(prevQueue => prevQueue.filter(ticket => ticket.id !== nextCustomer.id));
    toast({ title: 'Called Next', description: `Now serving ticket ${newCurrentTicket.number} at ${assignedCounterName}.` });
    
    executeTicketNotification(newCurrentTicket.number, assignedCounterName, "Calling ticket");
  };

  const handleCompleteTicket = () => {
    if (!currentTicket) {
      toast({ title: 'No Active Ticket', description: 'No ticket currently being served.', variant: 'destructive' });
      return;
    }
     if (!assignedCounterId && userRole !== 'admin') {
      toast({ title: 'Action Failed', description: 'No counter assigned to complete ticket.', variant: 'destructive' });
      return;
    }
    const completedTicketNumber = currentTicket.number;
    setCurrentTicket(null); 
    toast({ title: 'Ticket Completed', description: `Ticket ${completedTicketNumber} at ${assignedCounterName || 'counter'} marked as complete.` });
  };

  const handleSkipTicket = () => {
    if (!currentTicket) {
      toast({ title: 'No Active Ticket', description: 'No ticket to skip.', variant: 'destructive' });
      return;
    }
    if (!assignedCounterId && userRole !== 'admin') {
      toast({ title: 'Action Failed', description: 'No counter assigned to skip ticket.', variant: 'destructive' });
      return;
    }
    const skippedTicketNumber = currentTicket.number;
    setCurrentTicket(null); 
    toast({ title: 'Ticket Skipped', description: `Ticket ${skippedTicketNumber} at ${assignedCounterName || 'counter'} skipped.` });
  };

  if (!isDataLoaded) {
    return (
      <StaffLayout>
        <PageHeader title="Staff Dashboard" description="Loading user and counter data..." icon={UsersIcon} />
        <div className="flex justify-center items-center h-64">
          <ListChecksIcon className="h-12 w-12 animate-spin text-primary" />
        </div>
      </StaffLayout>
    );
  }

  const displayLink = staffOfficeId ? `/display?officeId=${staffOfficeId}` : '/display';
  const displayLinkText = staffOfficeName ? `View Display for ${staffOfficeName}` : "View Full Display";
  const canOperateCounter = userRole === 'staff' && staffOfficeId && assignedCounterId;

  return (
    <StaffLayout>
      <PageHeader
        title="Staff Dashboard"
        description={userRole === 'admin' ? "Global queue overview." : `Manage customer queues for ${counterDetails}.`}
        icon={UsersIcon}
      />

      {userRole === 'staff' && !staffOfficeId && (
        <Card className="mb-6 bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
          <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><AlertTriangleIcon />Office Assignment Pending</CardTitle></CardHeader>
          <CardContent><p className="text-yellow-600 dark:text-yellow-500">You are not assigned to an office. Please contact an administrator.</p></CardContent>
        </Card>
      )}
      {userRole === 'staff' && staffOfficeId && !assignedCounterId && (
         <Card className="mb-6 bg-orange-50 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700">
          <CardHeader><CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400"><AlertTriangleIcon />No Open Counter</CardTitle></CardHeader>
          <CardContent><p className="text-orange-600 dark:text-orange-500">There are no open counters in {staffOfficeName || 'your assigned office'}. Please open a counter or contact an administrator.</p></CardContent>
        </Card>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          <NowServingCard ticket={currentTicket} counterDetails={counterDetails} />
          <StaffControls
            currentTicketNumber={currentTicket?.number}
            counterDetails={counterDetails}
            assignedCounterName={assignedCounterName}
            notificationPreference={notificationPreference}
            onCallNext={handleCallNext}
            onComplete={handleCompleteTicket}
            onSkip={handleSkipTicket}
            isQueueEmpty={queue.length === 0}
            isTicketActive={!!currentTicket}
            isDisabled={!canOperateCounter && userRole !== 'admin'}
            isAnnouncing={isAnnouncing}
            setIsAnnouncing={setIsAnnouncing}
            playNotificationSound={playNotificationSound} // Pass down the function
          />
        </div>

        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2Icon className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline text-xl">Notification Settings</CardTitle>
                    </div>
                     <CardDescription>Choose how you want to be notified for ticket actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup 
                        defaultValue={notificationPreference} 
                        onValueChange={(value: string) => setNotificationPreference(value as NotificationPreference)}
                        disabled={!canOperateCounter && userRole !== 'admin'}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="voice" id="pref-voice" />
                            <Label htmlFor="pref-voice" className="flex items-center gap-2"><MicIcon className="h-4 w-4"/> AI Voice Call-out</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sound" id="pref-sound" />
                            <Label htmlFor="pref-sound" className="flex items-center gap-2"><BellRingIcon className="h-4 w-4"/> Simple Sound Alert</Label>
                        </div>
                    </RadioGroup>
                    <p className="mt-3 text-xs text-muted-foreground">
                        For sound alert, ensure you have an audio file at <code className="bg-muted px-1 py-0.5 rounded">public/audio/notification.mp3</code>.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListChecksIcon className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-xl">Upcoming Queue</CardTitle>
                </div>
                 {(userRole === 'admin' || staffOfficeId) && (
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
                                Office ID: {ticketItem.officeId}
                            </div>
                        )}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-center py-4">The queue for {staffOfficeName || (userRole === 'admin' ? "all offices" : "your area")} is currently empty.</p>
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

