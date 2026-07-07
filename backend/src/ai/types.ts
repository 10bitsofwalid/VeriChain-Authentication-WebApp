export interface AIProvider {
  /**
   * Call the underlying AI model with a prompt.
   * @param prompt The prompt string or system instruction.
   * @param options Optional provider‑specific options (e.g., temperature, maxTokens).
   * @returns A promise that resolves to the raw provider response.
   */
  callPrompt(prompt: string, options?: any): Promise<any>;
}

// Result shapes for AI features
export interface ReviewAnalysisResult {
  score: number; // 0‑1 suspicion likelihood
  confidence: number; // 0‑1 confidence
  reason: string;
  recommendation: 'allow' | 'flag';
}

export interface RecommendationResult {
  productIds: string[]; // Recommended product IDs
}

export interface DuplicateCheckResult {
  similarityScore: number; // 0‑1 similarity
  possibleDuplicates: { id: string; title: string }[];
}

export interface OcrResult {
  organization: string;
  certificateNumber: string;
  expirationDate: string; // ISO date
  confidence: number;
  extractedText: string;
}

export interface RiskResult {
  riskScore: number; // 0‑1
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}
