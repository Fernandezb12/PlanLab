import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType
} from "docx";

import type { ReportExportData } from "@/lib/reports/export";

type BuildReportWordDocumentInput = {
  data: ReportExportData;
};

const colors = {
  text: "111827",
  secondary: "475569",
  border: "D9E2EF",
  softBg: "F8FAFC",
  rowAlt: "F9FAFB",
  accent: "7C3AED",
  accentBg: "F5F3FF",
  white: "FFFFFF"
};

const softBorder = { style: BorderStyle.SINGLE, size: 4, color: colors.border };

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/D" : date.toLocaleDateString("es-CO", { dateStyle: "long" });
};
const formatScore = (value: number | null, fallback = "N/D") => (value === null ? fallback : value.toFixed(1));
const formatPercent = (value: number | null, fallback = "N/D") => (value === null ? fallback : `${Math.round(value)}%`);

const bodyRun = (text: string, color = colors.text) => new TextRun({ text, color, size: 21 });

const sectionTitle = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.border } },
    children: [new TextRun({ text, color: colors.accent, bold: true, size: 23 })]
  });

const labelCell = (text: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill: colors.softBg },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, color: colors.accent, bold: true, size: 18, allCaps: true })] })]
  });

const valueCell = (text: string | number) =>
  new TableCell({
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: String(text), color: colors.text, bold: true, size: 20 })] })]
  });

const infoRow = (leftLabel: string, leftValue: string | number, rightLabel: string, rightValue: string | number) =>
  new TableRow({ children: [labelCell(leftLabel), valueCell(leftValue), labelCell(rightLabel), valueCell(rightValue)] });

const textBox = (text: string) => [
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: colors.accentBg },
            borders: { top: softBorder, bottom: softBorder, left: { style: BorderStyle.SINGLE, size: 18, color: colors.accent }, right: softBorder },
            margins: { top: 150, bottom: 150, left: 180, right: 180 },
            children: [new Paragraph({ children: [bodyRun(text)] })]
          })
        ]
      })
    ]
  }),
  new Paragraph({ spacing: { after: 80 } })
];

const listParagraphs = (items: string[], fallback: string) =>
  (items.length ? items : [fallback]).map(
    (item) =>
      new Paragraph({
        spacing: { after: 80 },
        children: [bodyRun(`• ${item}`, colors.secondary)]
      })
  );

const tableHeaderCell = (text: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill: colors.softBg },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: colors.text, size: 17 })] })]
  });

const tableBodyCell = (text: string, fill: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 95, bottom: 95, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, color: colors.secondary, size: 17 })] })]
  });

const studentTable = (data: ReportExportData) => {
  if (!data.students.length || !data.recordsAnalyzed) {
    return textBox("No hay registros individuales suficientes para consolidar una tabla de estudiantes.");
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      columnWidths: [2500, 1300, 1300, 1200, 2600, 1600],
      rows: [
        new TableRow({
          tableHeader: true,
          children: ["Estudiante", "Código", "Asistencia", "Promedio", "Observación", "Estado"].map(tableHeaderCell)
        }),
        ...data.students.map((student, index) => {
          const fill = index % 2 === 0 ? colors.white : colors.rowAlt;
          return new TableRow({
            children: [
              tableBodyCell(student.studentName, fill),
              tableBodyCell(student.studentCode || "N/D", fill),
              tableBodyCell(formatPercent(student.attendanceAverage), fill),
              tableBodyCell(formatScore(student.averageScore), fill),
              tableBodyCell(student.observation || "Sin observación", fill),
              tableBodyCell(student.statusLabel, fill)
            ]
          });
        })
      ]
    }),
    new Paragraph({ spacing: { after: 80 } })
  ];
};

const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "Generado desde PlanLab    |    Página ", color: colors.secondary, size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], color: colors.text, size: 18 }),
        new TextRun({ text: " de ", color: colors.secondary, size: 18 }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.text, size: 18 })
      ]
    })
  ]
});

export const buildReportWordBuffer = async ({ data }: BuildReportWordDocumentInput) => {
  const document = new Document({
    creator: "PlanLab AI Core",
    title: "Reporte pedagógico",
    subject: `${data.reportType} · ${data.groupName}`,
    description: "Documento académico editable generado desde PlanLab.",
    sections: [
      {
        footers: { default: footer },
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900
            }
          }
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 80 },
            children: [new TextRun({ text: "Reporte pedagógico", color: colors.text, bold: true, size: 32 })]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [new TextRun({ text: data.reportSubtitle, color: colors.accent, bold: true, size: 22 })]
          }),
          sectionTitle("Ficha del reporte"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [1700, 3300, 1700, 3300],
            rows: [
              infoRow("Tipo", data.reportType, "Grupo", data.groupName),
              infoRow("Nivel", data.educationLevel ?? "N/D", "Actividad", data.activityTitle ?? "Reporte general del grupo"),
              infoRow("Fecha", formatDate(data.generatedAt), "Estudiantes", data.totalStudents),
              infoRow("Registros", data.recordsAnalyzed, "Actividades", data.activitiesAnalyzed)
            ]
          }),
          sectionTitle("Resumen ejecutivo"),
          ...textBox(data.executiveSummary),
          sectionTitle("Indicadores principales"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              infoRow("Promedio general", formatScore(data.averageScore), "Asistencia promedio", formatPercent(data.attendanceAverage)),
              infoRow("Estudiantes con alerta", data.students.filter((student) => student.statusLabel !== "Estable").length, "Registros analizados", data.recordsAnalyzed)
            ]
          }),
          sectionTitle("Tabla de estudiantes"),
          ...studentTable(data),
          sectionTitle("Alertas detectadas"),
          ...listParagraphs(data.alerts, "No se detectaron alertas activas en este corte."),
          sectionTitle("Recomendaciones docentes"),
          ...listParagraphs(data.recommendations, "Continuar con seguimiento periódico y retroalimentación formativa."),
          sectionTitle("Observaciones generales"),
          ...listParagraphs(data.observations, "No se registraron observaciones adicionales para este reporte.")
        ]
      }
    ]
  });

  return Packer.toBuffer(document);
};
