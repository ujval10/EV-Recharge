'use server';

import {
  suggestOptimalChargingTimes,
  SuggestOptimalChargingTimesInput,
  SuggestOptimalChargingTimesOutput,
} from '@/ai/flows/suggest-optimal-charging-times';
import { db } from '@/lib/firebase';
import type { Station } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  userSchedule: z.string().min(10, {
    message: "Please describe your schedule in a bit more detail.",
  }),
  chargingDuration: z.string().min(3, {
    message: "Please enter a valid charging duration (e.g., '2 hours').",
  }),
  availableSlots: z.string(),
});

type FormState = {
  message: string;
  data?: SuggestOptimalChargingTimesOutput;
  errors?: {
    userSchedule?: string[];
    chargingDuration?: string[];
  }
}

export async function getAiSuggestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    userSchedule: formData.get('userSchedule'),
    chargingDuration: formData.get('chargingDuration'),
    availableSlots: formData.get('availableSlots'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const input: SuggestOptimalChargingTimesInput = validatedFields.data;
    const result = await suggestOptimalChargingTimes(input);
    return { message: 'success', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred while getting suggestions from the AI.' };
  }
}

export async function toggleSlotAvailability(stationId: string, slotToToggle: string) {
    if (!stationId || !slotToToggle) {
        return { success: false, message: 'Invalid station or slot.' };
    }

    const stationRef = doc(db, 'stations', stationId);

    try {
        const stationSnap = await getDoc(stationRef);

        if (!stationSnap.exists()) {
            return { success: false, message: 'Station not found.' };
        }

        const stationData = stationSnap.data() as Omit<Station, 'id' | 'coordinates'> & { coordinates: any };

        const updatedSlots = stationData.slots.map(slot =>
            slot.time === slotToToggle ? { ...slot, available: !slot.available } : slot
        );
        
        // Only update the 'slots' field to avoid type conflicts with GeoPoint
        await updateDoc(stationRef, { slots: updatedSlots });
        
        return { success: true, message: `Slot ${slotToToggle} has been updated.` };
    } catch (error) {
        console.error("Error toggling slot availability:", error);
        return { success: false, message: 'Failed to update the slot. Please try again.' };
    }
}
