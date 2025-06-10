
'use client';

import { QueueBoard, type OfficeWithCountersAndTickets } from '@/components/display/queue-board';
import { SiteLogo } from '@/components/shared/site-logo';
import { TvIcon, BuildingIcon } from 'lucide-react';
import type { Office } from '@/app/admin/offices/page';
import type { Counter } from '@/app/admin/counters/page';
import { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  number: string;
  service: string;
  officeId?: string;
  timestamp: number;
}

export default function DisplayPage() {
  const [officesWithCountersData, setOfficesWithCountersData] = useState<OfficeWithCountersAndTickets[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAndProcessData = () => {
      const storedOffices = localStorage.getItem('appOffices');
      const storedCounters = localStorage.getItem('appCounters');
      const storedQueue = localStorage.getItem('appQueue'); // All waiting tickets
      
      const allOffices: Office[] = storedOffices ? JSON.parse(storedOffices) : [];
      const allCounters: Counter[] = storedCounters ? JSON.parse(storedCounters) : [];
      const allTickets: Ticket[] = storedQueue ? JSON.parse(storedQueue) : [];

      const activeOffices = allOffices.filter(office => office.status === 'Active');
      
      const data: OfficeWithCountersAndTickets[] = activeOffices.map(office => {
        const officeCounters = allCounters
          .filter(counter => counter.officeId === office.id && counter.status === 'Open')
          .map(counter => {
            // Find current ticket for this counter (simple logic: one ticket per counter for display)
            // In a real app, this would come from staff's 'currentTicket' state for this specific counter.
            // For simulation, we'll try to find one if it's stored for this "counter" (office in this case)
            const currentTicketKey = 'appCurrentTicket-' + counter.officeId; // Assuming counter uses officeId as its serving context for now
            const storedCurrentTicket = localStorage.getItem(currentTicketKey);
            let currentTicketObj: Ticket | null = null;
            if(storedCurrentTicket) {
                const parsed = JSON.parse(storedCurrentTicket);
                // Simple check if this "current" ticket is for this office (or counter's office)
                if(parsed.officeId === counter.officeId) {
                    currentTicketObj = parsed;
                }
            }


            // Filter waiting tickets for this specific counter/office
            const nextTicketsForCounter = allTickets
              .filter(t => t.officeId === counter.officeId && t.id !== currentTicketObj?.id) // Exclude current ticket
              .sort((a,b) => a.timestamp - b.timestamp) // Oldest first
              .map(t => t.number)
              .slice(0, 4); // Show next 4

            return {
              id: counter.id,
              name: counter.name,
              priority: counter.priority,
              currentTicket: currentTicketObj ? currentTicketObj.number : null,
              nextTickets: nextTicketsForCounter,
            };
          });

        return {
          id: office.id,
          name: office.name,
          address: office.address,
          counters: officeCounters,
        };
      }).filter(office => office.counters.length > 0); 

      setOfficesWithCountersData(data);
      setIsLoading(false);
    };

    loadAndProcessData(); // Initial load

    // Set up an interval to refresh data from localStorage to simulate live updates
    const intervalId = setInterval(loadAndProcessData, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 md:p-8 items-center justify-center">
        <TvIcon className="h-16 w-16 animate-pulse text-primary" />
        <p className="mt-4 text-xl">Loading Queue Display...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fade-in">
      <header className="mb-6 md:mb-10 flex justify-between items-center">
        <SiteLogo className="text-white" />
        <div className="flex items-center gap-2">
          <TvIcon className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline">Live Queue Display</h1>
        </div>
      </header>
      <main className="flex-grow">
        {officesWithCountersData.length > 0 ? (
          <QueueBoard officesWithCounters={officesWithCountersData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BuildingIcon className="h-24 w-24 text-gray-600 mb-4" />
            <h2 className="text-3xl font-semibold text-gray-400 mb-2">No Active Offices or Counters</h2>
            <p className="text-gray-500">Please add and activate offices and counters in the admin panel.</p>
          </div>
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        <p>Please listen for voice announcements and watch the screen for your ticket number.</p>
      </footer>
    </div>
  );
}
