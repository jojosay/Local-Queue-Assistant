
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Counter {
  id: string;
  name: string;
  currentTicket: string | null;
  priority: boolean;
  nextTickets: string[];
}

interface QueueBoardProps {
  counters: Counter[];
}

export function QueueBoard({ counters: initialCounters }: QueueBoardProps) {
  const [counters, setCounters] = useState(initialCounters);
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateCurrentTime(); // Initial call
    const timer = setInterval(updateCurrentTime, 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);


  // Simulate data updates (e.g., via WebSockets or polling in a real app)
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prevCounters => 
        prevCounters.map(counter => {
          // Simple simulation: occasionally advance a ticket or change one
          if (Math.random() < 0.1 && counter.nextTickets.length > 0) {
            const nextTicket = counter.nextTickets[0];
            return {
              ...counter,
              currentTicket: nextTicket,
              nextTickets: counter.nextTickets.slice(1),
            };
          }
          // Simulate adding a new ticket to queue
          if (Math.random() < 0.05) {
             const prefix = counter.name.substring(0,1).toUpperCase();
             const newTicketNumber = `${prefix}-${Math.floor(500 + Math.random() * 499)}`;
             return {
                ...counter,
                nextTickets: [...counter.nextTickets, newTicketNumber].slice(-5) // Keep last 5
             }
          }
          return counter;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {counters.map((counter) => (
        <Card 
            key={counter.id} 
            className={`
                ${counter.currentTicket ? 'bg-green-600/20 border-green-500' : 'bg-slate-700/30 border-slate-600'} 
                text-white shadow-lg rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02]
            `}
        >
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl md:text-2xl font-semibold flex items-center">
                {counter.priority && <StarIcon className="h-5 w-5 text-yellow-400 mr-2 fill-yellow-400" />}
                {counter.name}
              </CardTitle>
              {currentTime && <span className="text-sm text-gray-300">{currentTime}</span>}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-center py-4 md:py-6 my-2 md:my-3 bg-black/20 rounded-lg">
              <p className="text-xs md:text-sm text-gray-300 uppercase tracking-wider">Now Serving</p>
              <p className={`text-4xl md:text-6xl font-bold my-1 ${counter.currentTicket ? 'text-yellow-300 animate-pulse' : 'text-gray-400'}`}>
                {counter.currentTicket || '- - -'}
              </p>
            </div>
            
            {counter.nextTickets.length > 0 && (
              <>
                <Separator className="my-3 md:my-4 bg-gray-600" />
                <div>
                  <h4 className="text-sm md:text-base font-medium text-gray-200 mb-2">Next Up:</h4>
                  <ul className="space-y-1">
                    {counter.nextTickets.slice(0,3).map((ticket, index) => (
                      <li key={index} className="flex items-center text-base md:text-lg text-gray-300">
                        <ChevronRightIcon className="h-5 w-5 mr-1 text-gray-400" /> 
                        {ticket}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
