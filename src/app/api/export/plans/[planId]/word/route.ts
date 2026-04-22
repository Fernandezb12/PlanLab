import { NextResponse } from "next/server";

import { buildPlanWordFilename } from "@/lib/pdf/filenames";
import { createNotification } from "@/lib/notifications/server";
import { normalizePlanForExport } from "@/lib/plans/export";
import { createClient } from "@/lib/supabase/server";
import { buildPlanWordBuffer } from "@/lib/word/plan-document";

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
      console.error("Error real consultando plan para Word:", planError);
      return NextResponse.json({ message: `No fue posible cargar el plan: ${planError.message}` }, { status: 500 });
    }

    if (profileError) {
      console.error("Error real consultando perfil para Word del plan:", profileError);
      return NextResponse.json({ message: `No fue posible cargar el perfil docente: ${profileError.message}` }, { status: 500 });
    }

    if (!plan) {
      return NextResponse.json({ message: "No se encontró el plan solicitado dentro de tu cuenta." }, { status: 404 });
    }

    const normalizedPlan = normalizePlanForExport(plan);
    const buffer = await buildPlanWordBuffer({
      teacherName: profile?.full_name ?? "Docente",
      generatedAt: new Date().toISOString(),
      plan: normalizedPlan
    });

    await createNotification(supabase, {
      userId: user.id,
      type: "document_exported",
      title: "Documento exportado",
      message: `El plan "${normalizedPlan.title}" ya está disponible en Word editable.`,
      href: "/planes"
    });

    const filename = buildPlanWordFilename(normalizedPlan.groupName, normalizedPlan.subject, normalizedPlan.topic);
    const body = new Uint8Array(buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Excepción generando Word de plan:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No fue posible exportar el documento editable en este intento."
      },
      { status: 500 }
    );
  }
}
