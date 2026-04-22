"use server";

import { generateReinforcementWithGemini } from "@/lib/gemini/education";
import { generateReinforcementInputSchema, type GenerateReinforcementInput, type ReinforcementPlanAI } from "@/lib/validations/ai";

export type ReinforcementAIActionResult =
  | {
      success: true;
      strategy: ReinforcementPlanAI;
    }
  | {
      success: false;
      message: string;
    };

export const generateReinforcementAIAction = async (input: GenerateReinforcementInput): Promise<ReinforcementAIActionResult> => {
  try {
    const parsed = generateReinforcementInputSchema.parse(input);
    const strategy = await generateReinforcementWithGemini(parsed);
    return { success: true, strategy };
  } catch (error) {
    console.error("Error real generando estrategia de refuerzo con Gemini:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "No fue posible generar el contenido en este intento. Intenta nuevamente."
    };
  }
};
