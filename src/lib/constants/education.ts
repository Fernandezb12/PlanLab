export const educationLevels = ["Preescolar", "Básica primaria", "Básica secundaria", "Media", "Otro"] as const;

export const generalSubjectOptions = [
  "Matemáticas",
  "Lengua Castellana",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Inglés",
  "Educación Física",
  "Educación Artística",
  "Ética y Valores",
  "Religión",
  "Tecnología e Informática",
  "Emprendimiento",
  "Filosofía",
  "Física",
  "Química",
  "Biología",
  "Economía",
  "Política",
  "Otra"
] as const;

export const preschoolSubjectOptions = [
  "Dimensión comunicativa",
  "Dimensión cognitiva",
  "Dimensión corporal",
  "Dimensión socioafectiva",
  "Dimensión estética",
  "Dimensión ética",
  "Proyecto pedagógico",
  "Actividad integradora",
  "Otra"
] as const;

const normalizeEducationText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const normalizeEducationLevel = (value: unknown): (typeof educationLevels)[number] | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = normalizeEducationText(value);
  const aliases: Record<string, (typeof educationLevels)[number]> = {
    preescolar: "Preescolar",
    "basica primaria": "Básica primaria",
    primaria: "Básica primaria",
    "basica secundaria": "Básica secundaria",
    secundaria: "Básica secundaria",
    media: "Media",
    "educacion media": "Media",
    otro: "Otro",
    otra: "Otro"
  };

  return aliases[normalizedValue];
};

export const isPreschoolLevel = (level?: string | null) => normalizeEducationText(level ?? "") === "preescolar";

export const getSubjectOptionsForLevel = (level?: string | null) => {
  const preferredOptions = isPreschoolLevel(level) ? preschoolSubjectOptions : generalSubjectOptions;
  const secondaryOptions = isPreschoolLevel(level) ? generalSubjectOptions : preschoolSubjectOptions;

  return Array.from(new Set([...preferredOptions, ...secondaryOptions]));
};
