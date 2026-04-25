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

const softBorder = { style: BorderStyle.SINGLE, size: 4, color: colors.primaryBorder };

const cleanText = (value: string | null | undefined, fallback = "N/D") => (value?.trim() ? value.trim() : fallback);

const displayCorrections: Record<string, string> = {
  matematica: "Matemática",
  matematicas: "Matemáticas",
  trigonometria: "Trigonometría",
  geometria: "Geometría",
  estadistica: "Estadística",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biología",
  espanol: "Español",
  ingles: "Inglés",
  diagnostica: "Diagnóstica",
  formativa: "Formativa",
  sumativa: "Sumativa",
  observacion: "Observación",
  otra: "Otra",
  "basica primaria": "Básica primaria",
  "basica secundaria": "Básica secundaria",
  "educacion media": "Educación media",
  "educacion superior": "Educación superior"
};

const displayKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const displayText = (value: string | null | undefined, fallback = "N/D") => {
  const cleaned = cleanText(value, fallback);
  const corrected = displayCorrections[displayKey(cleaned)];

  if (corrected) {
    return corrected;
  }

  if (cleaned === fallback) {
    return cleaned;
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const planDisplayTitle = (plan: NormalizedPlanExport) => {
  const title = cleanText(plan.title, plan.topic || "Plan de clase");
  const titleWithoutPrefix = title.replace(/^plan\s+de\s+clase\s*[:\-–]?\s*/i, "").trim();

  if (titleWithoutPrefix && titleWithoutPrefix.length < title.length) {
    return displayText(titleWithoutPrefix, "Plan de clase");
  }

  if (displayKey(title) === "plan de clase" && plan.topic) {
    return displayText(plan.topic);
  }

  return displayText(title, "Plan de clase");
};

const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/D" : date.toLocaleDateString("es-CO", { dateStyle: "long" });
};

const bodyRun = (text: string, color = colors.text) => new TextRun({ text, color, size: 21 });

const sectionTitle = (text: string, color = colors.primary) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: colors.primaryBorder }
    },
    children: [new TextRun({ text, color, bold: true, size: 23 })]
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
        children: [new TextRun({ text: displayText(text), color: colors.text, bold: true, size: 20 })]
      })
    ]
  });

const metadataRow = (leftLabel: string, leftValue: string, rightLabel: string, rightValue: string) =>
  new TableRow({
    children: [metadataLabelCell(leftLabel), metadataValueCell(leftValue), metadataLabelCell(rightLabel), metadataValueCell(rightValue)]
  });

const highlightedBox = ({ text, accent, fill }: { text: string; accent: string; fill: string }) => [
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill },
            borders: {
              top: softBorder,
              bottom: softBorder,
              left: { style: BorderStyle.SINGLE, size: 18, color: accent },
              right: softBorder
            },
            margins: { top: 150, bottom: 150, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: [bodyRun(cleanText(text), colors.text)]
              })
            ]
          })
        ]
      })
    ]
  }),
  new Paragraph({ spacing: { after: 80 } })
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
            tableBodyCell([new Paragraph({ children: [new TextRun({ text: displayText(moment.moment), bold: true, color: momentColor(moment.moment), size: 19 })] })], fill),
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
  const documentTitle = plan.isReinforcement ? "Plan de clase · Refuerzo" : "Plan de clase";
  const readablePlanTitle = planDisplayTitle(plan);

  const document = new Document({
    creator: "PlanLab AI Core",
    title: `${documentTitle} · ${readablePlanTitle}`,
    subject: `${displayText(plan.subject)} · ${displayText(plan.topic)}`,
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
            heading: HeadingLevel.TITLE,
            spacing: { after: 60 },
            children: [new TextRun({ text: "PlanLab", color: colors.primary, bold: true, size: 34 })]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 80 },
            children: [new TextRun({ text: documentTitle, color: colors.text, bold: true, size: 30 })]
          }),
          new Paragraph({
            spacing: { after: 140 },
            children: [new TextRun({ text: readablePlanTitle, color: colors.text, bold: true, size: 25 })]
          }),
          new Paragraph({
            spacing: { after: 220 },
            children: [
              new TextRun({ text: `Docente: ${displayText(teacherName)}`, bold: true, color: colors.text, size: 20 }),
              new TextRun({ text: `  ·  Fecha de generación: ${dateLabel(generatedAt)}`, color: colors.textSecondary, size: 20 })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            columnWidths: [1600, 3400, 1600, 3400],
            rows: [
              metadataRow("Grupo", `${displayText(plan.groupName)}${plan.educationLevel ? ` · ${displayText(plan.educationLevel)}` : ""}`, "Área", displayText(plan.subject)),
              metadataRow("Tema", displayText(plan.topic), "Duración", durationLabel(plan.durationMinutes)),
              metadataRow("Evaluación", displayText(plan.evaluationType), "Modalidad", displayText(plan.modality)),
              metadataRow("Nivel educativo", displayText(plan.educationLevel), "Fecha", dateLabel(generatedAt))
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
          ...highlightedBox({
            text: plan.evaluationCriteria ? `${displayText(plan.evaluationType)}. ${plan.evaluationCriteria}` : `Tipo de evaluación: ${displayText(plan.evaluationType)}`,
            accent: colors.primary,
            fill: colors.primaryLight
          }),
          sectionTitle("Recursos"),
          ...highlightedBox({
            text: plan.resourceTags.length ? plan.resourceTags.join(", ") : plan.resources || "N/D",
            accent: colors.green,
            fill: colors.greenBg
          }),
          ...(plan.observations ? [sectionTitle("Observaciones docentes", colors.blue), ...highlightedBox({ text: plan.observations, accent: colors.blue, fill: colors.blueBg })] : []),
          sectionTitle("Recomendaciones metodológicas", colors.blue),
          ...highlightedBox({
            text: plan.suggestions || "No se registraron recomendaciones adicionales.",
            accent: colors.blue,
            fill: colors.blueBg
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
