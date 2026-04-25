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
    "objetivo",
    "momentos",
    "criterio_evaluacion",
    "recursos_sugeridos",
    "observaciones_docentes"
  ],
  properties: {
    objetivo: { type: "string" },
    momentos: {
      type: "array",
      items: {
        type: "object",
        required: ["momento", "tiempo_min", "nombre_actividad", "descripcion", "tecnica"],
        properties: {
          momento: { type: "string", enum: ["Inicio", "Desarrollo", "Cierre", "Evaluación"] },
          tiempo_min: { type: "integer" },
          nombre_actividad: { type: "string" },
          descripcion: { type: "string" },
          tecnica: { type: "string" }
        }
      }
    },
    criterio_evaluacion: { type: "string" },
    recursos_sugeridos: {
      type: "array",
      items: { type: "string" }
    },
    observaciones_docentes: { type: "string" }
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

type GeminiPlanMoment = {
  momento: "Inicio" | "Desarrollo" | "Cierre" | "Evaluación";
  tiempo_min: number;
  nombre_actividad: string;
  descripcion: string;
  tecnica: string;
};

type GeminiLessonPlanResponse = {
  objetivo: string;
  momentos: GeminiPlanMoment[];
  criterio_evaluacion: string;
  recursos_sugeridos: string[];
  observaciones_docentes: string;
};

const adjustMomentsDistribution = (moments: GeminiPlanMoment[], targetMinutes: number) => {
  const requiredMoments: Array<GeminiPlanMoment["momento"]> = ["Inicio", "Desarrollo", "Cierre"];
  const normalizedMoments = [...moments];

  requiredMoments.forEach((requiredMoment) => {
    if (!normalizedMoments.some((moment) => moment.momento === requiredMoment)) {
      normalizedMoments.push({
        momento: requiredMoment,
        tiempo_min: requiredMoment === "Desarrollo" ? targetMinutes : 1,
        nombre_actividad: requiredMoment === "Desarrollo" ? "Actividad central" : `${requiredMoment} de la clase`,
        descripcion: requiredMoment === "Desarrollo" ? "Desarrollo guiado del propósito de aprendizaje." : "Momento pedagógico complementario.",
        tecnica: requiredMoment === "Desarrollo" ? "Trabajo guiado" : "Conversación pedagógica"
      });
    }
  });

  const total = normalizedMoments.reduce((sum, moment) => sum + moment.tiempo_min, 0);
  const difference = targetMinutes - total;
  const developmentIndex = normalizedMoments.findIndex((moment) => moment.momento === "Desarrollo");
  const targetIndex = developmentIndex >= 0 ? developmentIndex : Math.min(1, normalizedMoments.length - 1);

  return normalizedMoments.map((moment, index) => ({
    ...moment,
    tiempo_min: index === targetIndex ? Math.max(1, moment.tiempo_min + difference) : Math.max(1, moment.tiempo_min)
  }));
};

const buildLegacyPlanFromGemini = (data: GeminiLessonPlanResponse, input: GeneratePlanAIInput): LessonPlanAI => {
  const moments = adjustMomentsDistribution(data.momentos, input.durationMinutes);
  const findMoment = (name: string) => moments.find((moment) => moment.momento.toLowerCase().includes(name));
  const inicio = findMoment("inicio") ?? moments[0];
  const desarrollo = findMoment("desarrollo") ?? moments[1] ?? moments[0];
  const cierre = findMoment("cierre") ?? moments[2] ?? moments[moments.length - 1];
  const resources = data.recursos_sugeridos.length ? data.recursos_sugeridos.join(", ") : input.resources || "Recursos definidos por el docente";

  return {
    title: input.topic ? `Plan de clase: ${input.topic}` : "Plan de clase",
    subject: input.subject,
    topic: input.topic,
    duration_minutes: input.durationMinutes,
    objective: data.objetivo,
    objetivo: data.objetivo,
    evaluation_type: input.evaluationType,
    resources,
    inicio: `${inicio.nombre_actividad}: ${inicio.descripcion}`,
    desarrollo: `${desarrollo.nombre_actividad}: ${desarrollo.descripcion}`,
    cierre: `${cierre.nombre_actividad}: ${cierre.descripcion}`,
    distribucion_tiempo: {
      inicio: inicio.tiempo_min,
      desarrollo: desarrollo.tiempo_min,
      cierre: cierre.tiempo_min
    },
    momentos: moments,
    criterio_evaluacion: data.criterio_evaluacion,
    recursos_sugeridos: data.recursos_sugeridos,
    observaciones_docente: data.observaciones_docentes,
    observaciones_docentes: data.observaciones_docentes,
    sugerencias_metodologicas: data.criterio_evaluacion
  };
};

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
Eres un asistente pedagógico especializado en educación colombiana. Genera un plan de clase estructurado para docentes de básica y media.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin backticks, sin markdown.

La estructura debe ser exactamente:
{
  "objetivo": "string con el objetivo de aprendizaje completo",
  "momentos": [
    {
      "momento": "Inicio",
      "tiempo_min": número entero,
      "nombre_actividad": "nombre concreto de la actividad",
      "descripcion": "descripción detallada de la actividad",
      "tecnica": "nombre de la técnica didáctica utilizada"
    },
    {
      "momento": "Desarrollo",
      "tiempo_min": número entero,
      "nombre_actividad": "...",
      "descripcion": "...",
      "tecnica": "..."
    },
    {
      "momento": "Cierre",
      "tiempo_min": número entero,
      "nombre_actividad": "...",
      "descripcion": "...",
      "tecnica": "..."
    }
  ],
  "criterio_evaluacion": "descripción del criterio de evaluación",
  "recursos_sugeridos": ["recurso1", "recurso2", "recurso3"],
  "observaciones_docentes": "recomendaciones pedagógicas para el docente"
}

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
- Los tiempo_min de los tres momentos deben sumar exactamente ${parsedInput.durationMinutes} minutos.
- Si no suman, ajusta el tiempo del Desarrollo.
- Cada actividad debe tener un nombre descriptivo y concreto.
- Cada técnica debe ser una técnica didáctica reconocida.
- El lenguaje debe ser profesional, claro y adecuado para docentes colombianos.
- NO uses markdown en ninguna parte de la respuesta.
- NO agregues texto fuera del JSON.
`.trim();

  const rawPlan = await requestStructuredGemini<GeminiLessonPlanResponse>({
    prompt,
    responseJsonSchema: lessonPlanJsonSchema
  });

  const validatedPlan = lessonPlanAISchema.parse(normalizeLessonPlanResponse(buildLegacyPlanFromGemini(rawPlan, parsedInput)));
  return adjustTimeDistribution(validatedPlan, parsedInput.durationMinutes);
};

export const improveLessonPlanWithGemini = async (input: GeneratePlanAIInput): Promise<LessonPlanAI> => {
  const parsedInput = generatePlanAIInputSchema.parse(input);
  const prompt = `
Eres un asistente pedagógico especializado en educación colombiana. Mejora un plan de clase existente para docentes de básica y media.

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin backticks, sin markdown.

La estructura debe ser exactamente:
{
  "objetivo": "string con el objetivo de aprendizaje completo",
  "momentos": [
    {
      "momento": "Inicio",
      "tiempo_min": número entero,
      "nombre_actividad": "nombre concreto de la actividad",
      "descripcion": "descripción detallada de la actividad",
      "tecnica": "nombre de la técnica didáctica utilizada"
    },
    {
      "momento": "Desarrollo",
      "tiempo_min": número entero,
      "nombre_actividad": "...",
      "descripcion": "...",
      "tecnica": "..."
    },
    {
      "momento": "Cierre",
      "tiempo_min": número entero,
      "nombre_actividad": "...",
      "descripcion": "...",
      "tecnica": "..."
    }
  ],
  "criterio_evaluacion": "descripción del criterio de evaluación",
  "recursos_sugeridos": ["recurso1", "recurso2", "recurso3"],
  "observaciones_docentes": "recomendaciones pedagógicas para el docente"
}

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
- Los tiempo_min de los tres momentos deben sumar exactamente ${parsedInput.durationMinutes} minutos.
- Si no suman, ajusta el tiempo del Desarrollo.
- Cada actividad debe tener un nombre descriptivo y concreto.
- Cada técnica debe ser una técnica didáctica reconocida.
- El lenguaje debe ser profesional, claro y adecuado para docentes colombianos.
- NO uses markdown en ninguna parte de la respuesta.
- NO agregues texto fuera del JSON.
`.trim();

  const rawPlan = await requestStructuredGemini<GeminiLessonPlanResponse>({
    prompt,
    responseJsonSchema: lessonPlanJsonSchema
  });

  const validatedPlan = lessonPlanAISchema.parse(normalizeLessonPlanResponse(buildLegacyPlanFromGemini(rawPlan, parsedInput)));
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
