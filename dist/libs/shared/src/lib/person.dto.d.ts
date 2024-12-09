import { z } from 'zod';
export declare const PersonSchema: z.ZodObject<{
    name: z.ZodString;
    birth_year: z.ZodString;
    homeworld: z.ZodString;
    terrain: z.ZodString;
    height: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    birth_year: string;
    homeworld: string;
    terrain: string;
    height: string;
}, {
    name: string;
    birth_year: string;
    homeworld: string;
    terrain: string;
    height: string;
}>;
export type Person = z.infer<typeof PersonSchema>;
