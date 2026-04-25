"use client";

import { AlertTriangle, CheckCircle2, Download, Eye, FileSpreadsheet, Info, LoaderCircle, Upload, XCircle } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";

import { Modal } from "@/components/ui/modal";
import { type ActionResult, importStudentsAction } from "@/features/groups/actions";
import { importedStudentPreviewSchema, studentStatuses, type ImportedStudentPreviewInput } from "@/lib/validations/groups";

type GroupOption = {
  id: string;
  name: string;
};

type ExistingStudent = {
  groupId: string | null;
  studentCode: string | null;
};

type ImportStudentsDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  existingStudents: ExistingStudent[];
  onClose: () => void;
  onCompleted: (result: ActionResult) => void;
};

type PreviewState = "valid" | "warning" | "error";

type PreviewRow = {
  rowNumber: number;
  fullName: string;
  studentCode: string | null;
  status: string;
  notes: string | null;
  validationState: PreviewState;
  validationMessage: string;
};

type StudentStatus = (typeof studentStatuses)[number];
type ImportField = "fullName" | "studentCode" | "status" | "notes";

const acceptedHeaderAliases: Record<string, ImportField> = {
  nombre: "fullName",
  nombre_completo: "fullName",
  full_name: "fullName",
  estudiante: "fullName",
  student_name: "fullName",
  codigo: "studentCode",
  student_code: "studentCode",
  identificacion: "studentCode",
  documento: "studentCode",
  code: "studentCode",
  estado: "status",
  status: "status",
  observacion: "notes",
  observaciones: "notes",
  notas: "notes",
  notes: "notes",
  note: "notes"
};

const templateRows = [
  ["Nombre completo", "Código", "Estado", "Observación"],
  ["Ana Martínez", "STU004", "activo", "Buen progreso"],
  ["Carlos Rodríguez", "STU003", "inactivo", "Retiro temporal"]
];

const emptyPreviewState = {
  fileName: null as string | null,
  previewRows: [] as PreviewRow[],
  validRows: [] as ImportedStudentPreviewInput[],
  criticalErrors: 0,
  warningRows: 0,
  duplicateRowsInFile: 0,
  existingDuplicateRows: 0,
  emptyCodeRows: 0,
  invalidStatusRows: 0,
  parseError: null as string | null
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");

const normalizeCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeStatus = (value: string): StudentStatus | null => {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return "activo";
  }

  return studentStatuses.includes(normalized as StudentStatus) ? (normalized as StudentStatus) : null;
};

const buildMessage = (count: number, singular: string, plural: string) => (count === 1 ? singular : plural.replace("{count}", String(count)));

const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  worksheet["!cols"] = [{ wch: 26 }, { wch: 16 }, { wch: 14 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
  XLSX.writeFile(workbook, "plantilla-estudiantes-planlab.xlsx");
};

export const ImportStudentsDialog = ({ isOpen, groups, existingStudents, onClose, onCompleted }: ImportStudentsDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [validRows, setValidRows] = useState<ImportedStudentPreviewInput[]>([]);
  const [criticalErrors, setCriticalErrors] = useState(0);
  const [warningRows, setWarningRows] = useState(0);
  const [duplicateRowsInFile, setDuplicateRowsInFile] = useState(0);
  const [existingDuplicateRows, setExistingDuplicateRows] = useState(0);
  const [emptyCodeRows, setEmptyCodeRows] = useState(0);
  const [invalidStatusRows, setInvalidStatusRows] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [isPending, startTransition] = useTransition();

  const existingCodesForGroup = useMemo(() => {
    return new Set(
      existingStudents
        .filter((student) => student.groupId === selectedGroupId && student.studentCode?.trim())
        .map((student) => student.studentCode?.trim().toLowerCase())
        .filter((code): code is string => Boolean(code))
    );
  }, [existingStudents, selectedGroupId]);

  const resetState = () => {
    setSelectedGroupId(groups[0]?.id ?? "");
    setFileName(emptyPreviewState.fileName);
    setPreviewRows(emptyPreviewState.previewRows);
    setValidRows(emptyPreviewState.validRows);
    setCriticalErrors(emptyPreviewState.criticalErrors);
    setWarningRows(emptyPreviewState.warningRows);
    setDuplicateRowsInFile(emptyPreviewState.duplicateRowsInFile);
    setExistingDuplicateRows(emptyPreviewState.existingDuplicateRows);
    setEmptyCodeRows(emptyPreviewState.emptyCodeRows);
    setInvalidStatusRows(emptyPreviewState.invalidStatusRows);
    setParseError(emptyPreviewState.parseError);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const clearFileState = () => {
    setFileName(emptyPreviewState.fileName);
    setPreviewRows(emptyPreviewState.previewRows);
    setValidRows(emptyPreviewState.validRows);
    setCriticalErrors(emptyPreviewState.criticalErrors);
    setWarningRows(emptyPreviewState.warningRows);
    setDuplicateRowsInFile(emptyPreviewState.duplicateRowsInFile);
    setExistingDuplicateRows(emptyPreviewState.existingDuplicateRows);
    setEmptyCodeRows(emptyPreviewState.emptyCodeRows);
    setInvalidStatusRows(emptyPreviewState.invalidStatusRows);
    setParseError(emptyPreviewState.parseError);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const validationMessages = useMemo(() => {
    const messages: string[] = [];

    if (emptyCodeRows > 0) {
      messages.push(buildMessage(emptyCodeRows, "1 fila tiene código vacío.", "{count} filas tienen código vacío."));
    }

    if (existingDuplicateRows > 0) {
      messages.push(buildMessage(existingDuplicateRows, "1 estudiante ya existe en este grupo.", "{count} estudiantes ya existen en este grupo."));
    }

    if (duplicateRowsInFile > 0) {
      messages.push(buildMessage(duplicateRowsInFile, "1 fila tiene código duplicado dentro del archivo.", "{count} filas tienen código duplicado dentro del archivo."));
    }

    if (invalidStatusRows > 0) {
      messages.push(buildMessage(invalidStatusRows, "1 fila tiene un estado no válido.", "{count} filas tienen un estado no válido."));
    }

    return messages;
  }, [duplicateRowsInFile, emptyCodeRows, existingDuplicateRows, invalidStatusRows]);

  const previewSummary = useMemo(
    () => ({
      total: previewRows.length,
      valid: validRows.length,
      errors: criticalErrors,
      warnings: warningRows
    }),
    [criticalErrors, previewRows.length, validRows.length, warningRows]
  );

  const parseWorkbookFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    clearFileState();

    if (!extension || !["xlsx", "csv"].includes(extension)) {
      setParseError("Formato no soportado. Usa un archivo .xlsx o .csv.");
      return;
    }

    if (!selectedGroupId) {
      setParseError("Selecciona un grupo antes de cargar el archivo.");
      return;
    }

    setIsParsing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setParseError("El archivo está vacío o no tiene hojas válidas.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
        header: 1,
        blankrows: false,
        defval: ""
      });

      if (!rows.length) {
        setParseError("El archivo está vacío.");
        return;
      }

      const [headerRow, ...dataRows] = rows;
      const headerMap = headerRow.reduce<Record<number, ImportField>>((acc, value, index) => {
        const normalized = acceptedHeaderAliases[normalizeHeader(value)];

        if (normalized) {
          acc[index] = normalized;
        }

        return acc;
      }, {});

      if (!Object.values(headerMap).includes("fullName")) {
        setParseError("No se encontraron columnas compatibles. Descarga la plantilla e intenta nuevamente.");
        return;
      }

      const nextPreviewRows: PreviewRow[] = [];
      const nextValidRows: ImportedStudentPreviewInput[] = [];
      const seenCodesInFile = new Set<string>();
      let nextCriticalErrors = 0;
      let nextWarnings = 0;
      let nextDuplicateRows = 0;
      let nextExistingDuplicates = 0;
      let nextEmptyCodeRows = 0;
      let nextInvalidStatusRows = 0;

      dataRows.forEach((row, rowIndex) => {
        const rowObject = Object.entries(headerMap).reduce<Record<ImportField, string>>(
          (acc, [columnIndex, fieldName]) => {
            acc[fieldName] = normalizeCell(row[Number(columnIndex)]);
            return acc;
          },
          { fullName: "", studentCode: "", status: "", notes: "" }
        );

        const isCompletelyEmpty = !rowObject.fullName && !rowObject.studentCode && !rowObject.status && !rowObject.notes;

        if (isCompletelyEmpty) {
          return;
        }

        const normalizedStatus = normalizeStatus(rowObject.status);
        const normalizedCode = rowObject.studentCode ? rowObject.studentCode.trim() : null;
        const normalizedCodeKey = normalizedCode?.toLowerCase() ?? null;
        const candidate = {
          rowNumber: rowIndex + 2,
          fullName: rowObject.fullName,
          studentCode: normalizedCode,
          status: normalizedStatus ?? "activo",
          notes: rowObject.notes ? rowObject.notes : null
        };

        if (!normalizedStatus) {
          nextCriticalErrors += 1;
          nextInvalidStatusRows += 1;
          nextPreviewRows.push({
            ...candidate,
            status: rowObject.status || "Sin estado",
            validationState: "error",
            validationMessage: "Estado no válido. Usa activo, seguimiento o inactivo."
          });
          return;
        }

        const parsed = importedStudentPreviewSchema.safeParse(candidate);

        if (!parsed.success) {
          nextCriticalErrors += 1;
          nextPreviewRows.push({
            ...candidate,
            validationState: "error",
            validationMessage: parsed.error.issues[0]?.message ?? "Revisa esta fila antes de importar."
          });
          return;
        }

        if (!normalizedCode) {
          nextWarnings += 1;
          nextEmptyCodeRows += 1;
          nextPreviewRows.push({
            ...parsed.data,
            validationState: "warning",
            validationMessage: "Código vacío. Se importará sin código."
          });
          nextValidRows.push(parsed.data);
          return;
        }

        if (normalizedCodeKey && seenCodesInFile.has(normalizedCodeKey)) {
          nextCriticalErrors += 1;
          nextDuplicateRows += 1;
          nextPreviewRows.push({
            ...parsed.data,
            validationState: "error",
            validationMessage: "Código duplicado dentro del archivo."
          });
          return;
        }

        if (normalizedCodeKey && existingCodesForGroup.has(normalizedCodeKey)) {
          nextWarnings += 1;
          nextExistingDuplicates += 1;
          nextPreviewRows.push({
            ...parsed.data,
            validationState: "warning",
            validationMessage: "Ya existe en este grupo. Se omitirá al importar."
          });
          seenCodesInFile.add(normalizedCodeKey);
          return;
        }

        if (normalizedCodeKey) {
          seenCodesInFile.add(normalizedCodeKey);
        }
        nextPreviewRows.push({
          ...parsed.data,
          validationState: "valid",
          validationMessage: "Lista para importar."
        });
        nextValidRows.push(parsed.data);
      });

      if (nextPreviewRows.length === 0) {
        setParseError("No se detectaron estudiantes en el archivo. Revisa la plantilla e intenta nuevamente.");
        return;
      }

      setFileName(file.name);
      setPreviewRows(nextPreviewRows);
      setValidRows(nextValidRows);
      setCriticalErrors(nextCriticalErrors);
      setWarningRows(nextWarnings);
      setDuplicateRowsInFile(nextDuplicateRows);
      setExistingDuplicateRows(nextExistingDuplicates);
      setEmptyCodeRows(nextEmptyCodeRows);
      setInvalidStatusRows(nextInvalidStatusRows);
    } catch (error) {
      console.error("Error real leyendo archivo de estudiantes:", error);
      setParseError("No fue posible leer el archivo. Verifica que sea un Excel o CSV válido e intenta nuevamente.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await parseWorkbookFile(file);
  };

  const handleConfirmImport = () => {
    if (!selectedGroupId) {
      setParseError("Selecciona un grupo antes de confirmar la importación.");
      return;
    }

    if (validRows.length === 0) {
      setParseError("No hay estudiantes válidos para importar.");
      return;
    }

    if (criticalErrors > 0) {
      setParseError("Corrige las filas marcadas antes de confirmar la importación.");
      return;
    }

    startTransition(async () => {
      const result = await importStudentsAction({
        groupId: selectedGroupId,
        students: validRows
      });

      onCompleted(result);

      if (result.success) {
        resetState();
      }
    });
  };

  const closeDialog = () => {
    if (!isPending && !isParsing) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDialog}
      title="Importar estudiantes"
      description="Carga un archivo Excel o CSV, revisa la vista previa y confirma antes de guardar."
      contentClassName="max-w-none p-0 md:w-[min(1180px,calc(100vw-48px))]"
      bodyClassName="min-h-0 flex flex-1 flex-col overflow-hidden p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-5 scroll-smooth [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-width:thin] sm:px-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/70">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-blue-200 bg-blue-50/95 p-4 text-blue-950 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white dark:bg-blue-500/80">
                  <Info className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">Antes de importar</h3>
                  <p className="mt-1 text-sm leading-6 text-blue-900/85 dark:text-blue-100/80">
                    Usa la plantilla oficial de PlanLab para evitar errores. El archivo debe contener una fila por estudiante y las columnas:
                    Nombre completo, Código, Estado y Observación.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      <Download className="h-4 w-4" />
                      Descargar plantilla Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExample((current) => !current)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white/80 px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15 dark:border-blue-400/25 dark:bg-white/5 dark:text-blue-100 dark:hover:bg-white/10"
                    >
                      <Eye className="h-4 w-4" />
                      {showExample ? "Ocultar ejemplo" : "Ver ejemplo de formato"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showExample ? (
              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Ejemplo de formato</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <tr>
                        {templateRows[0].map((header) => (
                          <th key={header} className="px-4 py-3 text-left font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {templateRows.slice(1).map((row) => (
                        <tr key={row[1]} className="border-t border-slate-100 text-slate-700 dark:border-white/5 dark:text-slate-200">
                          {row.map((cell) => (
                            <td key={cell} className="px-4 py-3">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Grupo de destino</label>
                <select
                  value={selectedGroupId}
                  onChange={(event) => {
                    setSelectedGroupId(event.target.value);
                    clearFileState();
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">Selecciona un grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Archivo</p>
                <div
                  className="rounded-[24px] border border-dashed border-slate-300 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-white/[0.04]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedFile = event.dataTransfer.files?.[0];

                    if (droppedFile) {
                      void parseWorkbookFile(droppedFile);
                    }
                  }}
                >
                  <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                        <FileSpreadsheet className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                        Arrastra tu archivo aquí
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">o selecciónalo manualmente. Formatos permitidos: .xlsx, .csv.</p>
                      {fileName ? <p className="text-xs text-slate-500 dark:text-slate-500">Archivo cargado: {fileName}</p> : null}
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                      <input ref={inputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(event) => void handleFileChange(event)} />
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-white/10"
                      >
                        <Upload className="h-4 w-4" />
                        Seleccionar archivo
                      </button>
                      <button
                        type="button"
                        onClick={clearFileState}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {parseError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
                <div className="inline-flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {parseError}
                </div>
              </div>
            ) : null}

            {isParsing ? (
              <div className="flex items-center gap-3 rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Procesando archivo y preparando vista previa...
              </div>
            ) : null}

            {!fileName && !parseError && !isParsing ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                Selecciona un archivo Excel o CSV para revisar los estudiantes antes de guardarlos.
              </div>
            ) : null}

            {previewRows.length > 0 ? (
              <>
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Se detectaron {previewSummary.total} estudiantes</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Revisa la información antes de confirmar la importación.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                        {previewSummary.valid} listos
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                        {previewSummary.warnings} avisos
                      </span>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-200">
                        {previewSummary.errors} errores
                      </span>
                    </div>
                  </div>
                </div>

                {validationMessages.length > 0 ? (
                  <div className="rounded-[22px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
                    <div className="mb-2 inline-flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Revisión del archivo
                    </div>
                    <ul className="space-y-1">
                      {validationMessages.map((message) => (
                        <li key={message}>• {message}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="rounded-[24px] border border-slate-200 bg-white dark:border-white/10 dark:bg-black/10">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Vista previa de importación</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Las filas con errores deben corregirse antes de importar.</p>
                  </div>
                  <div className="max-h-[38dvh] overflow-auto overscroll-contain [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/70">
                    <table className="w-full min-w-[920px] text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-950">
                        <tr className="border-b border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300">
                          <th className="px-4 py-3 text-left">Fila</th>
                          <th className="px-4 py-3 text-left">Nombre completo</th>
                          <th className="px-4 py-3 text-left">Código</th>
                          <th className="px-4 py-3 text-left">Estado</th>
                          <th className="px-4 py-3 text-left">Observación</th>
                          <th className="px-4 py-3 text-left">Estado de validación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.studentCode ?? row.fullName}`} className="border-b border-slate-100 text-slate-700 dark:border-white/5 dark:text-slate-200">
                            <td className="px-4 py-3">{row.rowNumber}</td>
                            <td className="px-4 py-3 font-medium">{row.fullName || "Sin nombre"}</td>
                            <td className="px-4 py-3">{row.studentCode ?? "Sin código"}</td>
                            <td className="px-4 py-3">{row.status}</td>
                            <td className="max-w-[280px] px-4 py-3 text-slate-500 dark:text-slate-400">{row.notes ?? "Sin observación"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  row.validationState === "valid"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                                    : row.validationState === "warning"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
                                }`}
                              >
                                {row.validationState === "valid" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : null}
                                {row.validationMessage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-white/10 dark:bg-slate-950">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isPending || isParsing}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isPending || isParsing || validRows.length === 0 || criticalErrors > 0 || !selectedGroupId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Confirmar importación
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
