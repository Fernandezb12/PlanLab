import { safeParseLessonPlan } from "@/lib/validations/gemini";

export const parseLessonPlanFromGemini = (rawResponse: unknown) => {
  const parsed = safeParseLessonPlan(rawResponse);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "La respuesta de Gemini no cumple el esquema esperado.",
      details: parsed.error
    };
  }

  return { ok: true as const, data: parsed.data };
};
