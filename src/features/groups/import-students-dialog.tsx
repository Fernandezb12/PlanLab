"use client";

import { AlertTriangle, FileSpreadsheet, LoaderCircle, Upload, XCircle } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import * as XLSX from "xlsx";

import { Modal } from "@/components/ui/modal";
import { type ActionResult, importStudentsAction } from "@/features/groups/actions";
import { importedStudentPreviewSchema, studentStatuses, type ImportedStudentPreviewInput } from "@/lib/validations/groups";

type GroupOption = {
  id: string;
  name: string;
};

type ImportStudentsDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  onClose: () => void;
  onCompleted: (result: ActionResult) => void;
};

type PreviewRow = ImportedStudentPreviewInput & {
  isValid: boolean;
  error?: string;
};

type StudentStatus = (typeof studentStatuses)[number];

const acceptedHeaderAliases: Record<string, "fullName" | "studentCode" | "status" | "notes"> = {
  full_name: "fullName",
  fullname: "fullName",
  nombre: "fullName",
  nombre_completo: "fullName",
  student_code: "studentCode",
  codigo: "studentCode",
  code: "studentCode",
  status: "status",
  estado: "status",
  notes: "notes",
  note: "notes",
  observacion: "notes",
  observaciones: "notes"
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const normalizeCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const emptyPreviewState = {
  fileName: null as string | null,
  previewRows: [] as PreviewRow[],
  validRows: [] as ImportedStudentPreviewInput[],
  invalidRows: 0,
  duplicateRowsInFile: 0,
  parseError: null as string | null
};

export const ImportStudentsDialog = ({ isOpen, groups, onClose, onCompleted }: ImportStudentsDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [validRows, setValidRows] = useState<ImportedStudentPreviewInput[]>([]);
  const [invalidRows, setInvalidRows] = useState(0);
  const [duplicateRowsInFile, setDuplicateRowsInFile] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const resetState = () => {
    setSelectedGroupId(groups[0]?.id ?? "");
    setFileName(emptyPreviewState.fileName);
    setPreviewRows(emptyPreviewState.previewRows);
    setValidRows(emptyPreviewState.validRows);
    setInvalidRows(emptyPreviewState.invalidRows);
    setDuplicateRowsInFile(emptyPreviewState.duplicateRowsInFile);
    setParseError(emptyPreviewState.parseError);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const previewSummary = useMemo(
    () => ({
      total: previewRows.length,
      valid: validRows.length,
      invalid: invalidRows,
      duplicatesInFile: duplicateRowsInFile
    }),
    [duplicateRowsInFile, invalidRows, previewRows.length, validRows.length]
  );

  const parseWorkbookFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !["xlsx", "csv"].includes(extension)) {
      setParseError("Formato no soportado. Usa un archivo .xlsx o .csv.");
      return;
    }

    if (!selectedGroupId) {
      setParseError("Selecciona un grupo antes de cargar el archivo.");
      return;
    }

    setIsParsing(true);
    setParseError(null);

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
      const headerMap = headerRow.reduce<Record<number, "fullName" | "studentCode" | "status" | "notes">>((acc, value, index) => {
        const normalized = acceptedHeaderAliases[normalizeHeader(value)];

        if (normalized) {
          acc[index] = normalized;
        }

        return acc;
      }, {});

      if (!Object.values(headerMap).includes("fullName")) {
        setParseError("Encabezados inválidos. El archivo debe incluir al menos la columna full_name.");
        return;
      }

      const nextPreviewRows: PreviewRow[] = [];
      const nextValidRows: ImportedStudentPreviewInput[] = [];
      const seenCodesInFile = new Set<string>();
      let nextInvalidRows = 0;
      let nextDuplicateRows = 0;

      dataRows.forEach((row, rowIndex) => {
        const rowObject = Object.entries(headerMap).reduce<Record<string, string>>((acc, [columnIndex, fieldName]) => {
          acc[fieldName] = normalizeCell(row[Number(columnIndex)]);
          return acc;
        }, {});

        const isCompletelyEmpty = !rowObject.fullName && !rowObject.studentCode && !rowObject.status && !rowObject.notes;

        if (isCompletelyEmpty) {
          return;
        }

        const normalizedStatus = rowObject.status ? rowObject.status.toLowerCase() : "activo";
        const normalizedCode = rowObject.studentCode ? rowObject.studentCode.trim() : null;

        const normalizedPreviewStatus: StudentStatus = studentStatuses.includes(normalizedStatus as StudentStatus) ? (normalizedStatus as StudentStatus) : "activo";

        const candidate = {
          rowNumber: rowIndex + 2,
          fullName: rowObject.fullName ?? "",
          studentCode: normalizedCode,
          status: normalizedPreviewStatus,
          notes: rowObject.notes ? rowObject.notes : null
        };

        const parsed = importedStudentPreviewSchema.safeParse(candidate);

        if (!parsed.success) {
          nextInvalidRows += 1;
          nextPreviewRows.push({
            ...candidate,
            isValid: false,
            error: parsed.error.issues[0]?.message ?? "Fila inválida"
          });
          return;
        }

        if (normalizedCode && seenCodesInFile.has(normalizedCode)) {
          nextInvalidRows += 1;
          nextDuplicateRows += 1;
          nextPreviewRows.push({
            ...parsed.data,
            isValid: false,
            error: "Código duplicado dentro del archivo"
          });
          return;
        }

        if (normalizedCode) {
          seenCodesInFile.add(normalizedCode);
        }

        nextPreviewRows.push({
          ...parsed.data,
          isValid: true
        });
        nextValidRows.push(parsed.data);
      });

      if (nextPreviewRows.length === 0) {
        setParseError("No encontramos filas válidas en el archivo.");
        return;
      }

      setFileName(file.name);
      setPreviewRows(nextPreviewRows);
      setValidRows(nextValidRows);
      setInvalidRows(nextInvalidRows);
      setDuplicateRowsInFile(nextDuplicateRows);
    } catch (error) {
      console.error("Error real leyendo archivo de estudiantes:", error);
      setParseError(error instanceof Error ? `No pudimos leer el archivo: ${error.message}` : "No pudimos leer el archivo.");
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending && !isParsing) {
          onClose();
        }
      }}
      title="Importar estudiantes"
      description="Carga un archivo .xlsx o .csv, revisa la previsualización y confirma antes de guardar."
      contentClassName="max-w-6xl max-h-[85vh] overflow-hidden p-0"
    >
      <div className="flex max-h-[85vh] min-h-0 flex-col">
        <div className="shrink-0 border-b border-slate-200 px-6 pb-5 pt-6 dark:border-white/10">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Grupo de destino</label>
              <select
                value={selectedGroupId}
                onChange={(event) => setSelectedGroupId(event.target.value)}
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
                className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/85 p-5 dark:border-white/15 dark:bg-white/[0.04]"
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
                      Arrastra tu archivo o selecciónalo manualmente
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Encabezados recomendados: `full_name`, `student_code`, `status`, `notes`.</p>
                    {fileName ? <p className="text-xs text-slate-500 dark:text-slate-500">Archivo cargado: {fileName}</p> : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <input ref={inputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={(event) => void handleFileChange(event)} />
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/10"
                    >
                      <Upload className="h-4 w-4" />
                      Seleccionar archivo
                    </button>
                    <button
                      type="button"
                      onClick={resetState}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      <XCircle className="h-4 w-4" />
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
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

            {previewRows.length > 0 ? (
              <>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Filas detectadas</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{previewSummary.total}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/15 dark:bg-emerald-500/10">
                    <p className="text-xs uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300/80">Válidas</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-white">{previewSummary.valid}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/15 dark:bg-amber-500/10">
                    <p className="text-xs uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300/80">Inválidas</p>
                    <p className="mt-2 text-3xl font-bold text-amber-900 dark:text-white">{previewSummary.invalid}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-500/15 dark:bg-rose-500/10">
                    <p className="text-xs uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300/80">Duplicadas en archivo</p>
                    <p className="mt-2 text-3xl font-bold text-rose-900 dark:text-white">{previewSummary.duplicatesInFile}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white dark:border-white/10 dark:bg-black/10">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-white/10">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Vista previa de importación</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revisa las filas detectadas antes de confirmar el guardado en Supabase.</p>
                  </div>
                  <div className="max-h-[34vh] overflow-auto">
                    <table className="w-full min-w-[920px] text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-950">
                        <tr className="border-b border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300">
                          <th className="px-4 py-3 text-left">Fila</th>
                          <th className="px-4 py-3 text-left">Nombre</th>
                          <th className="px-4 py-3 text-left">Código</th>
                          <th className="px-4 py-3 text-left">Estado</th>
                          <th className="px-4 py-3 text-left">Observación</th>
                          <th className="px-4 py-3 text-left">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => (
                          <tr key={`${row.rowNumber}-${row.studentCode ?? row.fullName}`} className="border-b border-slate-100 text-slate-700 dark:border-white/5 dark:text-slate-200">
                            <td className="px-4 py-3">{row.rowNumber}</td>
                            <td className="px-4 py-3 font-medium">{row.fullName}</td>
                            <td className="px-4 py-3">{row.studentCode ?? "—"}</td>
                            <td className="px-4 py-3">{row.status}</td>
                            <td className="max-w-[280px] px-4 py-3 text-slate-500 dark:text-slate-400">{row.notes ?? "Sin observaciones"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  row.isValid
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
                                }`}
                              >
                                {row.isValid ? "Lista para importar" : row.error ?? "Fila inválida"}
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

        <div className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white/96 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/95">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isParsing}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isPending || isParsing || validRows.length === 0 || !selectedGroupId}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
