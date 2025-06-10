
'use client';

import { QueueBoard, type OfficeWithCounters } from '@/components/display/queue-board';
import { SiteLogo } from '@/components/shared/site-logo';
import { TvIcon, BuildingIcon } from 'lucide-react';
import { initialMockOffices, type Office } from '@/app/admin/offices/page';
import { initialMockCounters, type Counter } from '@/app/admin/counters/page';
import { useEffect, useState } from 'react';

// Helper function to generate some mock tickets for a counter
const generateMockTickets = (count: number, prefix: string) => {
  return Array.from({ length: count }, (_, i) => `${prefix}-${Math.floor(100 + Math.random() * 20) + i}`);
};

export default function DisplayPage() {
  const [officesWithCountersData, setOfficesWithCountersData] = useState<OfficeWithCounters[]>([]);

  useEffect(() => {
    const activeOffices = initialMockOffices.filter(office => office.status === 'Active');
    
    const data: OfficeWithCounters[] = activeOffices.map(office => {
      const officeCounters = initialMockCounters
        .filter(counter => counter.officeId === office.id && counter.status === 'Open')
        .map(counter => ({
          id: counter.id,
          name: counter.name,
          priority: counter.priority,
          currentTicket: Math.random() > 0.3 ? generateMockTickets(1, counter.name.substring(0,1).toUpperCase())[0] : null, // Simulate some initially serving
          nextTickets: generateMockTickets(Math.floor(2 + Math.random() * 3), counter.name.substring(0,1).toUpperCase() + counter.id.slice(-1)), // Simulate 2-4 next tickets
        }));

      return {
        id: office.id,
        name: office.name,
        address: office.address,
        counters: officeCounters,
      };
    }).filter(office => office.counters.length > 0); // Only include offices that have open counters

    setOfficesWithCountersData(data);
  }, []);


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
            <p className="text-gray-500">Please check back later or ensure offices and counters are active in the admin panel.</p>
          </div>
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        <p>Please listen for voice announcements and watch the screen for your ticket number.</p>
      </footer>
    </div>
  );
}

    