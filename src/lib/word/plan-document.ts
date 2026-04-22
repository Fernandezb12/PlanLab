import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from "docx";

import type { NormalizedPlanExport } from "@/lib/plans/export";

type BuildPlanWordDocumentInput = {
  teacherName: string;
  generatedAt: string;
  plan: NormalizedPlanExport;
};

const label = (text: string) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, bold: true, color: "475569" })]
  });

const valueParagraph = (text: string) =>
  new Paragraph({
    spacing: { after: 180 },
    children: [new TextRun({ text, color: "111827" })]
  });

export const buildPlanWordBuffer = async ({ teacherName, generatedAt, plan }: BuildPlanWordDocumentInput) => {
  const document = new Document({
    creator: "PlanLab AI Core",
    title: `Plan de clase · ${plan.subject}`,
    subject: `Plan de clase · ${plan.topic}`,
    description: "Documento académico editable generado desde PlanLab.",
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 },
            children: [new TextRun({ text: "PlanLab", color: "5B4CF0", bold: true })]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 240 },
            children: [new TextRun("Plan de clase")]
          }),
          new Paragraph({
            spacing: { after: 280 },
            children: [
              new TextRun({ text: `Docente: ${teacherName}`, bold: true }),
              new TextRun({ text: `  ·  Fecha de generación: ${new Date(generatedAt).toLocaleDateString("es-CO")}` })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [label("Grupo"), valueParagraph(`${plan.groupName}${plan.educationLevel ? ` · ${plan.educationLevel}` : ""}`)] }),
                  new TableCell({ children: [label("Área"), valueParagraph(plan.subject)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [label("Tema"), valueParagraph(plan.topic)] }),
                  new TableCell({ children: [label("Duración"), valueParagraph(`${plan.durationMinutes} minutos`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [label("Tipo de evaluación"), valueParagraph(plan.evaluationType)] }),
                  new TableCell({ children: [label("Recursos"), valueParagraph(plan.resources || "No se registraron recursos específicos.")] })
                ]
              })
            ]
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 280, after: 120 },
            children: [new TextRun("Objetivo de aprendizaje")]
          }),
          valueParagraph(plan.objective),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 220, after: 120 },
            children: [new TextRun("Desarrollo de la clase")]
          }),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Inicio")] }),
          valueParagraph(plan.inicio),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Desarrollo")] }),
          valueParagraph(plan.desarrollo),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Cierre")] }),
          valueParagraph(plan.cierre),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 220, after: 120 },
            children: [new TextRun("Distribución del tiempo")]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bloque", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tiempo", bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Inicio")] }),
                  new TableCell({ children: [new Paragraph(`${plan.distribution?.inicio ?? "—"} min`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Desarrollo")] }),
                  new TableCell({ children: [new Paragraph(`${plan.distribution?.desarrollo ?? "—"} min`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Cierre")] }),
                  new TableCell({ children: [new Paragraph(`${plan.distribution?.cierre ?? "—"} min`)] })
                ]
              })
            ]
          }),
          ...(plan.observations
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 220, after: 120 },
                  children: [new TextRun("Observaciones docentes")]
                }),
                valueParagraph(plan.observations)
              ]
            : []),
          ...(plan.suggestions
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 220, after: 120 },
                  children: [new TextRun("Sugerencias metodológicas")]
                }),
                valueParagraph(plan.suggestions)
              ]
            : []),
          ...(plan.aiAssisted
            ? [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 240 },
                  children: [new TextRun({ text: "Propuesta pedagógica asistida por PlanLab AI Core", italics: true, color: "5B4CF0" })]
                })
              ]
            : [])
        ]
      }
    ]
  });

  return Packer.toBuffer(document);
};
