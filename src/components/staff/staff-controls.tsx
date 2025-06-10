
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, CheckCircle2Icon, SkipForwardIcon, RotateCcwIcon, Volume2Icon, Loader2 } from 'lucide-react';
import { handleVoiceAnnouncement } from '@/app/staff/dashboard/actions';
import type { NotificationPreference } from '@/app/staff/dashboard/page'; // Import the type

interface StaffControlsProps {
  currentTicketNumber: string | null | undefined;
  counterDetails: string;
  assignedCounterName: string | null; // For more precise announcements
  notificationPreference: NotificationPreference;
  onCallNext: () => void;
  onComplete: () => void;
  onSkip: () => void;
  isQueueEmpty: boolean;
  isTicketActive: boolean;
  isDisabled?: boolean;
  isAnnouncing: boolean; 
  setIsAnnouncing: (isAnnouncing: boolean) => void;
  playNotificationSound: () => void; // Add this prop
}

export function StaffControls({ 
  currentTicketNumber, 
  counterDetails, 
  assignedCounterName, 
  notificationPreference,
  onCallNext, 
  onComplete, 
  onSkip,
  isQueueEmpty,
  isTicketActive,
  isDisabled = false,
  isAnnouncing,
  setIsAnnouncing,
  playNotificationSound 
}: StaffControlsProps) {
  const { toast } = useToast();

  const effectiveCounterName = assignedCounterName || counterDetails; 

  const handleTicketActionNotification = async (ticketNum: string, counterNameForAction: string, actionDescription: string) => {
    if (isDisabled) {
        toast({ variant: 'destructive', title: 'Action Disabled', description: 'Cannot perform action. No active counter assignment.' });
        return;
    }
    if (!ticketNum) {
      toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket number to act upon.' });
      return;
    }
    if (!counterNameForAction || counterNameForAction === "Unassigned" || counterNameForAction.startsWith("No open counters") || counterNameForAction.startsWith("Error loading")) {
      toast({ variant: 'destructive', title: 'Action Failed', description: 'Counter details are not properly set up.' });
      return;
    }

    if (notificationPreference === 'voice') {
      setIsAnnouncing(true);
      try {
        const result = await handleVoiceAnnouncement({ ticketNumber: ticketNum, counterDetails: counterNameForAction });
        toast({
          title: 'Voice Announcement Sent',
          description: `${actionDescription} ${ticketNum} to ${counterNameForAction}. Announcement: "${result.announcementText}"`,
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
      playNotificationSound(); // Use the passed function
      toast({
        title: 'Notification Alert 🔔',
        description: `${actionDescription} ${ticketNum} to ${counterNameForAction}.`,
      });
    }
  };
  
  const handleLocalCallNext = () => {
    if (isDisabled) {
        toast({ variant: 'destructive', title: 'Action Disabled', description: 'Cannot call next. Ensure you are assigned to an open counter.' });
        return;
    }
    onCallNext(); 
  };

  const handleLocalComplete = () => {
    if (isDisabled) {
        toast({ variant: 'destructive', title: 'Action Disabled', description: 'Cannot complete ticket. No active counter assignment.' });
        return;
    }
    if (!isTicketActive) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    onComplete();
  };

  const handleLocalSkip = () => {
    if (isDisabled) {
        toast({ variant: 'destructive', title: 'Action Disabled', description: 'Cannot skip ticket. No active counter assignment.' });
        return;
    }
    if (!isTicketActive) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    onSkip();
  };
  
  const onRecall = async () => {
    if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket to recall.' });
        return;
    }
    await handleTicketActionNotification(currentTicketNumber, effectiveCounterName, "Recalling ticket");
  };
  
  const onAnnounceManually = async () => {
     if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket to announce.' });
        return;
    }
    await handleTicketActionNotification(currentTicketNumber, effectiveCounterName, "Announcing ticket");
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Queue Controls</CardTitle>
        <CardDescription>Manage the customer flow with these actions.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button 
          onClick={handleLocalCallNext} 
          size="lg" 
          className="col-span-2 md:col-span-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          disabled={isDisabled || isAnnouncing || (isQueueEmpty && !isTicketActive)}
        >
          <PlayIcon className="mr-2 h-5 w-5" /> Call Next Customer
        </Button>
        
        <Button onClick={handleLocalComplete} variant="outline" size="lg" disabled={isDisabled || isAnnouncing || !isTicketActive}>
          <CheckCircle2Icon className="mr-2 h-5 w-5" /> Complete
        </Button>
        <Button onClick={handleLocalSkip} variant="outline" size="lg" disabled={isDisabled || isAnnouncing || !isTicketActive}>
          <SkipForwardIcon className="mr-2 h-5 w-5" /> Skip
        </Button>
        <Button onClick={onRecall} variant="outline" size="lg" disabled={isDisabled || isAnnouncing || !isTicketActive}>
          {isAnnouncing && notificationPreference === 'voice' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RotateCcwIcon className="mr-2 h-5 w-5" /> Recall
        </Button>
         <Button onClick={onAnnounceManually} variant="outline" size="lg" className="col-span-2 md:col-span-3" disabled={isDisabled || isAnnouncing || !isTicketActive}>
          {isAnnouncing && notificationPreference === 'voice' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Volume2Icon className="mr-2 h-5 w-5" /> Announce Current Ticket
        </Button>
      </CardContent>
    </Card>
  );
}

