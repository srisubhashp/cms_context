import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ValidationData {
  npi: string;
  provider_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface GeographicValidationResult {
  isValid: boolean;
  confidence: number;
  findings: string[];
  details: string;
}

export async function validateGeographic(
  data: ValidationData
): Promise<GeographicValidationResult> {
  const prompt = `You are a geographic data validator. Check if this provider's location data is consistent:

Provider Data:
- Address: ${data.address}
- City: ${data.city}
- State: ${data.state}
- ZIP Code: ${data.zip}

Validate:
1. Does the ZIP code match the city?
2. Does the ZIP code match the state?
3. Is the state abbreviation valid?
4. Does the address format look reasonable?

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isValid": true,
  "confidence": 95,
  "findings": ["All data is consistent"],
  "details": "explanation here"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    const responseText = content.type === 'text' ? content.text : '{}';

    // Strip markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/, '');
      cleanedText = cleanedText.replace(/\n?```\s*$/, '');
      cleanedText = cleanedText.trim();
    }

    const result: GeographicValidationResult = JSON.parse(cleanedText);

    return result;
  } catch (error) {
    console.error('Geographic validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      findings: ['Error during validation'],
      details: 'Validation service error',
    };
  }
}