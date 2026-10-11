import { z } from 'zod';

export const studentImportSchema = z.object({
  rows: z.array(z.object({
    name: z.string().trim().min(1).max(160),
    code: z.string().trim().max(60).optional().default(''),
    email: z.string().email().optional().or(z.literal('')).default(''),
    className: z.string().trim().max(100).optional().default(''),
    sectionName: z.string().trim().max(100).optional().default(''),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }).passthrough()).min(1).max(1000),
});
