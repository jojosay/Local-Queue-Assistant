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
}

export function StaffControls({ currentTicketNumber, counterDetails }: StaffControlsProps) {
  const { toast } = useToast();
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const onCallNext = () => {
    toast({ title: 'Called Next', description: 'Fetching next customer in queue.' });
    // Add logic to call next customer
  };

  const onComplete = () => {
    if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    toast({ title: 'Ticket Completed', description: `Ticket ${currentTicketNumber} marked as complete.` });
    // Add logic to complete current ticket
  };

  const onSkip = () => {
    if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket is currently being served.' });
        return;
    }
    toast({ title: 'Ticket Skipped', description: `Ticket ${currentTicketNumber} skipped.` });
    // Add logic to skip current ticket
  };

  const onRecall = async () => {
    if (!currentTicketNumber) {
        toast({ variant: 'destructive', title: 'Action Failed', description: 'No ticket to recall.' });
        return;
    }
    toast({ title: 'Recalled Ticket', description: `Recalling ticket ${currentTicketNumber}.` });
    await triggerVoiceAnnouncement(currentTicketNumber, counterDetails, "Recalling ticket");
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
        description: 'Could not generate voice announcement.',
      });
    } finally {
      setIsAnnouncing(false);
    }
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
        <Button onClick={onCallNext} size="lg" className="col-span-2 md:col-span-3 bg-green-600 hover:bg-green-700">
          <PlayIcon className="mr-2 h-5 w-5" /> Call Next Customer
        </Button>
        
        <Button onClick={onComplete} variant="outline" size="lg">
          <CheckCircle2Icon className="mr-2 h-5 w-5" /> Complete
        </Button>
        <Button onClick={onSkip} variant="outline" size="lg">
          <SkipForwardIcon className="mr-2 h-5 w-5" /> Skip
        </Button>
        <Button onClick={onRecall} variant="outline" size="lg" disabled={isAnnouncing || !currentTicketNumber}>
          {isAnnouncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RotateCcwIcon className="mr-2 h-5 w-5" /> Recall
        </Button>
         <Button onClick={onAnnounceManually} variant="outline" size="lg" className="col-span-2 md:col-span-3" disabled={isAnnouncing || !currentTicketNumber}>
          {isAnnouncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Volume2Icon className="mr-2 h-5 w-5" /> Announce Current Ticket
        </Button>
      </CardContent>
    </Card>
  );
}
