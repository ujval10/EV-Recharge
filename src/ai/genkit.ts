import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyCKhF1zoWclMIzcfKG2RXnCjQz1-TRfQvw',
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
