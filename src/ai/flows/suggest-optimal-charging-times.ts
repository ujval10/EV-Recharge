// src/ai/flows/suggest-optimal-charging-times.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow that suggests optimal charging times
 *  based on the user's schedule and real-time availability.
 *
 * - suggestOptimalChargingTimes - A function that suggests optimal charging times.
 * - SuggestOptimalChargingTimesInput - The input type for the suggestOptimalChargingTimes function.
 * - SuggestOptimalChargingTimesOutput - The return type for the suggestOptimalChargingTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalChargingTimesInputSchema = z.object({
  userSchedule: z
    .string()
    .describe(
      'The user schedule, as a string. Include specific times of day, and days of the week. Provide specific times, not ranges.'
    ),
  availableSlots: z
    .string()
    .describe(
      'The available time slots at the charging station, as a comma-separated string.'
    ),
  chargingDuration: z
    .string()
    .describe(
      'The duration of the charging session required, as a string. e.g., "2 hours".'
    ),
});
export type SuggestOptimalChargingTimesInput = z.infer<
  typeof SuggestOptimalChargingTimesInputSchema
>;

const SuggestOptimalChargingTimesOutputSchema = z.object({
  suggestedChargingTimes: z
    .string()
    .describe(
      'The suggested optimal charging time. If multiple options exist, suggest the best one. If no suitable slot is found, say so.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested charging time. Explain why it fits the user schedule and duration, and why other times were ruled out. Be helpful and conversational.'
    ),
});
export type SuggestOptimalChargingTimesOutput = z.infer<
  typeof SuggestOptimalChargingTimesOutputSchema
>;

export async function suggestOptimalChargingTimes(
  input: SuggestOptimalChargingTimesInput
): Promise<SuggestOptimalChargingTimesOutput> {
  return suggestOptimalChargingTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalChargingTimesPrompt',
  input: {schema: SuggestOptimalChargingTimesInputSchema},
  output: {schema: SuggestOptimalChargingTimesOutputSchema},
  prompt: `You are an intelligent AI assistant helping a user find the perfect time to charge their EV. Your goal is to be as helpful as possible.

  Analyze the user's schedule, the list of available charging slots, and their required charging duration.

  Your task:
  1. Find the most optimal time slot that fits the user's schedule and charging duration.
  2. If there are multiple good options, recommend the best one that minimizes disruption to their day.
  3. Provide a clear, friendly, and concise reasoning for your suggestion. Explain why the chosen time works and briefly mention why other available times might be less ideal (e.g., "10:00 AM is available, but it might clash with your morning meeting.").
  4. If no suitable slot is available, clearly state that and explain why (e.g., "No 2-hour slots are available that don't conflict with your scheduled events.").

  User's Schedule: {{{userSchedule}}}
  Available Charging Slots: {{{availableSlots}}}
  Required Charging Duration: {{{chargingDuration}}}
  `,
});

const suggestOptimalChargingTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalChargingTimesFlow',
    inputSchema: SuggestOptimalChargingTimesInputSchema,
    outputSchema: SuggestOptimalChargingTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
