import { z } from 'zod';

export const attendanceQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  className: z.string().trim().min(1),
  sectionName: z.string().trim().min(1),
});

export const attendanceBatchSchema = attendanceQuerySchema.extend({
  entries: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().max(300).optional(),
  })).min(1),
});