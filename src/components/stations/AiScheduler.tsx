'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAiSuggestion } from '@/app/actions';
import { Bot, Loader2, Sparkles } from 'lucide-react';

interface AiSchedulerProps {
  availableSlots: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export default function AiScheduler({ availableSlots }: AiSchedulerProps) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(getAiSuggestion, initialState);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot className="w-6 h-6" />
          AI-Powered Scheduling
        </CardTitle>
        <CardDescription>
          Let our AI find the best charging time for you. Just describe your schedule.
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          <input type="hidden" name="availableSlots" value={availableSlots} />
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="userSchedule">Your Schedule</Label>
            <Textarea
              id="userSchedule"
              name="userSchedule"
              placeholder="e.g., 'I have a meeting from 10 AM to 11 AM, and a lunch break at 1 PM.'"
              required
            />
            {state.errors?.userSchedule && (
              <p className="text-sm text-destructive">{state.errors.userSchedule[0]}</p>
            )}
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="chargingDuration">Charging Time Needed</Label>
            <Input
              id="chargingDuration"
              name="chargingDuration"
              placeholder="e.g., '2 hours'"
              required
            />
            {state.errors?.chargingDuration && (
              <p className="text-sm text-destructive">{state.errors.chargingDuration[0]}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <SubmitButton />
          {state.message && state.message !== 'success' && <p className="mt-2 text-sm text-destructive">{state.message}</p>}
        </CardFooter>
      </form>

      {state.data && (
        <CardContent className="mt-4 border-t pt-6">
          <h4 className="font-semibold mb-2">AI Suggestion ✨</h4>
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div>
                <p className="font-semibold">Suggested Time:</p>
                <p>{state.data.suggestedChargingTimes}</p>
            </div>
             <div>
                <p className="font-semibold">Reasoning:</p>
                <p className="text-sm text-muted-foreground">{state.data.reasoning}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
