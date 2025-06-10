'use server';

import { announceTicket, type AnnounceTicketInput, type AnnounceTicketOutput } from '@/ai/flows/voice-announcement';

export async function handleVoiceAnnouncement(input: AnnounceTicketInput): Promise<AnnounceTicketOutput> {
  try {
    // Validate input if necessary (Genkit flow already does with Zod)
    if (!input.ticketNumber || !input.counterDetails) {
      throw new Error('Ticket number and counter details are required.');
    }

    const result = await announceTicket(input);
    return result;
  } catch (error) {
    console.error('Error in handleVoiceAnnouncement server action:', error);
    // It's often better to let the caller handle UI errors,
    // but for critical failures or logging, this is useful.
    // Re-throw or return a structured error
    throw new Error(`Failed to generate voice announcement: ${error instanceof Error ? error.message : String(error)}`);
  }
}
