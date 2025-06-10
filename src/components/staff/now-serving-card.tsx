import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketIcon, ClockIcon, InfoIcon } from 'lucide-react';

interface Ticket {
  number: string;
  service: string;
  timeWaiting: string;
}

interface NowServingCardProps {
  ticket: Ticket | null;
  counterDetails: string;
}

export function NowServingCard({ ticket, counterDetails }: NowServingCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <TicketIcon className="h-6 w-6 text-primary" />
            Now Serving at {counterDetails}
          </CardTitle>
          {/* Placeholder for a small status indicator if needed */}
        </div>
        <CardDescription>Details of the customer currently being attended to.</CardDescription>
      </CardHeader>
      <CardContent>
        {ticket ? (
          <div className="space-y-4">
            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <p className="text-5xl font-bold text-primary">{ticket.number}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
                <InfoIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Service:</span> {ticket.service}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Waiting Time:</span> {ticket.timeWaiting}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No customer is currently being served.</p>
            <p className="text-sm text-muted-foreground">Click "Call Next" to attend to the next customer.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
