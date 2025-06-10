
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlayIcon, CheckCircle2Icon, SkipForwardIcon, RotateCcwIcon, Volume2Icon, Loader2 } from 'lucide-react';
import { handleVoiceAnnouncement } from '@/app/staff/dashboard/actions';
import { useState } from 'react';

interface StaffControlsProps {
  currentTicketNumber: string | null | undefined;
  counterDetails: string;
  onCallNext: () => void;
  onComplete: () => void;
  onSkip: () => void;
  isQueueEmpty: boolean;
  isTicketActive: boolean;
}

export function StaffControls({ 
  currentTicketNumber, 
  counterDetails, 
  onCallNext, 
  onComplete, 
  onSkip,
  isQueueEmpty,
  isTicketActive
}: StaffControlsProps) {
  const { toast } = useToast();
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const handleLocalCallNext = () => {
    onCallNext();
  };

  const handleLocalComplete = () => {
    if (!isTicketActive) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    onComplete();
  };

  const handleLocalSkip = () => {
     if (!isTicketActive) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    onSkip();
  };

  const triggerVoiceAnnouncement = async (ticketNumber: string, counter: string, actionType: string = "Calling ticket") => {
    if (!ticketNumber) {
      toast({ variant: 'destructive', title: 'Announcement Failed', description: 'No ticket number to announce.' });
      return;
    }
    setIsAnnouncing(true);
    try {
      const result = await handleVoiceAnnouncement({ ticketNumber, counterDetails: counter });
      toast({
        title: 'Voice Announcement Sent',
        description: `${actionType} ${ticketNumber} to ${counter}. Announcement: "${result.announcementText}"`,
      });
    } catch (error) {
      console.error('Voice announcement failed:', error);
      toast({
        variant: 'destructive',
        title: 'Voice Announcement Failed',
        description: `Could not generate voice announcement. ${error instanceof Error ? error.message : ''}`,
      });
    } finally {
      setIsAnnouncing(false);
    }
  };
  
  const onRecall = async () => {
    if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket to recall.' });
        return;
    }
    // toast({ title: 'Recalled Ticket', description: `Recalling ticket ${currentTicketNumber}.` }); // Toast is handled by triggerVoiceAnnouncement
    await triggerVoiceAnnouncement(currentTicketNumber, counterDetails, "Recalling ticket");
  };
  
  const onAnnounceManually = async () => {
     if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket to announce.' });
        return;
    }
    await triggerVoiceAnnouncement(currentTicketNumber, counterDetails, "Announcing ticket");
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
          disabled={isAnnouncing || (isQueueEmpty && !isTicketActive)} // Disable if announcing or queue is empty and no active ticket to clear first
        >
          <PlayIcon className="mr-2 h-5 w-5" /> Call Next Customer
        </Button>
        
        <Button onClick={handleLocalComplete} variant="outline" size="lg" disabled={isAnnouncing || !isTicketActive}>
          <CheckCircle2Icon className="mr-2 h-5 w-5" /> Complete
        </Button>
        <Button onClick={handleLocalSkip} variant="outline" size="lg" disabled={isAnnouncing || !isTicketActive}>
          <SkipForwardIcon className="mr-2 h-5 w-5" /> Skip
        </Button>
        <Button onClick={onRecall} variant="outline" size="lg" disabled={isAnnouncing || !isTicketActive}>
          {isAnnouncing && currentTicketNumber && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RotateCcwIcon className="mr-2 h-5 w-5" /> Recall
        </Button>
         <Button onClick={onAnnounceManually} variant="outline" size="lg" className="col-span-2 md:col-span-3" disabled={isAnnouncing || !isTicketActive}>
          {isAnnouncing && currentTicketNumber && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Volume2Icon className="mr-2 h-5 w-5" /> Announce Current Ticket
        </Button>
      </CardContent>
    </Card>
  );
}
