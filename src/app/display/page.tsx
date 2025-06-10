
'use client';

import { QueueBoard, type OfficeWithCountersAndTickets } from '@/components/display/queue-board';
import { SiteLogo } from '@/components/shared/site-logo';
import { TvIcon, BuildingIcon } from 'lucide-react';
import type { Office } from '@/app/admin/offices/page';
import type { Counter } from '@/app/admin/counters/page';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Duplicating Ticket interface here for clarity, ensure it matches staff dashboard's
interface Ticket {
  id: string;
  number: string;
  service: string;
  officeId: string;
  counterId: string; // Crucial for matching to the right counter
  timestamp: number;
  // timeWaiting is not usually stored, but calculated for display
}

interface QueueItemForDisplay { // For the general queue list
  id: string;
  number: string;
  service: string;
  officeId: string;
  timestamp: number;
}


function DisplayPageContent() {
  const [officesWithCountersData, setOfficesWithCountersData] = useState<OfficeWithCountersAndTickets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayTitle, setDisplayTitle] = useState("Live Queue Display");

  const searchParams = useSearchParams();
  const filterOfficeId = searchParams.get('officeId');

  useEffect(() => {
    const loadAndProcessData = () => {
      let storedOfficesRaw, storedCountersRaw, storedQueueRaw;
      try {
        storedOfficesRaw = localStorage.getItem('appOffices');
        storedCountersRaw = localStorage.getItem('appCounters');
        storedQueueRaw = localStorage.getItem('appQueue'); // General queue of waiting tickets
      } catch (e) {
        console.error("Error accessing localStorage:", e);
        setIsLoading(false);
        return;
      }
      
      const allOffices: Office[] = storedOfficesRaw ? JSON.parse(storedOfficesRaw) : [];
      const allCounters: Counter[] = storedCountersRaw ? JSON.parse(storedCountersRaw) : [];
      const generalQueue: QueueItemForDisplay[] = storedQueueRaw ? JSON.parse(storedQueueRaw) : [];

      let activeOffices = allOffices.filter(office => office.status === 'Active');
      let currentDisplayTitle = "Live Queue Display";

      if (filterOfficeId) {
        const filteredOffice = activeOffices.find(office => office.id === filterOfficeId);
        if (filteredOffice) {
          activeOffices = [filteredOffice];
          currentDisplayTitle = `Live Queue Display - ${filteredOffice.name}`;
        } else {
          activeOffices = []; 
          currentDisplayTitle = `Live Queue Display - Office Not Found`;
        }
      }
      setDisplayTitle(currentDisplayTitle);
      
      const data: OfficeWithCountersAndTickets[] = activeOffices.map(office => {
        const officeCounters = allCounters
          .filter(counter => counter.officeId === office.id && counter.status === 'Open')
          .map(counter => {
            // Key for the ticket currently being served AT THIS SPECIFIC counter
            const currentTicketKey = `appCurrentTicket-${office.id}-${counter.id}`;
            const storedCurrentTicket = localStorage.getItem(currentTicketKey);
            let currentTicketObj: Ticket | null = null;

            if(storedCurrentTicket) {
                try {
                    const parsed: Ticket = JSON.parse(storedCurrentTicket);
                    // Validate that this ticket actually belongs to this specific counter
                    if(parsed.officeId === office.id && parsed.counterId === counter.id) {
                        currentTicketObj = parsed;
                    } else {
                        // console.warn(`Stale/mismatched ticket for key ${currentTicketKey}. Expected office ${office.id}/counter ${counter.id}, got office ${parsed.officeId}/counter ${parsed.counterId}`);
                        localStorage.removeItem(currentTicketKey); // Clean up stale/mismatched ticket
                    }
                } catch (e) { 
                    // console.error(`Error parsing current ticket for key ${currentTicketKey}:`, e);
                    localStorage.removeItem(currentTicketKey); // Clean up unparseable ticket
                }
            }

            // Filter general queue for tickets belonging to this office, not currently served
            const nextTicketsForCounterOffice = generalQueue
              .filter(t => t.officeId === office.id && t.id !== currentTicketObj?.id)
              .sort((a,b) => a.timestamp - b.timestamp)
              .map(t => t.number)
              .slice(0, 4); // Show next few tickets for the office (not specific to counter for "Next Up")

            return {
              id: counter.id,
              name: counter.name,
              priority: counter.priority,
              currentTicket: currentTicketObj ? currentTicketObj.number : null,
              nextTickets: nextTicketsForCounterOffice, // These are for the office pool
            };
          });

        return {
          id: office.id,
          name: office.name,
          address: office.address,
          counters: officeCounters,
        };
      }).filter(office => office.counters.length > 0 || (filterOfficeId && office.id === filterOfficeId));

      setOfficesWithCountersData(data);
      setIsLoading(false);
    };

    loadAndProcessData();
    const intervalId = setInterval(loadAndProcessData, 3000); // Refresh slightly faster
    return () => clearInterval(intervalId);
  }, [filterOfficeId]);


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
        <div className="flex items-center gap-2 text-right">
          <TvIcon className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-headline">{displayTitle}</h1>
        </div>
      </header>
      <main className="flex-grow">
        {officesWithCountersData.length > 0 ? (
          <QueueBoard officesWithCounters={officesWithCountersData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BuildingIcon className="h-24 w-24 text-gray-600 mb-4" />
            <h2 className="text-3xl font-semibold text-gray-400 mb-2">
              {filterOfficeId ? "No Active Counters for This Office" : "No Active Offices or Counters"}
            </h2>
            <p className="text-gray-500">
              {filterOfficeId
                ? "Please ensure counters are open for this office in the admin panel."
                : "Please add and activate offices and counters in the admin panel."
              }
            </p>
          </div>
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        <p>Please listen for voice announcements and watch the screen for your ticket number.</p>
      </footer>
    </div>
  );
}


export default function DisplayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 md:p-8 items-center justify-center">
        <TvIcon className="h-16 w-16 animate-pulse text-primary" />
        <p className="mt-4 text-xl">Loading Queue Display...</p>
      </div>
    }>
      <DisplayPageContent />
    </Suspense>
  );
}
