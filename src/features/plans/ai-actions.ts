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

const getGeminiErrorText = (error: unknown) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    return [record.message, record.status, record.code, record.details]
      .filter((value) => typeof value === "string" || typeof value === "number")
      .join(" ");
  }

  return "";
};

const normalizePlanAIErrorMessage = (error: unknown) => {
  const text = getGeminiErrorText(error).toLowerCase();

  if (
    text.includes("503") ||
    text.includes("unavailable") ||
    text.includes("high demand") ||
    text.includes("temporarily unavailable")
  ) {
    return "El servicio de IA está presentando alta demanda temporal. Intenta nuevamente en unos momentos.";
  }

  if (
    text.includes("timeout") ||
    text.includes("timed out") ||
    text.includes("network") ||
    text.includes("fetch failed") ||
    text.includes("econnreset")
  ) {
    return "La generación está tardando más de lo habitual por una conexión temporalmente inestable. Intenta nuevamente en unos momentos.";
  }

  return "No fue posible generar la propuesta en este momento. Intenta nuevamente en unos instantes.";
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
      message: normalizePlanAIErrorMessage(error)
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
      message: normalizePlanAIErrorMessage(error)
    };
  }
};
