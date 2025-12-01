import { Buffer } from "buffer";
import { PdfReader } from "pdfreader";

export function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = "";

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) return reject(err);

      if (!item) {
        // end of file
        resolve(text);
      } else if (item.text) {
        text += item.text + " ";
      }
    });
  });
}

async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function extractTextFromFile(file: File) {
  const fileType = file.name.split(".").pop()?.toLowerCase();
  const buffer = await fileToBuffer(file);

  switch (fileType) {
    case "txt":
      return buffer.toString("utf-8");

    case "pdf":
      const text = await extractPdfText(buffer);
      return text;

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}
