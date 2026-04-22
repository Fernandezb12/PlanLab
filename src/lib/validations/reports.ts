import { z } from "zod";

export const reportTypes = ["rendimiento", "asistencia", "comparativo", "consolidado"] as const;

export const reportTypeLabels: Record<(typeof reportTypes)[number], string> = {
  rendimiento: "Rendimiento",
  asistencia: "Asistencia",
  comparativo: "Comparativo",
  consolidado: "Consolidado"
};

export const getReportTypeLabel = (reportType: string) => reportTypeLabels[reportType as keyof typeof reportTypeLabels] ?? "Reporte";

export const createReportSchema = z.object({
  groupId: z.string().uuid("Selecciona un grupo válido"),
  activityId: z.string().uuid("Selecciona una actividad válida").optional().or(z.literal("")),
  reportType: z.enum(reportTypes, {
    errorMap: () => ({ message: "Selecciona un tipo de reporte válido" })
  })
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
