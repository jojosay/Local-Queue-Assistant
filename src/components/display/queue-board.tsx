
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarIcon, ChevronRightIcon, BuildingIcon, TvIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DisplayCounterData {
  id: string;
  name: string;
  currentTicket: string | null;
  priority: boolean;
  nextTickets: string[];
}

export interface OfficeWithCountersAndTickets {
  id: string;
  name: string;
  address: string;
  counters: DisplayCounterData[];
}

interface QueueBoardProps {
  officesWithCounters: OfficeWithCountersAndTickets[];
}

export function QueueBoard({ officesWithCounters }: QueueBoardProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    // Client-side effect to update current time
    const updateCurrentTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateCurrentTime(); 
    const timer = setInterval(updateCurrentTime, 60000); 
    return () => clearInterval(timer);
  }, []);


  if (!officesWithCounters || officesWithCounters.length === 0) {
    return (
      <div className="text-center py-10">
        <TvIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl text-gray-400">No active queue data to display.</p>
        <p className="text-gray-500">Ensure offices and counters are active and tickets are being processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {officesWithCounters.map((office) => (
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
                              <li key={`${counter.id}-next-${ticket}-${index}`} className="flex items-center text-base md:text-lg text-gray-300">
                                <ChevronRightIcon className="h-5 w-5 mr-1 text-gray-400" /> 
                                {ticket}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                     {counter.nextTickets.length === 0 && !counter.currentTicket && (
                        <p className="text-center text-sm text-gray-400 pt-2">No tickets waiting for this counter.</p>
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
