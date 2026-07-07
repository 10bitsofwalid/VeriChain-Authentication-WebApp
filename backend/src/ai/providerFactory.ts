import { AIProvider } from './types';
import { MockProvider } from './provider';

/**
 * Factory that returns an AIProvider implementation based on the AI_PROVIDER
 * environment variable. Currently only `mock` is implemented. Real providers can
 * be added later without touching the rest of the codebase.
 */
export function getAIProvider(): AIProvider {
  const providerName = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  switch (providerName) {
    case 'mock':
      return new MockProvider();
    // future providers, e.g., case 'openai': return new OpenAIProvider();
    default:
      // fallback to mock to avoid crashes
      return new MockProvider();
  }
}
