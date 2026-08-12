import * as fs from 'fs';
import * as path from 'path';
import { OCRProcessor } from './OCRProcessor';

// Use dynamic imports or requires for heavy libraries to keep startup fast
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

export class DocumentParser {
  static async parse(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.txt':
      case '.md':
      case '.json':
        return await fs.promises.readFile(filePath, 'utf8');
      
      case '.pdf':
        const pdfBuffer = await fs.promises.readFile(filePath);
        const pdfData = await pdf(pdfBuffer);
        return pdfData.text;

      case '.docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;

      case '.xlsx':
      case '.csv':
        // For CSV, we can stream. But for simplicity of returning a single string, we use xlsx for both if small enough.
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_csv(sheet);

      case '.png':
      case '.jpg':
      case '.jpeg':
        return await OCRProcessor.extractText(filePath);

      default:
        throw new Error(`Unsupported document type: ${ext}`);
    }
  }
}
