"use client";

import { ChevronDown, Eye, FileDown, FileText, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ToastMessage } from "@/components/ui/toast-message";

type ExportMode = "view" | "download";

type DocumentExportMenuProps = {
  pdfEndpoint?: string;
  wordEndpoint?: string;
  tone?: "primary" | "secondary";
};

type ExportPdfResponse = {
  message?: string;
  signedUrl?: string;
};

const readFilenameFromHeaders = (headers: Headers) => {
  const disposition = headers.get("content-disposition");
  const match = disposition?.match(/filename=\"?([^"]+)\"?/i);
  return match?.[1] ?? "planlab.docx";
};

export const DocumentExportMenu = ({ pdfEndpoint, wordEndpoint, tone = "secondary" }: DocumentExportMenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<ExportMode | "word" | null>(null);
  const [toast, setToast] = useState<{ tone: "success" | "warning"; message: string } | null>(null);
  const [openUpward, setOpenUpward] = useState(false);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const estimatedHeight = 184;
      const viewportGap = 20;
      setOpenUpward(rect.bottom + estimatedHeight > window.innerHeight - viewportGap && rect.top > estimatedHeight);
    }

    setIsOpen(true);
  };

  const generatePdf = async (mode: ExportMode) => {
    if (!pdfEndpoint) {
      return;
    }

    setIsLoading(mode);
    setIsOpen(false);

    try {
      const response = await fetch(pdfEndpoint, { method: "POST" });
      const payload = (await response.json()) as ExportPdfResponse;

      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.message || "No fue posible generar el documento en este intento. Intenta nuevamente.");
      }

      if (mode === "view") {
        window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        const link = document.createElement("a");
        link.href = payload.signedUrl;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setToast({
        tone: "success",
        message: payload.message || "Documento generado correctamente."
      });
    } catch (error) {
      console.error("Error real exportando documento PDF:", error);
      setToast({
        tone: "warning",
        message: error instanceof Error ? error.message : "No fue posible generar el documento en este intento. Intenta nuevamente."
      });
    } finally {
      setIsLoading(null);
    }
  };

  const exportWord = async () => {
    if (!wordEndpoint) {
      return;
    }

    setIsLoading("word");
    setIsOpen(false);

    try {
      const response = await fetch(wordEndpoint, { method: "POST" });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "No fue posible exportar el documento editable en este intento.");
      }

      const blob = await response.blob();
      const filename = readFilenameFromHeaders(response.headers);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        tone: "success",
        message: "Documento Word generado correctamente."
      });
    } catch (error) {
      console.error("Error real exportando documento Word:", error);
      setToast({
        tone: "warning",
        message: error instanceof Error ? error.message : "No fue posible exportar el documento editable en este intento."
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      {toast ? <ToastMessage message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={toggleMenu}
          disabled={Boolean(isLoading)}
          className={
            tone === "primary"
              ? "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-100 dark:hover:bg-white/10"
          }
        >
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {isLoading ? "Generando documento..." : "Exportar"}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen ? (
          <div
            className={`absolute right-0 z-40 min-w-[220px] rounded-2xl border border-slate-200 bg-white/98 p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/96 ${
              openUpward ? "bottom-[calc(100%+0.6rem)] origin-bottom-right" : "top-[calc(100%+0.6rem)] origin-top-right"
            }`}
          >
            {pdfEndpoint ? (
              <>
                <button
                  type="button"
                  onClick={() => generatePdf("view")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <Eye className="h-4 w-4 text-violet-500" />
                  Ver PDF
                </button>
                <button
                  type="button"
                  onClick={() => generatePdf("download")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  <FileDown className="h-4 w-4 text-blue-500" />
                  Descargar PDF
                </button>
              </>
            ) : null}

            {wordEndpoint ? (
              <button
                type="button"
                onClick={exportWord}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
              >
                <FileText className="h-4 w-4 text-emerald-500" />
                Exportar Word
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
};
