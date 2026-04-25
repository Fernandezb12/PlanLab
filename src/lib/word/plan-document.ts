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

import type { NormalizedPlanExport, PlanMomentExport } from "@/lib/plans/export";

type BuildPlanWordDocumentInput = {
  teacherName: string;
  generatedAt: string;
  plan: NormalizedPlanExport;
};

const colors = {
  headerBg: "F8FAFC",
  primary: "7C3AED",
  primaryLight: "F8FAFC",
  primaryBorder: "D9E2EF",
  text: "111827",
  textSecondary: "475569",
  amberBg: "FFFBEB",
  amber: "F59E0B",
  amberText: "92400E",
  green: "15803D",
  greenBg: "F0FDF4",
  blue: "0369A1",
  blueBg: "EFF6FF",
  orange: "C2410C",
  white: "FFFFFF",
  rowAlt: "F9FAFB"
};

const noneBorder = { style: BorderStyle.NONE, size: 0, color: colors.white };
const softBorder = { style: BorderStyle.SINGLE, size: 4, color: colors.primaryBorder };

const cleanText = (value: string | null | undefined, fallback = "N/D") => (value?.trim() ? value.trim() : fallback);

const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/D" : date.toLocaleDateString("es-CO", { dateStyle: "long" });
};

const bodyRun = (text: string, color = colors.text) => new TextRun({ text, color, size: 21 });

const sectionTitle = (text: string, color = colors.primary) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.primaryBorder }
    },
    children: [new TextRun({ text, color, bold: true, size: 24, allCaps: true })]
  });

const metadataLabelCell = (text: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill: colors.headerBg },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    width: { size: 18, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text, color: colors.primary, bold: true, size: 18, allCaps: true })]
      })
    ]
  });

const metadataValueCell = (text: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill: colors.primaryLight },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    width: { size: 32, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text: cleanText(text), color: colors.text, bold: true, size: 20 })]
      })
    ]
  });

const metadataRow = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) =>
  new TableRow({
    children: [metadataLabelCell(leftLabel), metadataValueCell(leftValue), metadataLabelCell(rightLabel), metadataValueCell(rightValue)]
  });

const highlightedBox = ({ text, accent, fill }: { text: string; accent: string; fill: string }) => [
  new Paragraph({
    shading: { type: ShadingType.CLEAR, fill },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: accent },
      top: noneBorder,
      bottom: noneBorder,
      right: noneBorder
    },
    spacing: { before: 80, after: 180 },
    indent: { left: 180 },
    children: [bodyRun(cleanText(text), colors.text)]
  })
];

const momentColor = (moment: string) => {
  const normalizedMoment = moment.toLowerCase();

  if (normalizedMoment.includes("inicio")) {
    return colors.blue;
  }

  if (normalizedMoment.includes("desarrollo")) {
    return colors.green;
  }

  if (normalizedMoment.includes("cierre")) {
    return colors.orange;
  }

  return colors.primary;
};

const timeLabel = (minutes: number | null) => (minutes === null ? "N/D" : `${minutes} min`);
const durationLabel = (minutes: number) => (minutes > 0 ? `${minutes} minutos` : "N/D");

const tableHeaderCell = (text: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill: colors.headerBg },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 110, bottom: 110, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: colors.text, size: 18 })] })]
  });

const tableBodyCell = (children: Paragraph[], fill: string) =>
  new TableCell({
    shading: { type: ShadingType.CLEAR, fill },
    borders: { top: softBorder, bottom: softBorder, left: softBorder, right: softBorder },
    margins: { top: 110, bottom: 110, left: 120, right: 120 },
    children
  });

const distributionTable = (moments: PlanMomentExport[]) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [1400, 1800, 5000, 2200],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [tableHeaderCell("Tiempo"), tableHeaderCell("Momento"), tableHeaderCell("Actividad"), tableHeaderCell("Técnica")]
      }),
      ...moments.map((moment, index) => {
        const fill = index % 2 === 0 ? colors.white : colors.rowAlt;

        return new TableRow({
          children: [
            tableBodyCell([new Paragraph({ children: [new TextRun({ text: timeLabel(moment.minutes), bold: true, color: colors.text, size: 19 })] })], fill),
            tableBodyCell([new Paragraph({ children: [new TextRun({ text: moment.moment, bold: true, color: momentColor(moment.moment), size: 19 })] })], fill),
            tableBodyCell(
              [
                new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: cleanText(moment.activityName), bold: true, color: colors.text, size: 19 })] }),
                new Paragraph({ children: [new TextRun({ text: cleanText(moment.description, "No registrado"), color: colors.textSecondary, size: 18 })] })
              ],
              fill
            ),
            tableBodyCell([new Paragraph({ children: [new TextRun({ text: cleanText(moment.technique), color: colors.textSecondary, size: 18 })] })], fill)
          ]
        });
      })
    ]
  });

const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
      new TextRun({ text: "Plan generado por PlanLab · Tu laboratorio pedagógico inteligente    |    Página ", color: colors.textSecondary, size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], color: colors.text, size: 18 }),
        new TextRun({ text: " de ", color: colors.textSecondary, size: 18 }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], color: colors.text, size: 18 })
      ]
    })
  ]
});

export const buildPlanWordBuffer = async ({ teacherName, generatedAt, plan }: BuildPlanWordDocumentInput) => {
  const document = new Document({
    creator: "PlanLab AI Core",
    title: `Plan de clase · ${plan.subject}`,
    subject: `Plan de clase · ${plan.topic}`,
    description: "Documento académico editable generado desde PlanLab.",
    sections: [
      {
        footers: { default: footer },
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 100 },
            children: [new TextRun({ text: "PlanLab", color: colors.primary, bold: true, size: 34 })]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 180 },
            children: [new TextRun({ text: plan.isReinforcement ? "Plan de clase · Refuerzo" : "Plan de clase", color: colors.text, bold: true, size: 30 })]
          }),
          new Paragraph({
            spacing: { after: 220 },
            children: [
              new TextRun({ text: `Docente: ${teacherName}`, bold: true, color: colors.text, size: 20 }),
              new TextRun({ text: `  ·  Fecha de generación: ${dateLabel(generatedAt)}`, color: colors.textSecondary, size: 20 })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [1600, 3400, 1600, 3400],
            rows: [
              metadataRow("Grupo", `${plan.groupName}${plan.educationLevel ? ` · ${plan.educationLevel}` : ""}`, "Área", plan.subject),
              metadataRow("Tema", plan.topic, "Duración", durationLabel(plan.durationMinutes)),
              metadataRow("Evaluación", plan.evaluationType, "Modalidad", plan.modality),
              metadataRow("Nivel educativo", plan.educationLevel ?? "N/D", "Fecha", dateLabel(generatedAt))
            ]
          }),
          sectionTitle("Objetivo de aprendizaje"),
          ...highlightedBox({ text: plan.objective, accent: colors.primary, fill: colors.primaryLight }),
          ...(plan.isReinforcement && plan.diagnosis
            ? [sectionTitle("Diagnóstico breve", colors.amberText), ...highlightedBox({ text: plan.diagnosis, accent: colors.amber, fill: colors.amberBg })]
            : []),
          sectionTitle("Desarrollo de la clase"),
          distributionTable(plan.moments),
          sectionTitle("Evaluación"),
          ...highlightedBox({ text: plan.evaluationCriteria ? `${plan.evaluationType}. ${plan.evaluationCriteria}` : `Tipo de evaluación: ${plan.evaluationType}`, accent: colors.primary, fill: colors.primaryLight }),
          sectionTitle("Recursos"),
          ...highlightedBox({
            text: plan.resourceTags.length ? plan.resourceTags.join(", ") : plan.resources || "N/D",
            accent: colors.green,
            fill: colors.greenBg
          }),
          ...(plan.isReinforcement && plan.teacherRecommendations
            ? [
                sectionTitle("Recomendaciones docentes", colors.blue),
                ...highlightedBox({ text: plan.teacherRecommendations, accent: colors.blue, fill: colors.blueBg })
              ]
            : []),
          ...(plan.aiAssisted
            ? [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 240 },
                  children: [new TextRun({ text: "Propuesta pedagógica asistida por PlanLab AI Core", italics: true, color: colors.primary, size: 18 })]
                })
              ]
            : [])
        ]
      }
    ]
  });

  return Packer.toBuffer(document);
};
