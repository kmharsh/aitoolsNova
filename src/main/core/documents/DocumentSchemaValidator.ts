import { z } from 'zod';

const flexStrArr = (desc: string) => z.preprocess((val) => {
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'string' ? item : JSON.stringify(item));
  } else if (typeof val === 'object' && val !== null) {
    return [JSON.stringify(val)];
  } else if (val !== undefined && val !== null) {
    return [String(val)];
  }
  return [];
}, z.array(z.string())).describe(desc);

const flexStrArrOpt = (desc: string) => z.preprocess((val) => {
  if (val === undefined || val === null) return undefined;
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'string' ? item : JSON.stringify(item));
  } else if (typeof val === 'object' && val !== null) {
    return [JSON.stringify(val)];
  } else if (val !== undefined && val !== null) {
    return [String(val)];
  }
  return [];
}, z.array(z.string())).optional().describe(desc);

export const DocumentAnalysisSchema = z.object({
  documentType: z.string().describe('Inferred type of document based on content (e.g. Invoice, Report, Resume)'),
  title: z.string().describe('Extracted or inferred title'),
  summary: z.string().describe('A concise 2-3 sentence summary of the document'),
  keyPoints: flexStrArr('Top 3 to 5 critical takeaways'),
  entities: flexStrArrOpt('Important people, companies, or organizations mentioned'),
  importantNumbers: flexStrArrOpt('Key financial figures, IDs, or metrics'),
  dates: flexStrArrOpt('Important dates mentioned'),
  risks: flexStrArrOpt('Any potential risks or warnings identified'),
  recommendations: flexStrArrOpt('Any recommended next steps or action items'),
  relationships: flexStrArrOpt('Relationships between key entities'),
  sections: flexStrArrOpt('List of major headers or sections found'),
  fsdBlueprint: z.lazy(() => FSDStructureSchema).optional().describe('Generated project structure if this is an FSD'),
  securityClearance: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'HIGH RISK']).optional().describe('Inferred security/risk level of the document'),
  actionItems: flexStrArrOpt('List of next steps or tasks extracted from the document')
});

export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

export const FSDStructureSchema = z.object({
  projectName: z.string().describe('The overall name of the project'),
  frontendComponents: flexStrArr('List of React/UI components to build'),
  backendEndpoints: flexStrArr('List of API routes/endpoints needed'),
  databaseModels: flexStrArr('List of database schemas/models'),
  businessLogic: flexStrArr('Key business rules or logical workflows'),
  architecture: z.string().optional().describe('High level system architecture (e.g., Microservices, Monolithic)'),
  systemDesign: flexStrArrOpt('Key system design patterns or decisions'),
  dependencies: flexStrArrOpt('Required external libraries or tools')
});

export type FSDStructure = z.infer<typeof FSDStructureSchema>;

export const ChatCategorizationSchema = z.object({
  title: z.string().describe('A short, 2-4 word summary title of the conversation'),
  category: z.string().describe('The category of the chat. Must be one of: Code, System, Research, FSD, Support, Casual')
});

export type ChatCategorization = z.infer<typeof ChatCategorizationSchema>;
