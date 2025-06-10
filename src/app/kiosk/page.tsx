import { TicketGenerationForm } from '@/components/kiosk/ticket-generation-form';
import { SiteLogo } from '@/components/shared/site-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketIcon } from 'lucide-react';

export default function KioskPage() {
  const offices = [
    { id: 'office1', name: 'Main Office - General Inquiries' },
    { id: 'office2', name: 'Branch Office - Specialized Services' },
    { id: 'office3', name: 'Downtown Hub - Quick Support' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-6 flex justify-center">
             <SiteLogo />
          </div>
          <div className="flex items-center justify-center gap-2">
            <TicketIcon className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-2xl">Get Your Ticket</CardTitle>
          </div>
          <CardDescription>Select your service and get a queue number to be served.</CardDescription>
        </CardHeader>
        <CardContent>
          <TicketGenerationForm offices={offices} />
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Thank you for your patience.</p>
      </footer>
    </div>
  );
}
