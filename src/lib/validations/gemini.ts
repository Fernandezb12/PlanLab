import { z } from "zod";

export const lessonPlanSchema = z.object({
  title: z.string().min(5),
  objective: z.string().min(10),
  activities: z.array(z.object({ name: z.string(), durationMinutes: z.number().int().positive() })).min(1),
  assessment: z.string().min(10)
});

export type LessonPlan = z.infer<typeof lessonPlanSchema>;

export const safeParseLessonPlan = (payload: unknown) => {
  const result = lessonPlanSchema.safeParse(payload);
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.flatten().fieldErrors
    };
  }

  return { success: true as const, data: result.data };
};
