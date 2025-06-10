import { StaffLayout } from '@/components/layouts/staff-layout';
import { PageHeader } from '@/components/shared/page-header';
import { StaffControls } from '@/components/staff/staff-controls';
import { NowServingCard } from '@/components/staff/now-serving-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecksIcon, UsersIcon } from 'lucide-react';

// Mock data - in a real app, this would come from a state management solution or API
const mockCurrentTicket = {
  number: 'A-102',
  service: 'General Inquiries',
  timeWaiting: '5m 32s',
};

const mockQueue = [
  { number: 'A-103', service: 'General Inquiries' },
  { number: 'B-205', service: 'Account Opening' },
  { number: 'A-104', service: 'General Inquiries' },
  { number: 'P-007', service: 'Priority Service', priority: true },
];

const mockCounterDetails = "Counter 3"; // Example counter detail

export default function StaffDashboardPage() {
  return (
    <StaffLayout>
      <PageHeader 
        title="Staff Dashboard" 
        description="Manage customer queues and provide service efficiently."
        icon={UsersIcon}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-6">
          <NowServingCard ticket={mockCurrentTicket} counterDetails={mockCounterDetails} />
          <StaffControls currentTicketNumber={mockCurrentTicket?.number} counterDetails={mockCounterDetails} />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ListChecksIcon className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-xl">Upcoming Queue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {mockQueue.length > 0 ? (
              <ul className="space-y-3">
                {mockQueue.map((ticket, index) => (
                  <li key={index} className={`p-3 rounded-md ${ticket.priority ? 'bg-accent/20 border-accent border' : 'bg-secondary'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${ticket.priority ? 'text-accent-foreground' : 'text-foreground'}`}>{ticket.number}</span>
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
