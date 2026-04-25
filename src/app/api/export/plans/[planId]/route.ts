import { NextResponse } from "next/server";
import { createElement } from "react";

import { PlanPdfDocument } from "@/lib/pdf/documents";
import { buildPlanPdfPath } from "@/lib/pdf/filenames";
import { renderPdfToBuffer } from "@/lib/pdf/render";
import { uploadPdfToStorage } from "@/lib/pdf/storage";
import { createNotification } from "@/lib/notifications/server";
import { normalizePlanForExport } from "@/lib/plans/export";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(_: Request, context: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "La sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
    }

    const [{ data: plan, error: planError }, { data: profile, error: profileError }] = await Promise.all([
      supabase
        .from("lesson_plans")
        .select("id,title,subject,topic,duration_minutes,objective,resources,evaluation_type,plan_json,groups(name,level)")
        .eq("id", planId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    ]);

    if (planError) {
      console.error("Error real consultando plan para PDF:", planError);
      return NextResponse.json({ message: `No fue posible cargar el plan: ${planError.message}` }, { status: 500 });
    }

    if (profileError) {
      console.error("Error real consultando perfil para PDF del plan:", profileError);
      return NextResponse.json({ message: `No fue posible cargar el perfil docente: ${profileError.message}` }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ message: "No se encontró el plan solicitado dentro de tu cuenta." }, { status: 404 });
    }

    const normalizedPlan = normalizePlanForExport(plan);

    const document = createElement(PlanPdfDocument, {
      data: {
        teacherName: profile?.full_name ?? "Docente",
        generatedAt: new Date().toISOString(),
        groupName: normalizedPlan.groupName,
        educationLevel: normalizedPlan.educationLevel,
        title: normalizedPlan.title,
        subject: normalizedPlan.subject,
        topic: normalizedPlan.topic,
        durationMinutes: normalizedPlan.durationMinutes,
        objective: normalizedPlan.objective,
        evaluationType: normalizedPlan.evaluationType,
        resources: normalizedPlan.resources,
        inicio: normalizedPlan.inicio,
        desarrollo: normalizedPlan.desarrollo,
        cierre: normalizedPlan.cierre,
        distribution: normalizedPlan.distribution,
        observations: normalizedPlan.observations,
        suggestions: normalizedPlan.suggestions,
        aiAssisted: normalizedPlan.aiAssisted,
        moments: normalizedPlan.moments,
        resourceTags: normalizedPlan.resourceTags,
        evaluationCriteria: normalizedPlan.evaluationCriteria,
        diagnosis: normalizedPlan.diagnosis,
        teacherRecommendations: normalizedPlan.teacherRecommendations,
        isReinforcement: normalizedPlan.isReinforcement,
        modality: normalizedPlan.modality
      }
    });

    const buffer = await renderPdfToBuffer(document);
    const path = buildPlanPdfPath(normalizedPlan.groupName, normalizedPlan.subject, normalizedPlan.topic);
    const upload = await uploadPdfToStorage({ supabase, path, buffer });
    await createNotification(supabase, {
      userId: user.id,
      type: "document_exported",
      title: "Documento exportado",
      message: `El plan "${normalizedPlan.title}" ya está disponible en PDF.`,
      href: "/planes"
    });

    return NextResponse.json({
      message: "Plan exportado correctamente.",
      signedUrl: upload.signedUrl,
      filename: path.split("/").filter(Boolean).pop(),
      path: upload.path
    });
  } catch (error) {
    console.error("Excepción generando PDF de plan:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible generar el documento en este intento. Intenta nuevamente."
      },
      { status: 500 }
    );
  }
}
