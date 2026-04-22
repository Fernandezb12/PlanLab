import { getGeminiClient, getGeminiModel } from "@/lib/gemini/client";
import { getEvaluationTypeLabel, normalizeEvaluationType } from "@/lib/validations/plans";
import {
  generatePlanAIInputSchema,
  generateReinforcementInputSchema,
  lessonPlanAISchema,
  reinforcementAISchema,
  type GeneratePlanAIInput,
  type GenerateReinforcementInput,
  type LessonPlanAI,
  type ReinforcementPlanAI
} from "@/lib/validations/ai";

const lessonPlanJsonSchema = {
  type: "object",
  required: [
    "title",
    "subject",
    "topic",
    "duration_minutes",
    "objective",
    "evaluation_type",
    "resources",
    "inicio",
    "desarrollo",
    "cierre",
    "distribucion_tiempo"
  ],
  properties: {
    title: { type: "string" },
    subject: { type: "string" },
    topic: { type: "string" },
    duration_minutes: { type: "integer" },
    objective: { type: "string" },
    evaluation_type: { type: "string" },
    resources: { type: "string" },
    inicio: { type: "string" },
    desarrollo: { type: "string" },
    cierre: { type: "string" },
    distribucion_tiempo: {
      type: "object",
      required: ["inicio", "desarrollo", "cierre"],
      properties: {
        inicio: { type: "integer" },
        desarrollo: { type: "integer" },
        cierre: { type: "integer" }
      }
    },
    observaciones_docente: { type: "string" },
    sugerencias_metodologicas: { type: "string" }
  }
} as const;

const reinforcementJsonSchema = {
  type: "object",
  required: [
    "objective_refuerzo",
    "breve_diagnostico",
    "inicio",
    "desarrollo",
    "cierre",
    "distribucion_tiempo",
    "recursos",
    "criterio_evaluacion",
    "recomendaciones_docente"
  ],
  properties: {
    objective_refuerzo: { type: "string" },
    breve_diagnostico: { type: "string" },
    inicio: { type: "string" },
    desarrollo: { type: "string" },
    cierre: { type: "string" },
    distribucion_tiempo: {
      type: "object",
      required: ["inicio", "desarrollo", "cierre"],
      properties: {
        inicio: { type: "integer" },
        desarrollo: { type: "integer" },
        cierre: { type: "integer" }
      }
    },
    recursos: { type: "string" },
    criterio_evaluacion: { type: "string" },
    recomendaciones_docente: { type: "string" }
  }
} as const;

const adjustTimeDistribution = <T extends { duration_minutes?: number; distribucion_tiempo: { inicio: number; desarrollo: number; cierre: number } }>(
  data: T,
  targetMinutes: number
): T => {
  const total = data.distribucion_tiempo.inicio + data.distribucion_tiempo.desarrollo + data.distribucion_tiempo.cierre;
  const difference = targetMinutes - total;

  return {
    ...data,
    duration_minutes: targetMinutes,
    distribucion_tiempo: {
      ...data.distribucion_tiempo,
      desarrollo: Math.max(1, data.distribucion_tiempo.desarrollo + difference)
    }
  };
};

const adjustReinforcementDistribution = (data: ReinforcementPlanAI, targetMinutes: number) => {
  const total = data.distribucion_tiempo.inicio + data.distribucion_tiempo.desarrollo + data.distribucion_tiempo.cierre;
  const difference = targetMinutes - total;

  return {
    ...data,
    distribucion_tiempo: {
      ...data.distribucion_tiempo,
      desarrollo: Math.max(1, data.distribucion_tiempo.desarrollo + difference)
    }
  };
};

const cleanJsonText = (value: string) => value.trim().replace(/^```json\s*/i, "").replace(/^```/, "").replace(/```$/, "").trim();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractGeminiErrorText = (error: unknown): string => {
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

const isTemporaryGeminiError = (error: unknown) => {
  const text = extractGeminiErrorText(error).toLowerCase();

  return (
    text.includes("503") ||
    text.includes("unavailable") ||
    text.includes("high demand") ||
    text.includes("timeout") ||
    text.includes("timed out") ||
    text.includes("network") ||
    text.includes("fetch failed") ||
    text.includes("econnreset") ||
    text.includes("temporarily unavailable")
  );
};

const normalizeLessonPlanResponse = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const response = payload as Record<string, unknown>;
  return {
    ...response,
    evaluation_type: normalizeEvaluationType(response.evaluation_type) ?? response.evaluation_type
  };
};

const requestStructuredGemini = async <T>({
  prompt,
  responseJsonSchema
}: {
  prompt: string;
  responseJsonSchema: object;
}) => {
  const client = getGeminiClient();
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await client.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema,
          temperature: 0.5
        }
      });

      const rawText = response.text;

      if (!rawText) {
        throw new Error("Gemini no devolvió contenido utilizable.");
      }

      return JSON.parse(cleanJsonText(rawText)) as T;
    } catch (error) {
      lastError = error;

      if (attempt === 0 && isTemporaryGeminiError(error)) {
        await delay(1200);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

export const generateLessonPlanWithGemini = async (input: GeneratePlanAIInput): Promise<LessonPlanAI> => {
  const parsedInput = generatePlanAIInputSchema.parse(input);
  const prompt = `
Eres un asistente pedagógico de PlanLab.
Genera un plan de clase formal, claro y aplicable para un docente.

Debes responder exclusivamente con JSON válido y sin texto adicional.
Usa español neutro y tono profesional.
La distribución del tiempo debe sumar exactamente ${parsedInput.durationMinutes} minutos.

Contexto del docente:
- Grupo: ${parsedInput.groupName}
- Nivel educativo: ${parsedInput.educationLevel || "No especificado"}
- Área: ${parsedInput.subject}
- Tema: ${parsedInput.topic}
- Duración: ${parsedInput.durationMinutes} minutos
- Objetivo: ${parsedInput.objective}
- Tipo de evaluación interno: ${parsedInput.evaluationType}
- Etiqueta visible del tipo de evaluación: ${getEvaluationTypeLabel(parsedInput.evaluationType)}
- Recursos disponibles: ${parsedInput.resources || "Sin recursos especificados"}
- Contexto adicional: ${parsedInput.context || "Sin contexto adicional"}

Instrucciones:
- Devuelve un plan coherente con el grupo y el tiempo disponible.
- El campo "evaluation_type" debe usar exactamente uno de estos valores internos: diagnostica, formativa, sumativa, observacion, otra.
- "inicio", "desarrollo" y "cierre" deben ser redactados como bloques pedagógicos utilizables.
- "resources" debe ser un texto breve, claro y útil.
- Si agregas observaciones o sugerencias, manténlas concisas.
`.trim();

  const rawPlan = await requestStructuredGemini<LessonPlanAI>({
    prompt,
    responseJsonSchema: lessonPlanJsonSchema
  });

  const validatedPlan = lessonPlanAISchema.parse(normalizeLessonPlanResponse(rawPlan));
  return adjustTimeDistribution(validatedPlan, parsedInput.durationMinutes);
};

export const improveLessonPlanWithGemini = async (input: GeneratePlanAIInput): Promise<LessonPlanAI> => {
  const parsedInput = generatePlanAIInputSchema.parse(input);
  const prompt = `
Eres un asistente pedagógico de PlanLab.
Vas a mejorar un plan de clase existente manteniendo su intención pedagógica, pero optimizando redacción, secuencia y distribución del tiempo.

Debes responder exclusivamente con JSON válido y sin texto adicional.
Usa español neutro y tono profesional.
La distribución del tiempo debe sumar exactamente ${parsedInput.durationMinutes} minutos.

Contexto del plan:
- Grupo: ${parsedInput.groupName}
- Nivel educativo: ${parsedInput.educationLevel || "No especificado"}
- Área: ${parsedInput.subject}
- Tema: ${parsedInput.topic}
- Duración: ${parsedInput.durationMinutes} minutos
- Objetivo: ${parsedInput.objective}
- Tipo de evaluación interno: ${parsedInput.evaluationType}
- Etiqueta visible del tipo de evaluación: ${getEvaluationTypeLabel(parsedInput.evaluationType)}
- Recursos disponibles: ${parsedInput.resources || "Sin recursos especificados"}
- Título actual: ${parsedInput.existingPlanTitle || "Sin título"}
- Contexto adicional: ${parsedInput.context || "Sin contexto adicional"}

Plan actual en JSON:
${JSON.stringify(parsedInput.existingPlanJson ?? {}, null, 2)}

Instrucciones:
- Mejora la claridad pedagógica y la secuencia didáctica.
- Ajusta las actividades al tiempo disponible.
- Mantén una estructura utilizable por el docente.
- El campo "evaluation_type" debe usar exactamente uno de estos valores internos: diagnostica, formativa, sumativa, observacion, otra.
- No agregues explicaciones fuera del JSON.
`.trim();

  const rawPlan = await requestStructuredGemini<LessonPlanAI>({
    prompt,
    responseJsonSchema: lessonPlanJsonSchema
  });

  const validatedPlan = lessonPlanAISchema.parse(normalizeLessonPlanResponse(rawPlan));
  return adjustTimeDistribution(validatedPlan, parsedInput.durationMinutes);
};

export const generateReinforcementWithGemini = async (input: GenerateReinforcementInput): Promise<ReinforcementPlanAI> => {
  const parsedInput = generateReinforcementInputSchema.parse(input);
  const prompt = `
Eres un asistente pedagógico de PlanLab.
Debes proponer una estrategia de refuerzo académica, concreta y aplicable para un docente.

Responde exclusivamente con JSON válido y sin texto adicional.
Usa español neutro y tono profesional.
La distribución del tiempo debe sumar exactamente ${parsedInput.durationMinutes} minutos.

Contexto:
- Grupo: ${parsedInput.groupName}
- Nivel educativo: ${parsedInput.educationLevel || "No especificado"}
- Área: ${parsedInput.subject}
- Tema: ${parsedInput.topic}
- Actividad asociada: ${parsedInput.activityTitle || "No aplica"}
- Promedio actual: ${parsedInput.averageScore ?? "Sin dato"}
- Asistencia promedio: ${parsedInput.attendanceRate ?? "Sin dato"}
- Resumen del desempeño: ${parsedInput.lowPerformanceSummary || "No especificado"}
- Observaciones registradas: ${parsedInput.observations.length ? parsedInput.observations.join(" | ") : "Sin observaciones"}

Instrucciones:
- Propón una estrategia de superación realista para una sola sesión.
- El diagnóstico debe ser breve y útil.
- "inicio", "desarrollo" y "cierre" deben ser accionables.
- "recursos" y "criterio_evaluacion" deben quedar listos para uso docente.
`.trim();

  const rawStrategy = await requestStructuredGemini<ReinforcementPlanAI>({
    prompt,
    responseJsonSchema: reinforcementJsonSchema
  });

  const validatedStrategy = reinforcementAISchema.parse(rawStrategy);
  return adjustReinforcementDistribution(validatedStrategy, parsedInput.durationMinutes);
};
