import { z } from 'zod';

export const logInteractionSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
    targetId: z.string().min(1, 'targetId is required'),
    actionType: z.enum(['like', 'comment', 'share', 'view', 'bookmark', 'follow']),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export type LogInteractionInput = z.infer<typeof logInteractionSchema>['body'];
