
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarIcon, ChevronRightIcon, BuildingIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DisplayCounter {
  id: string;
  name: string;
  currentTicket: string | null;
  priority: boolean;
  nextTickets: string[];
}

export interface OfficeWithCounters {
  id: string;
  name: string;
  address: string;
  counters: DisplayCounter[];
}

interface QueueBoardProps {
  officesWithCounters: OfficeWithCounters[];
}

export function QueueBoard({ officesWithCounters: initialData }: QueueBoardProps) {
  const [officesData, setOfficesData] = useState(initialData);
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    // Ensure initialData is passed correctly and updates state
    setOfficesData(initialData);
  }, [initialData]);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateCurrentTime(); 
    const timer = setInterval(updateCurrentTime, 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfficesData(prevOfficesData => 
        prevOfficesData.map(office => ({
          ...office,
          counters: office.counters.map(counter => {
            let newCurrentTicket = counter.currentTicket;
            let newNextTickets = [...counter.nextTickets];

            if (Math.random() < 0.15) { // Chance to advance a ticket
              if (newNextTickets.length > 0) {
                newCurrentTicket = newNextTickets.shift() || null;
              } else if (newCurrentTicket && Math.random() < 0.3) { // Chance to clear current ticket if no next
                newCurrentTicket = null;
              }
            }
            
            if (Math.random() < 0.1 && newNextTickets.length < 5) { // Chance to add a new ticket to queue
               const prefix = counter.name.substring(0,1).toUpperCase() + office.name.substring(0,1).toUpperCase();
               const newTicketNumber = `${prefix}-${Math.floor(100 + Math.random() * 899)}`;
               newNextTickets.push(newTicketNumber);
            }

            return {
              ...counter,
              currentTicket: newCurrentTicket,
              nextTickets: newNextTickets.slice(-5), // Keep last 5
            };
          })
        }))
      );
    }, 7000); // Update every 7 seconds

    return () => clearInterval(interval);
  }, []);

  if (!officesData || officesData.length === 0) {
    return (
      <div className="text-center py-10">
        <BuildingIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl text-gray-400">No office data to display.</p>
        <p className="text-gray-500">Please ensure offices and counters are configured and active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {officesData.map((office) => (
        <section key={office.id} aria-labelledby={`office-title-${office.id}`}>
          <div className="flex items-center gap-3 mb-4">
            <BuildingIcon className="h-8 w-8 text-primary" />
            <h2 id={`office-title-${office.id}`} className="text-3xl font-semibold text-primary">{office.name}</h2>
          </div>
          {office.counters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {office.counters.map((counter) => (
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
                              <li key={`${counter.id}-next-${index}`} className="flex items-center text-base md:text-lg text-gray-300">
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
          ) : (
            <p className="text-center text-gray-400 py-4">No active counters for this office.</p>
          )}
        </section>
      ))}
    </div>
  );
}

    