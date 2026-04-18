export const dashboardStats = [
  { id: "kpi-1", title: "Planes creados", value: "12", delta: "+3 esta semana", tone: "violet" },
  { id: "kpi-2", title: "Próximas actividades", value: "3", delta: "2 hoy", tone: "blue" },
  { id: "kpi-3", title: "Promedio general grupos", value: "8.2", delta: "+0.4 mensual", tone: "indigo" },
  { id: "kpi-4", title: "Alertas pendientes", value: "4", delta: "1 crítica", tone: "amber" }
];

export const quickActions = [
  { id: "qa-1", title: "Generar plan con IA", href: "/planes", color: "from-violet-500 to-indigo-500" },
  { id: "qa-2", title: "Programar actividad", href: "/actividades", color: "from-blue-500 to-cyan-500" },
  { id: "qa-3", title: "Registrar resultados", href: "/resultados", color: "from-emerald-500 to-teal-500" },
  { id: "qa-4", title: "Generar reporte", href: "/reportes", color: "from-slate-500 to-slate-700" }
];

export const recentActivity = [
  { id: "ra-1", text: "Editaste plan: Introducción a la célula", time: "hace 2h" },
  { id: "ra-2", text: "Registraste actividad: Laboratorio de Química 7A", time: "ayer" },
  { id: "ra-3", text: "Generaste reporte de grupo 9C", time: "ayer" }
];

export const pedagogicalAlerts = [
  { id: "al-1", level: "alerta", text: "Bajo rendimiento en 5A (Matemática)" },
  { id: "al-2", level: "alerta", text: "Alta inasistencia en 7B (Historia)" },
  { id: "al-3", level: "pendiente", text: "Pendiente registrar actividad: Taller de Arte" }
];

export const plansData = [
  { id: "pl-1", topic: "Introducción a la célula", group: "7A", area: "Ciencias", duration: "90 min", status: "listo", date: "2026-04-21" },
  { id: "pl-2", topic: "Fracciones equivalentes", group: "5A", area: "Matemática", duration: "120 min", status: "generado", date: "2026-04-22" },
  { id: "pl-3", topic: "Narrativa breve", group: "8C", area: "Lenguaje", duration: "60 min", status: "borrador", date: "2026-04-24" },
  { id: "pl-4", topic: "Revolución industrial", group: "9C", area: "Historia", duration: "90 min", status: "archivado", date: "2026-04-18" }
];

export const activitiesData = [
  { id: "ac-1", title: "Laboratorio guiado", status: "en curso", group: "7A", date: "2026-04-18", relatedPlan: "Introducción a la célula" },
  { id: "ac-2", title: "Quiz diagnóstico", status: "programada", group: "5A", date: "2026-04-20", relatedPlan: "Fracciones equivalentes" },
  { id: "ac-3", title: "Debate histórico", status: "pendiente de registro", group: "9C", date: "2026-04-17", relatedPlan: "Revolución industrial" },
  { id: "ac-4", title: "Evaluación de cierre", status: "finalizada", group: "8C", date: "2026-04-15", relatedPlan: "Narrativa breve" }
];

export const resultsPanels = {
  average: "8.2",
  attendance: "91%",
  difficultGroups: ["5A", "7B"],
  studentsAlert: ["Sofía M.", "Tomás R.", "Valentina P."]
};

export const resultsProgress = [
  { group: "5A", score: 68 },
  { group: "7A", score: 82 },
  { group: "7B", score: 64 },
  { group: "9C", score: 79 }
];

export const reportsData = [
  { id: "rp-1", title: "Reporte mensual 5A", type: "Rendimiento", date: "2026-04-10", group: "5A" },
  { id: "rp-2", title: "Seguimiento asistencia 7B", type: "Asistencia", date: "2026-04-12", group: "7B" },
  { id: "rp-3", title: "Reporte comparativo 9C", type: "Comparativo", date: "2026-04-14", group: "9C" }
];

export const groupsData = [
  { id: "g-1", name: "5A", level: "Básica Primaria", area: "General", students: 31 },
  { id: "g-2", name: "7A", level: "Básica Secundaria", area: "Ciencias", students: 28 },
  { id: "g-3", name: "9C", level: "Educación Media", area: "Historia", students: 26 }
];

export const studentsByGroup = [
  { id: "s-1", name: "Daniela Ruiz", code: "A-015", status: "activo", note: "Requiere refuerzo en fracciones", group: "5A" },
  { id: "s-2", name: "Mateo Silva", code: "B-022", status: "activo", note: "Buena participación", group: "7A" },
  { id: "s-3", name: "Camila Torres", code: "C-007", status: "seguimiento", note: "Inasistencia recurrente", group: "7A" },
  { id: "s-4", name: "Nicolás Pérez", code: "D-019", status: "activo", note: "Mejora sostenida", group: "9C" }
];

export const profileData = {
  fullName: "Daniel Fernández",
  email: "daniel@planlab.app",
  level: "Educación Media",
  preferences: ["Notificaciones de alertas", "Recordatorios semanales", "Resumen diario"],
  theme: "Sistema"
};
