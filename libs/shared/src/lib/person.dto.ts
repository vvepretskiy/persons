import { z } from 'zod';

export const PersonSchema = z.object({
  name: z.string(),
  birth_year: z.string(),
  homeworld: z.string(),
  terrain: z.string(),
  height: z.string(),
});

export type Person = z.infer<typeof PersonSchema>;
