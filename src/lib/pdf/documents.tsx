import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

type BaseDocumentProps = {
  documentTitle: string;
  subject: string;
  teacherName: string;
  generatedAt: string;
  aiAssisted?: boolean;
  children: ReactNode;
};

type PlanPdfData = {
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

type ReportPdfData = {
  teacherName: string;
  generatedAt: string;
  reportType: string;
  groupName: string;
  educationLevel: string | null;
  activityTitle: string | null;
  averageScore: number | null;
  attendanceAverage: number | null;
  alerts: string[];
  observations: string[];
  executiveSummary: string;
};

type ResultsPdfData = {
  teacherName: string;
  generatedAt: string;
  groupName: string;
  educationLevel: string | null;
  activityTitle: string | null;
  averageScore: number | null;
  attendanceAverage: number | null;
  alerts: string[];
  rows: Array<{
    id: string;
    studentName: string;
    attended: boolean;
    resultScore: number | null;
    observation: string | null;
  }>;
};

const colors = {
  ink: "#111827",
  muted: "#475569",
  soft: "#64748B",
  border: "#CBD5E1",
  accent: "#5B4CF0",
  accentSoft: "#EEF2FF",
  white: "#FFFFFF"
};

const planColors = {
  header: "#1a0e2e",
  primary: "#7c3aed",
  light: "#f8f6ff",
  border: "#e4dcff",
  text: "#1a0e2e",
  secondary: "#4b5563",
  orange: "#f59e0b",
  green: "#15803d",
  blue: "#0369a1",
  white: "#FFFFFF"
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 10.5,
    lineHeight: 1.45,
    paddingTop: 34,
    paddingBottom: 42,
    paddingHorizontal: 34
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 18
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  brandBlock: {
    paddingRight: 12
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 700
  },
  brandSubtitle: {
    color: colors.soft,
    fontSize: 9.5
  },
  metaColumn: {
    alignItems: "flex-end"
  },
  metaText: {
    color: colors.soft,
    fontSize: 9
  },
  section: {
    marginBottom: 14
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8
  },
  accentPanel: {
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  statCard: {
    width: "31.5%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#F8FAFC"
  },
  statLabel: {
    color: colors.soft,
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  statValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 700
  },
  paragraph: {
    color: colors.muted
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  infoItem: {
    width: "48%"
  },
  infoLabel: {
    color: colors.soft,
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  infoValue: {
    marginTop: 4,
    fontSize: 10.5,
    color: colors.ink
  },
  blockTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 4
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0"
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 9.3
  },
  subtleTableCell: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 9.5
  },
  listItem: {
    marginBottom: 5,
    color: colors.muted
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8
  },
  footerText: {
    color: colors.soft,
    fontSize: 8.5
  },
  planPage: {
    backgroundColor: planColors.white,
    color: planColors.text,
    fontSize: 10,
    lineHeight: 1.45,
    paddingTop: 28,
    paddingBottom: 48,
    paddingHorizontal: 32
  },
  planHeader: {
    backgroundColor: planColors.header,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18
  },
  planHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  planBrand: {
    flexDirection: "row",
    alignItems: "center"
  },
  planMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: planColors.primary,
    color: planColors.white,
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 5,
    marginRight: 9
  },
  planBrandTitle: {
    color: planColors.white,
    fontSize: 17,
    fontWeight: 700
  },
  planBrandSubtitle: {
    color: "#d8ccff",
    fontSize: 8.5,
    marginTop: 2
  },
  planBadgeRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  planBadge: {
    borderWidth: 1,
    borderColor: "#a78bfa",
    borderRadius: 999,
    color: planColors.white,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    textTransform: "uppercase",
    marginLeft: 6
  },
  planTitle: {
    color: planColors.white,
    fontSize: 21,
    fontWeight: 700,
    marginTop: 16
  },
  planSubtitle: {
    color: "#e9ddff",
    fontSize: 9.5,
    marginTop: 6
  },
  planMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15
  },
  planMetaCard: {
    width: "32%",
    minHeight: 52,
    backgroundColor: planColors.light,
    borderWidth: 1,
    borderColor: planColors.border,
    borderLeftWidth: 4,
    borderLeftColor: planColors.primary,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 8
  },
  planMetaLabel: {
    color: planColors.secondary,
    fontSize: 7.8,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  planMetaValue: {
    color: planColors.text,
    fontSize: 10,
    fontWeight: 700,
    marginTop: 4
  },
  planSection: {
    marginBottom: 13
  },
  planSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7
  },
  planSectionTitle: {
    color: planColors.primary,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginRight: 8
  },
  planSectionLine: {
    flexGrow: 1,
    height: 1,
    backgroundColor: planColors.border
  },
  planObjectiveBox: {
    backgroundColor: planColors.light,
    borderWidth: 1,
    borderColor: planColors.border,
    borderLeftWidth: 5,
    borderLeftColor: planColors.primary,
    borderRadius: 12,
    padding: 12
  },
  planParagraph: {
    color: planColors.secondary,
    fontSize: 10.2
  },
  planTable: {
    borderWidth: 1,
    borderColor: planColors.border,
    borderRadius: 12,
    overflow: "hidden"
  },
  planTableHeader: {
    flexDirection: "row",
    backgroundColor: planColors.header
  },
  planTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: planColors.border
  },
  planTableCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 8.8,
    color: planColors.secondary
  },
  planTableHeadCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 8.5,
    fontWeight: 700,
    color: planColors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  momentPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 7.8,
    fontWeight: 700,
    color: planColors.white
  },
  twoColumns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13
  },
  columnCard: {
    width: "48.5%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: planColors.border,
    borderRadius: 12,
    padding: 11
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  tag: {
    backgroundColor: planColors.light,
    borderWidth: 1,
    borderColor: planColors.border,
    borderRadius: 999,
    color: planColors.primary,
    fontSize: 8.3,
    fontWeight: 700,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5
  },
  planFooter: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: planColors.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  planFooterText: {
    color: planColors.secondary,
    fontSize: 8
  }
});

const formatDate = (value: string) => new Date(value).toLocaleDateString("es-CO", { dateStyle: "long" });
const formatScore = (value: number | null, fallback = "Sin datos") => (value === null ? fallback : value.toFixed(1));
const formatPercent = (value: number | null, fallback = "Sin datos") => (value === null ? fallback : `${Math.round(value)}%`);
const fallbackText = (value: string | null | undefined, fallback = "No registrado") => (value?.trim() ? value.trim() : fallback);
const formatMinutes = (value: number | null) => (value === null ? "—" : `${value} min`);

const BaseDocument = ({ documentTitle, subject, teacherName, generatedAt, aiAssisted = false, children }: BaseDocumentProps) => (
  <Document title={documentTitle} author="PlanLab" subject={subject} creator="PlanLab AI Core">
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.headerTop}>
          <View style={styles.brandBlock}>
            <Text style={styles.badge}>PlanLab</Text>
            <Text style={[styles.brandTitle, { marginTop: 4 }]}>{documentTitle}</Text>
            <Text style={[styles.brandSubtitle, { marginTop: 4 }]}>Documento académico generado desde el ecosistema pedagógico de PlanLab.</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaText}>Docente: {teacherName}</Text>
            <Text style={[styles.metaText, { marginTop: 3 }]}>Fecha de generación: {formatDate(generatedAt)}</Text>
          </View>
        </View>
      </View>

      {children}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Documento generado desde PlanLab</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `${aiAssisted ? "Contenido apoyado por PlanLab AI Core · " : ""}Página ${pageNumber} de ${totalPages}`
          }
        />
      </View>
    </Page>
  </Document>
);

const PdfSectionTitle = ({ children }: { children: ReactNode }) => (
  <View style={styles.planSectionHeader}>
    <Text style={styles.planSectionTitle}>{children}</Text>
    <View style={styles.planSectionLine} />
  </View>
);

const PdfHeader = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.planHeader} fixed>
    <View style={styles.planHeaderTop}>
      <View style={styles.planBrand}>
        <Text style={styles.planMark}>P</Text>
        <View>
          <Text style={styles.planBrandTitle}>PlanLab</Text>
          <Text style={styles.planBrandSubtitle}>Tu laboratorio pedagógico inteligente</Text>
        </View>
      </View>
      <View style={styles.planBadgeRow}>
        <Text style={styles.planBadge}>Plan de clase</Text>
        {data.isReinforcement ? <Text style={[styles.planBadge, { backgroundColor: "#6d28d9" }]}>Refuerzo</Text> : null}
      </View>
    </View>
    <Text style={styles.planTitle}>{fallbackText(data.title, "Plan de clase")}</Text>
    <Text style={styles.planSubtitle}>
      {fallbackText(data.subject)} · {fallbackText(data.educationLevel, "Nivel no definido")} · {fallbackText(data.groupName, "Grupo")}
    </Text>
  </View>
);

const PdfMetaGrid = ({ data }: { data: PlanPdfData }) => {
  const items = [
    ["Docente", fallbackText(data.teacherName, "Docente")],
    ["Grupo", fallbackText(data.groupName, "Grupo")],
    ["Fecha", formatDate(data.generatedAt)],
    ["Duración", `${data.durationMinutes} minutos`],
    ["Evaluación", fallbackText(data.evaluationType)],
    ["Modalidad", fallbackText(data.modality)]
  ];

  return (
    <View style={styles.planMetaGrid} wrap={false}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.planMetaCard}>
          <Text style={styles.planMetaLabel}>{label}</Text>
          <Text style={styles.planMetaValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

const getMomentPillStyle = (moment: string) => {
  const normalizedMoment = moment.toLowerCase();

  if (normalizedMoment.includes("inicio")) {
    return { backgroundColor: planColors.blue };
  }

  if (normalizedMoment.includes("desarrollo")) {
    return { backgroundColor: planColors.green };
  }

  if (normalizedMoment.includes("cierre")) {
    return { backgroundColor: planColors.orange };
  }

  return { backgroundColor: planColors.primary };
};

const PdfTimeTable = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.planSection}>
    <PdfSectionTitle>Distribución del tiempo</PdfSectionTitle>
    <View style={styles.planTable}>
      <View style={styles.planTableHeader} wrap={false}>
        <Text style={[styles.planTableHeadCell, { width: "14%" }]}>Tiempo</Text>
        <Text style={[styles.planTableHeadCell, { width: "20%" }]}>Momento</Text>
        <Text style={[styles.planTableHeadCell, { width: "44%" }]}>Actividad</Text>
        <Text style={[styles.planTableHeadCell, { width: "22%" }]}>Técnica</Text>
      </View>
      {data.moments.map((moment, index) => (
        <View
          key={`${moment.moment}-${index}`}
          style={[styles.planTableRow, { backgroundColor: index % 2 === 0 ? "#ffffff" : "#fbfaff" }]}
          wrap={false}
        >
          <Text style={[styles.planTableCell, { width: "14%", fontWeight: 700, color: planColors.text }]}>{formatMinutes(moment.minutes)}</Text>
          <View style={[styles.planTableCell, { width: "20%" }]}>
            <Text style={[styles.momentPill, getMomentPillStyle(moment.moment)]}>{moment.moment}</Text>
          </View>
          <View style={[styles.planTableCell, { width: "44%" }]}>
            <Text style={{ color: planColors.text, fontWeight: 700, marginBottom: 3 }}>{fallbackText(moment.activityName, moment.moment)}</Text>
            <Text>{fallbackText(moment.description, "Actividad pedagógica registrada.")}</Text>
          </View>
          <Text style={[styles.planTableCell, { width: "22%" }]}>{fallbackText(moment.technique, "Estrategia guiada")}</Text>
        </View>
      ))}
    </View>
  </View>
);

const PdfTwoColumnSection = ({ data }: { data: PlanPdfData }) => (
  <View style={styles.twoColumns} wrap={false}>
    <View style={styles.columnCard}>
      <PdfSectionTitle>Evaluación</PdfSectionTitle>
      <Text style={styles.planParagraph}>{fallbackText(data.evaluationCriteria, data.evaluationType)}</Text>
    </View>
    <View style={styles.columnCard}>
      <PdfSectionTitle>Recursos</PdfSectionTitle>
      {data.resourceTags.length ? (
        <View style={styles.tagWrap}>
          {data.resourceTags.map((resource) => (
            <Text key={resource} style={styles.tag}>{resource}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.planParagraph}>{fallbackText(data.resources, "Recursos definidos por el docente.")}</Text>
      )}
    </View>
  </View>
);

const PdfFooter = ({ aiAssisted }: { aiAssisted: boolean }) => (
  <View style={styles.planFooter} fixed>
    <Text style={styles.planFooterText}>Plan generado por PlanLab</Text>
    <Text
      style={styles.planFooterText}
      render={({ pageNumber, totalPages }) => `${aiAssisted ? "PlanLab AI Core · " : ""}Página ${pageNumber} de ${totalPages}`}
    />
    <Text style={styles.planFooterText}>Tu laboratorio pedagógico inteligente</Text>
  </View>
);

export const PlanPdfDocument = ({ data }: { data: PlanPdfData }) => (
  <Document title={data.title} author="PlanLab" subject={`Plan de clase · ${data.subject}`} creator="PlanLab AI Core">
    <Page size="A4" style={styles.planPage}>
      <PdfHeader data={data} />
      <PdfMetaGrid data={data} />

      <View style={styles.planSection} wrap={false}>
        <PdfSectionTitle>Objetivo de aprendizaje</PdfSectionTitle>
        <View style={styles.planObjectiveBox}>
          <Text style={styles.planParagraph}>{fallbackText(data.objective, "Objetivo pendiente de registro.")}</Text>
        </View>
      </View>

      {data.isReinforcement && data.diagnosis ? (
        <View style={styles.planSection} wrap={false}>
          <PdfSectionTitle>Diagnóstico breve</PdfSectionTitle>
          <View style={styles.planObjectiveBox}>
            <Text style={styles.planParagraph}>{data.diagnosis}</Text>
          </View>
        </View>
      ) : null}

      <PdfTimeTable data={data} />
      <PdfTwoColumnSection data={data} />

      {data.teacherRecommendations || data.observations || data.suggestions ? (
        <View style={styles.planSection} wrap={false}>
          <PdfSectionTitle>{data.isReinforcement ? "Recomendaciones docentes" : "Observaciones complementarias"}</PdfSectionTitle>
          <View style={styles.planObjectiveBox}>
            <Text style={styles.planParagraph}>
              {fallbackText(data.teacherRecommendations ?? data.observations ?? data.suggestions, "Sin observaciones complementarias.")}
            </Text>
          </View>
        </View>
      ) : null}

      <PdfFooter aiAssisted={data.aiAssisted} />
    </Page>
  </Document>
);

export const ReportPdfDocument = ({ data }: { data: ReportPdfData }) => (
  <BaseDocument
    documentTitle="Reporte pedagógico"
    subject={`Reporte ${data.reportType}`}
    teacherName={data.teacherName}
    generatedAt={data.generatedAt}
  >
    <View style={[styles.accentPanel, { marginBottom: 14 }]} wrap={false}>
      <Text style={[styles.sectionTitle, { color: colors.accent, marginBottom: 4 }]}>Resumen ejecutivo</Text>
      <Text style={styles.paragraph}>{data.executiveSummary}</Text>
    </View>

    <View style={[styles.sectionCard, { marginBottom: 14 }]} wrap={false}>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Tipo de reporte</Text>
          <Text style={styles.infoValue}>{data.reportType}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Grupo</Text>
          <Text style={styles.infoValue}>
            {data.groupName}
            {data.educationLevel ? ` · ${data.educationLevel}` : ""}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Actividad asociada</Text>
          <Text style={styles.infoValue}>{data.activityTitle || "Reporte general del grupo"}</Text>
        </View>
      </View>
    </View>

    <View style={styles.sectionCard} wrap={false}>
      <Text style={styles.sectionTitle}>Indicadores principales</Text>
      <View style={[styles.grid, { justifyContent: "space-between" }]}>
        <View style={[styles.statCard, { width: "32%" }]}>
          <Text style={styles.statLabel}>Promedio general</Text>
          <Text style={styles.statValue}>{formatScore(data.averageScore)}</Text>
        </View>
        <View style={[styles.statCard, { width: "32%" }]}>
          <Text style={styles.statLabel}>Asistencia promedio</Text>
          <Text style={styles.statValue}>{formatPercent(data.attendanceAverage)}</Text>
        </View>
        <View style={[styles.statCard, { width: "32%" }]}>
          <Text style={styles.statLabel}>Alertas</Text>
          <Text style={styles.statValue}>{data.alerts.length}</Text>
        </View>
      </View>
    </View>

    <View style={[styles.grid, { justifyContent: "space-between", marginTop: 14 }]}>
      <View style={[styles.sectionCard, { width: "48.5%" }]} wrap={false}>
        <Text style={styles.sectionTitle}>Alertas detectadas</Text>
        {data.alerts.length ? (
          data.alerts.map((alert, index) => (
            <Text key={index} style={styles.listItem}>
              • {alert}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No se detectaron alertas activas en este corte.</Text>
        )}
      </View>

      <View style={[styles.sectionCard, { width: "48.5%" }]} wrap={false}>
        <Text style={styles.sectionTitle}>Observaciones generales</Text>
        {data.observations.length ? (
          data.observations.map((observation, index) => (
            <Text key={index} style={styles.listItem}>
              • {observation}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>No se registraron observaciones adicionales para este reporte.</Text>
        )}
      </View>
    </View>
  </BaseDocument>
);

export const ResultsPdfDocument = ({ data }: { data: ResultsPdfData }) => (
  <BaseDocument
    documentTitle="Resultados consolidados"
    subject={`Resultados · ${data.groupName}`}
    teacherName={data.teacherName}
    generatedAt={data.generatedAt}
  >
    <View style={styles.sectionCard} wrap={false}>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Grupo</Text>
          <Text style={styles.infoValue}>
            {data.groupName}
            {data.educationLevel ? ` · ${data.educationLevel}` : ""}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Actividad</Text>
          <Text style={styles.infoValue}>{data.activityTitle || "Consolidado general del grupo"}</Text>
        </View>
      </View>
    </View>

    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>Indicadores del grupo</Text>
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Promedio del grupo</Text>
          <Text style={styles.statValue}>{formatScore(data.averageScore)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Asistencia promedio</Text>
          <Text style={styles.statValue}>{formatPercent(data.attendanceAverage)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Estudiantes listados</Text>
          <Text style={styles.statValue}>{data.rows.length}</Text>
        </View>
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detalle por estudiante</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader} wrap={false}>
          <Text style={[styles.tableCell, { width: "34%", fontWeight: 700 }]}>Estudiante</Text>
          <Text style={[styles.tableCell, { width: "16%", fontWeight: 700 }]}>Asistencia</Text>
          <Text style={[styles.tableCell, { width: "12%", fontWeight: 700 }]}>Nota</Text>
          <Text style={[styles.tableCell, { width: "38%", fontWeight: 700 }]}>Observación</Text>
        </View>
        {data.rows.map((row) => (
          <View key={row.id} style={styles.tableRow} wrap={false}>
            <Text style={[styles.tableCell, { width: "34%" }]}>{row.studentName}</Text>
            <Text style={[styles.tableCell, { width: "16%" }]}>{row.attended ? "Asistió" : "No asistió"}</Text>
            <Text style={[styles.tableCell, { width: "12%" }]}>{row.resultScore === null ? "—" : row.resultScore.toFixed(1)}</Text>
            <Text style={[styles.tableCell, { width: "38%" }]}>{row.observation || "Sin observación"}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.sectionCard} wrap={false}>
      <Text style={styles.sectionTitle}>Alertas y seguimiento</Text>
      {data.alerts.length ? data.alerts.map((alert, index) => <Text key={index} style={styles.listItem}>• {alert}</Text>) : <Text style={styles.paragraph}>No se detectaron alertas activas en este grupo.</Text>}
    </View>
  </BaseDocument>
);
