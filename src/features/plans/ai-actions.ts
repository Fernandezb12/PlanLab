"use server";

import { improveLessonPlanWithGemini, generateLessonPlanWithGemini } from "@/lib/gemini/education";
import { generatePlanAIInputSchema, type GeneratePlanAIInput } from "@/lib/validations/ai";

export type PlanAIActionResult =
  | {
      success: true;
      plan: Awaited<ReturnType<typeof generateLessonPlanWithGemini>>;
    }
  | {
      success: false;
      message: string;
    };

export const generatePlanWithAIAction = async (input: GeneratePlanAIInput): Promise<PlanAIActionResult> => {
  try {
    const parsed = generatePlanAIInputSchema.parse(input);
    const plan = await generateLessonPlanWithGemini(parsed);
    return { success: true, plan };
  } catch (error) {
    console.error("Error real generando plan con Gemini:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No fue posible generar el plan en este intento. Intenta nuevamente."
    };
  }
};

export const improvePlanWithAIAction = async (input: GeneratePlanAIInput): Promise<PlanAIActionResult> => {
  try {
    const parsed = generatePlanAIInputSchema.parse(input);
    const plan = await improveLessonPlanWithGemini(parsed);
    return { success: true, plan };
  } catch (error) {
    console.error("Error real mejorando plan con Gemini:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No fue posible mejorar el plan en este intento. Intenta nuevamente."
    };
  }
};
