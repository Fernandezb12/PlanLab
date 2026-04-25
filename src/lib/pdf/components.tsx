import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

export type PlanPdfData = {
  teacherName: string;
  generatedAt: string;
  groupName: string;
  educationLevel: string | null;
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  objective: string;
  evaluationType: string;
  resources: string | null;
  inicio: string;
  desarrollo: string;
  cierre: string;
  distribution: {
    inicio: number;
    desarrollo: number;
    cierre: number;
  } | null;
  observations: string | null;
  suggestions: string | null;
  aiAssisted: boolean;
  moments: Array<{
    moment: string;
    minutes: number | null;
    activityName: string;
    description: string;
    technique: string;
  }>;
  resourceTags: string[];
  evaluationCriteria: string | null;
  diagnosis: string | null;
  teacherRecommendations: string | null;
  isReinforcement: boolean;
  modality: string;
};

const colors = {
  text: "#111827",
  secondary: "#475569",
  muted: "#64748B",
  border: "#D9E2EF",
  softBg: "#F8FAFC",
  rowAlt: "#F9FAFB",
  purple: "#7C3AED",
  purpleSoft: "#F5F3FF",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  green: "#15803D",
  greenSoft: "#F0FDF4",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB"
};

export const planPageStyle = {
  backgroundColor: "#FFFFFF",
  color: colors.text,
  fontFamily: "Helvetica",
  fontSize: 10,
  lineHeight: 1.45,
  paddingTop: 40,
  paddingBottom: 64,
  paddingHorizontal: 42
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5
  },
  logoMark: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: colors.purple,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 2,
    marginRight: 7
  },
  brandName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 700
  },
  documentType: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 700,
    marginTop: 2
  },
  documentSubtitle: {
    color: colors.secondary,
    fontSize: 9.5,
    marginTop: 3
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: "44%"
  },
  headerMetaText: {
    color: colors.secondary,
    fontSize: 9,
    marginBottom: 3
  },
  headerRule: {
    borderBottomWidth: 1.2,
    borderBottomColor: colors.purple,
    marginTop: 13
  },
  titleBlock: {
    marginBottom: 14
  },
  planTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.25
  },
  planSubtitle: {
    color: colors.secondary,
    fontSize: 9.5,
    marginTop: 4,
    lineHeight: 1.4
  },
  aiNote: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 999,
    backgroundColor: colors.purpleSoft,
    color: colors.purple,
    fontSize: 8,
    fontWeight: 700,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  section: {
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 7
  },
  metaTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 14
  },
  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  metaLastRow: {
    borderBottomWidth: 0
  },
  metaCell: {
    width: "50%",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  metaCellLeft: {
    borderRightWidth: 1,
    borderRightColor: colors.border
  },
  metaLabel: {
    color: colors.purple,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 3
  },
  metaValue: {
    color: colors.text,
    fontSize: 9.7,
    fontWeight: 600,
    lineHeight: 1.35
  },
  accentBox: {
    backgroundColor: colors.softBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  paragraph: {
    color: colors.text,
    fontSize: 9.6,
    lineHeight: 1.5
  },
  paragraphMuted: {
    color: colors.secondary,
    fontSize: 9.2,
    lineHeight: 1.45
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.softBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headCell: {
    color: colors.text,
    fontSize: 7.8,
    fontWeight: 700,
    textTransform: "uppercase",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF2"
  },
  tableCell: {
    color: colors.secondary,
    fontSize: 8.7,
    paddingHorizontal: 8,
    paddingVertical: 9,
    lineHeight: 1.4
  },
  momentPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    fontSize: 7.6,
    fontWeight: 700
  },
  activityName: {
    color: colors.text,
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3
  },
  activityDesc: {
    color: colors.secondary,
    fontSize: 8.6,
    lineHeight: 1.4
  },
  resourceList: {
    marginTop: 2
  },
  listItem: {
    color: colors.text,
    fontSize: 9.3,
    lineHeight: 1.45,
    marginBottom: 3
  },
  noteBox: {
    backgroundColor: colors.softBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 42,
    right: 42,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerText: {
    color: colors.secondary,
    fontSize: 8.2
  },
  footerPage: {
    color: colors.secondary,
    fontSize: 8.2,
    textAlign: "right"
  }
});

const fallbackText = (value: string | null | undefined, fallback = "N/D") => (value?.trim() ? value.trim() : fallback);

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/D" : date.toLocaleDateString("es-CO", { dateStyle: "long" });
};

const formatDuration = (minutes: number | null | undefined) => (typeof minutes === "number" && minutes > 0 ? `${minutes} minutos` : "N/D");
const formatMinutes = (minutes: number | null) => (minutes === null ? "N/D" : `${minutes} min`);

const getMomentPillStyle = (moment: string) => {
  const normalizedMoment = moment.toLowerCase();

  if (normalizedMoment.includes("inicio")) {
    return { backgroundColor: colors.blueSoft, color: colors.blue, borderColor: "#BFDBFE" };
  }

  if (normalizedMoment.includes("desarrollo")) {
    return { backgroundColor: colors.greenSoft, color: colors.green, borderColor: "#BBF7D0" };
  }

  if (normalizedMoment.includes("cierre")) {
    return { backgroundColor: colors.amberSoft, color: "#92400E", borderColor: "#FDE68A" };
  }

  return { backgroundColor: colors.purpleSoft, color: colors.purple, borderColor: "#DDD6FE" };
};

const splitResources = (resources: string | null) =>
  resources
    ? resources
        .split(/[,;\n]+/)
        .map((resource) => resource.trim())
        .filter(Boolean)
    : [];

export const PdfHeader = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.header} wrap={false}>
    <View style={styles.headerTop}>
      <View>
        <View style={styles.brandRow}>
          <Text style={styles.logoMark}>P</Text>
          <Text style={styles.brandName}>PlanLab</Text>
        </View>
        <Text style={styles.documentType}>Plan de clase</Text>
        <Text style={styles.documentSubtitle}>Documento académico generado desde PlanLab</Text>
      </View>
      <View style={styles.headerMeta}>
        <Text style={styles.headerMetaText}>Docente: {fallbackText(data.teacherName)}</Text>
        <Text style={styles.headerMetaText}>Fecha: {formatDate(data.generatedAt)}</Text>
      </View>
    </View>
    <View style={styles.headerRule} />
  </View>
);

export const PdfTitleBlock = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.titleBlock} wrap={false}>
    <Text style={styles.planTitle}>{fallbackText(data.title, "Plan de clase")}</Text>
    <Text style={styles.planSubtitle}>
      {fallbackText(data.subject)} · {fallbackText(data.educationLevel)} · {fallbackText(data.groupName)}
    </Text>
    {data.aiAssisted ? <Text style={styles.aiNote}>Propuesta pedagógica asistida por PlanLab AI Core</Text> : null}
  </View>
);

export const PdfSectionTitle = ({ children }: { children: ReactNode }) => <Text style={styles.sectionTitle}>{children}</Text>;

export const PdfMetaGrid = ({ data }: { data: PlanPdfData }) => {
  const items = [
    ["Grupo", data.groupName],
    ["Nivel educativo", data.educationLevel],
    ["Área/asignatura", data.subject],
    ["Tema", data.topic],
    ["Duración", formatDuration(data.durationMinutes)],
    ["Tipo de evaluación", data.evaluationType],
    ["Modalidad", data.modality || "Diseño docente"],
    ["Fecha", formatDate(data.generatedAt)]
  ];

  return (
    <View style={styles.metaTable} wrap={false}>
      {items.reduce<ReactNode[]>((rows, _, index) => {
        if (index % 2 !== 0) {
          return rows;
        }

        const left = items[index];
        const right = items[index + 1];

        rows.push(
          <View key={left[0]} style={index >= items.length - 2 ? [styles.metaRow, styles.metaLastRow] : styles.metaRow}>
            <View style={[styles.metaCell, styles.metaCellLeft]}>
              <Text style={styles.metaLabel}>{left[0]}</Text>
              <Text style={styles.metaValue}>{fallbackText(left[1])}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>{right?.[0]}</Text>
              <Text style={styles.metaValue}>{fallbackText(right?.[1])}</Text>
            </View>
          </View>
        );

        return rows;
      }, [])}
    </View>
  );
};

export const PdfObjectiveBox = ({ objective }: { objective: string }) => (
  <View style={styles.section} wrap={false}>
    <PdfSectionTitle>Objetivo de aprendizaje</PdfSectionTitle>
    <View style={styles.accentBox}>
      <Text style={styles.paragraph}>{fallbackText(objective, "Objetivo pendiente de registro.")}</Text>
    </View>
  </View>
);

export const PdfDiagnosticBox = ({ diagnosis }: { diagnosis: string | null }) => {
  if (!diagnosis) {
    return null;
  }

  return (
    <View style={styles.section} wrap={false}>
      <PdfSectionTitle>Diagnóstico breve</PdfSectionTitle>
      <View style={[styles.noteBox, { borderLeftColor: colors.amber, backgroundColor: colors.amberSoft }]}>
        <Text style={styles.paragraph}>{diagnosis}</Text>
      </View>
    </View>
  );
};

export const PdfTimeTable = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.section}>
    <PdfSectionTitle>Desarrollo de la clase</PdfSectionTitle>
    <View style={styles.table}>
      <View style={styles.tableHeader} wrap={false}>
        <Text style={[styles.headCell, { width: "16%" }]}>Momento</Text>
        <Text style={[styles.headCell, { width: "12%" }]}>Tiempo</Text>
        <Text style={[styles.headCell, { width: "52%" }]}>Actividad</Text>
        <Text style={[styles.headCell, { width: "20%" }]}>Estrategia</Text>
      </View>
      {data.moments.map((moment, index) => (
        <View key={`${moment.moment}-${index}`} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? "#FFFFFF" : colors.rowAlt }]} wrap={false}>
          <View style={[styles.tableCell, { width: "16%" }]}>
            <Text style={[styles.momentPill, getMomentPillStyle(moment.moment)]}>{fallbackText(moment.moment)}</Text>
          </View>
          <Text style={[styles.tableCell, { width: "12%", color: colors.text, fontWeight: 700 }]}>{formatMinutes(moment.minutes)}</Text>
          <View style={[styles.tableCell, { width: "52%" }]}>
            <Text style={styles.activityName}>{fallbackText(moment.activityName)}</Text>
            <Text style={styles.activityDesc}>{fallbackText(moment.description, "No registrado")}</Text>
          </View>
          <Text style={[styles.tableCell, { width: "20%" }]}>{fallbackText(moment.technique)}</Text>
        </View>
      ))}
    </View>
  </View>
);

export const PdfEvaluationSection = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.section} wrap={false}>
    <PdfSectionTitle>Evaluación</PdfSectionTitle>
    <View style={styles.accentBox}>
      <Text style={styles.paragraph}>
        {data.evaluationCriteria
          ? `${fallbackText(data.evaluationType)}. ${data.evaluationCriteria}`
          : `Tipo de evaluación: ${fallbackText(data.evaluationType)}`}
      </Text>
    </View>
  </View>
);

export const PdfResourcesSection = ({ data }: { data: PlanPdfData }) => {
  const resources = data.resourceTags.length ? data.resourceTags : splitResources(data.resources);

  return (
    <View style={styles.section} wrap={false}>
      <PdfSectionTitle>Recursos</PdfSectionTitle>
      <View style={[styles.accentBox, { borderLeftColor: colors.green }]}>
        {resources.length ? (
          <View style={styles.resourceList}>
            {resources.map((resource) => (
              <Text key={resource} style={styles.listItem}>
                • {resource}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>N/D</Text>
        )}
      </View>
    </View>
  );
};

export const PdfTwoColumnSection = ({ data }: { data: PlanPdfData }) => (
  <>
    <PdfEvaluationSection data={data} />
    <PdfResourcesSection data={data} />
  </>
);

export const PdfRecommendationsBox = ({ recommendations, title = "Recomendaciones metodológicas" }: { recommendations: string | null; title?: string }) => {
  if (!recommendations) {
    return null;
  }

  return (
    <View style={styles.section} wrap={false}>
      <PdfSectionTitle>{title}</PdfSectionTitle>
      <View style={styles.noteBox}>
        <Text style={styles.paragraphMuted}>{recommendations}</Text>
      </View>
    </View>
  );
};

export const PdfFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>Plan generado por PlanLab · Tu laboratorio pedagógico inteligente</Text>
    <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
  </View>
);
