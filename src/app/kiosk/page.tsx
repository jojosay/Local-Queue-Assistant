
'use client';

import { TicketGenerationForm } from '@/components/kiosk/ticket-generation-form';
import { SiteLogo } from '@/components/shared/site-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketIcon } from 'lucide-react';
import { initialMockOffices, type Office } from '@/app/admin/offices/page'; // Import mock offices and Office type
import { useState, useEffect } from 'react';

export default function KioskPage() {
  // In a real app, this would be fetched. For now, we use the imported mock data.
  // We filter for 'Active' offices to simulate a real scenario.
  const [activeOffices, setActiveOffices] = useState<Office[]>([]);

  useEffect(() => {
    // Filter for active offices
    setActiveOffices(initialMockOffices.filter(office => office.status === 'Active'));
  }, []);

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
          {activeOffices.length > 0 ? (
            <TicketGenerationForm offices={activeOffices} />
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No active offices available at the moment. Please check back later.
            </p>
          )}
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Thank you for your patience.</p>
      </footer>
    </div>
  );
}
