
import { QueueBoard } from '@/components/display/queue-board';
import { SiteLogo } from '@/components/shared/site-logo';
import { TvIcon } from 'lucide-react';

export default function DisplayPage() {
  // Mock data, in a real app this would come from a live data source
  const countersData = [
    { 
      id: 'counter1', 
      name: 'Counter 1', 
      currentTicket: 'A-101', 
      priority: false,
      nextTickets: ['A-102', 'A-103'] 
    },
    { 
      id: 'counter2', 
      name: 'Counter 2 (Priority)', 
      currentTicket: 'P-05', 
      priority: true,
      nextTickets: ['P-06', 'B-201'] 
    },
    { 
      id: 'counter3', 
      name: 'Counter 3', 
      currentTicket: 'C-315', 
      priority: false,
      nextTickets: ['C-316', 'C-317', 'C-318'] 
    },
     { 
      id: 'counter4', 
      name: 'Counter 4', 
      currentTicket: null, // No one being served
      priority: false,
      nextTickets: ['D-401', 'D-402'] 
    },
  ];

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
        <QueueBoard counters={countersData} />
      </main>
      <footer className="mt-8 text-center text-sm text-gray-400">
        <p>Please listen for voice announcements and watch the screen for your ticket number.</p>
      </footer>
    </div>
  );
}
