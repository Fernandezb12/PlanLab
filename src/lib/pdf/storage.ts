import type { SupabaseClient } from "@supabase/supabase-js";

const getDocumentsBucket = () => process.env.SUPABASE_DOCUMENTS_BUCKET ?? "documents";

type UploadPdfInput = {
  supabase: SupabaseClient;
  path: string;
  buffer: Buffer;
};

export const uploadPdfToStorage = async ({ supabase, path, buffer }: UploadPdfInput) => {
  const bucket = getDocumentsBucket();

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true
  });

  if (uploadError) {
    console.error("Error real subiendo PDF a Storage:", uploadError);
    throw new Error(`No fue posible guardar el documento en Storage: ${uploadError.message}`);
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error("Error real creando URL firmada del PDF:", signedUrlError);
    throw new Error(`No fue posible obtener el enlace del documento: ${signedUrlError?.message ?? "URL no disponible"}`);
  }

  return {
    bucket,
    path,
    signedUrl: signedUrlData.signedUrl
  };
};
