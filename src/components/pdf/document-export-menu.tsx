"use client";

import { ChevronDown, FileDown, FileText, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ToastMessage } from "@/components/ui/toast-message";

type ExportMode = "view" | "download";

type DocumentExportMenuProps = {
  pdfEndpoint?: string;
  wordEndpoint?: string;
  tone?: "primary" | "secondary";
  preferredSide?: "auto" | "top" | "bottom";
  showViewPdf?: boolean;
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

export const DocumentExportMenu = ({
  pdfEndpoint,
  wordEndpoint,
  tone = "secondary",
  preferredSide = "auto",
  showViewPdf = true
}: DocumentExportMenuProps) => {
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

    if (preferredSide === "top") {
      setOpenUpward(true);
      setIsOpen(true);
      return;
    }

    if (preferredSide === "bottom") {
      setOpenUpward(false);
      setIsOpen(true);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const estimatedHeight = showViewPdf && pdfEndpoint ? 184 : 136;
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

      <div ref={containerRef} className="relative w-full sm:w-auto">
        <button
          type="button"
          onClick={toggleMenu}
          disabled={Boolean(isLoading)}
          className={
            tone === "primary"
              ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.45)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-violet-500/12 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              : "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300/90 bg-white/92 px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.28)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-100 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.6)] dark:hover:border-slate-600 dark:hover:bg-slate-900 sm:w-auto"
          }
        >
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {isLoading ? "Generando documento..." : "Exportar"}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen ? (
          <div
            className={`absolute right-0 z-[140] w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_32px_70px_-32px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_38px_80px_-36px_rgba(0,0,0,0.8)] sm:min-w-[220px] sm:w-auto ${
              openUpward ? "bottom-[calc(100%+0.5rem)] origin-bottom-right" : "top-[calc(100%+0.5rem)] origin-top-right"
            }`}
          >
            {pdfEndpoint && showViewPdf ? (
              <>
                <button
                  type="button"
                  onClick={() => generatePdf("view")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  <FileDown className="h-4 w-4 text-blue-500" />
                  Ver PDF
                </button>
              </>
            ) : null}

            {pdfEndpoint ? (
              <button
                type="button"
                onClick={() => generatePdf("download")}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <FileDown className="h-4 w-4 text-blue-500" />
                Descargar PDF
              </button>
            ) : null}

            {wordEndpoint ? (
              <button
                type="button"
                onClick={exportWord}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900"
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
