import { AIProvider } from './types';

/**
 * MockProvider – returns deterministic placeholder data for development/testing.
 * The `callPrompt` method inspects the prompt string and returns a canned response
 * appropriate for the requested feature. In production this will be replaced by a
 * concrete implementation that calls an external AI service.
 */
export class MockProvider implements AIProvider {
  async callPrompt(prompt: string, options?: any): Promise<any> {
    // Very simple heuristic: look for a keyword to decide which mock to return.
    if (prompt.toLowerCase().includes('review analysis')) {
      return {
        score: 0.23,
        confidence: 0.87,
        reason: 'Contains generic phrasing and high positivity.',
        recommendation: 'allow',
      };
    }
    if (prompt.toLowerCase().includes('recommendations')) {
      return { productIds: ['prod1', 'prod2', 'prod3', 'prod4', 'prod5'] };
    }
    if (prompt.toLowerCase().includes('duplicate')) {
      return { similarityScore: 0.68, possibleDuplicates: [] };
    }
    if (prompt.toLowerCase().includes('ocr')) {
      return {
        organization: 'VeriChain Certification Authority',
        certificateNumber: 'VC-2024-00123',
        expirationDate: '2025-12-31',
        confidence: 0.95,
        extractedText: 'Sample OCR text',
      };
    }
    if (prompt.toLowerCase().includes('risk prediction')) {
      return {
        riskScore: 0.42,
        riskLevel: 'medium',
        factors: ['low seller trust', 'recent complaint'],
      };
    }
    // Default fallback
    return { message: 'Mock response', prompt, options };
  }
}
