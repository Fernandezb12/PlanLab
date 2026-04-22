import { renderToStream } from "@react-pdf/renderer";

export const renderPdfToBuffer = async (document: unknown) => {
  const stream = await renderToStream(document as Parameters<typeof renderToStream>[0]);
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};
