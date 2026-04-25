const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

const todayStamp = () => new Date().toISOString().slice(0, 10);

export const buildPlanPdfPath = (groupName: string, subject: string, topic: string) =>
  `plans/plan-clase_${slugify(groupName)}_${slugify(subject)}_${slugify(topic)}_${todayStamp()}.pdf`;

export const buildReportPdfPath = (reportType: string, groupName: string, activityTitle?: string | null) =>
  `reports/reporte-${slugify(reportType)}_${slugify(groupName)}${activityTitle ? `_${slugify(activityTitle)}` : ""}_${todayStamp()}.pdf`;

export const buildResultsPdfPath = (groupName: string, activityTitle?: string | null) =>
  `results/resultados_${slugify(groupName)}${activityTitle ? `_${slugify(activityTitle)}` : ""}_${todayStamp()}.pdf`;

export const buildPlanWordFilename = (groupName: string, subject: string, topic: string) =>
  `plan-clase_${slugify(groupName)}_${slugify(subject)}_${slugify(topic)}_${todayStamp()}.docx`;

export const buildReportWordFilename = (reportType: string, groupName: string, activityTitle?: string | null) =>
  `reporte-${slugify(reportType)}_${slugify(groupName)}${activityTitle ? `_${slugify(activityTitle)}` : ""}_${todayStamp()}.docx`;
