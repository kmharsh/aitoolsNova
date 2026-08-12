import { z } from 'zod';

export const ComparisonSchema = z.object({
  similarityScore: z.number().describe('0 to 100 representing how similar the documents are'),
  summaryOfDifferences: z.string().describe('A 2-sentence summary of the main changes'),
  metricChanges: z.array(z.object({
    metricName: z.string(),
    oldValue: z.string(),
    newValue: z.string(),
    trend: z.enum(['INCREASE', 'DECREASE', 'UNCHANGED', 'NEW'])
  })).optional().describe('Changes in critical numbers or KPIs'),
  newRisks: z.array(z.string()).optional().describe('Risks present in Doc 2 that were not in Doc 1'),
  resolvedRisks: z.array(z.string()).optional().describe('Risks present in Doc 1 that are missing in Doc 2'),
  timelineShifts: z.array(z.string()).optional().describe('Changes in dates, deadlines, or timelines'),
  strategicShifts: z.array(z.string()).optional().describe('Changes in overall strategy or recommendations'),
  matchedPoints: z.array(z.string()).optional().describe('Exact data points or paragraphs that are identical or match perfectly in both documents.'),
  unmatchedPoints: z.array(z.string()).optional().describe('Data points or claims that contradict each other or do not match at all between documents.')
});

export type DocumentComparison = z.infer<typeof ComparisonSchema>;
