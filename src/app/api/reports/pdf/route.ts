import { NextResponse } from "next/server";

import { buildReportHtml } from "@/lib/pdf/report-template";

export async function POST(request: Request) {
  const payload = await request.json();
  const html = buildReportHtml(payload?.title ?? "Reporte PlanLab", payload?.body ?? "Contenido pendiente");

  return NextResponse.json({
    message: "Endpoint PDF listo para integrar con motor de render (Puppeteer/Playwright o servicio externo).",
    previewHtml: html
  });
}
