import { z } from 'zod';

export const resourceSchema = z.object({
  name: z.string().trim().min(1).max(160),
  code: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
}).passthrough();

export function parseResourcePayload(payload) {
  return resourceSchema.parse(payload);
}
