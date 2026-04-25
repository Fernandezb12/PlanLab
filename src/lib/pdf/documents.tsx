import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

import {
  PdfDiagnosticBox,
  PdfFooter,
  PdfMetaGrid,
  PdfObjectiveBox,
  PdfRecommendationsBox,
  PdfTitleBlock,
  PdfTimeTable,
  PdfTwoColumnSection,
  planPageStyle,
  type PlanPdfData
} from "@/lib/pdf/components";

type BaseDocumentProps = {
  documentTitle: string;
  subject: string;
  teacherName: string;
  generatedAt: string;
  aiAssisted?: boolean;
  children: ReactNode;
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
  }
});

const formatDate = (value: string) => new Date(value).toLocaleDateString("es-CO", { dateStyle: "long" });
const formatScore = (value: number | null, fallback = "Sin datos") => (value === null ? fallback : value.toFixed(1));
const formatPercent = (value: number | null, fallback = "Sin datos") => (value === null ? fallback : `${Math.round(value)}%`);
const hyphenationCallback = (word: string | null) => [word ?? ""];
Font.registerHyphenationCallback(hyphenationCallback);

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

export const PlanPdfDocument = ({ data }: { data: PlanPdfData }) => (
  <Document title={data.title} author="PlanLab" subject={`Plan de clase · ${data.subject}`} creator="PlanLab AI Core">
    <Page size="A4" style={planPageStyle}>
      <PdfTitleBlock data={data} />
      <PdfMetaGrid data={data} />
      <PdfObjectiveBox objective={data.objective} />
      {data.isReinforcement ? <PdfDiagnosticBox diagnosis={data.diagnosis} /> : null}
      <PdfTimeTable data={data} />
      <PdfTwoColumnSection data={data} />
      <PdfRecommendationsBox recommendations={data.observations} title="Observaciones docentes" />
      <PdfRecommendationsBox
        recommendations={data.suggestions}
        title="Recomendaciones metodológicas"
        fallback="No se registraron recomendaciones adicionales."
        alwaysRender
      />
      {data.isReinforcement ? <PdfRecommendationsBox recommendations={data.teacherRecommendations} title="Recomendaciones docentes" /> : null}
      <PdfFooter />
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
