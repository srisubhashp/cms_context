import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeographicValidationResult {
  isValid: boolean;
  confidence: number;
  findings: string[];
  details: string;
}

export interface ProviderData {
  npi?: string;
  provider_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  [key: string]: any;
}

export async function validateGeographic(
  data: ProviderData
): Promise<GeographicValidationResult> {
  const prompt = `You are a Geographic Validation Agent specializing in healthcare provider data validation.

Your job is to check if geographic data is consistent and accurate.

Provider Data:
- Address: ${data.address || 'N/A'}
- City: ${data.city || 'N/A'}
- State: ${data.state || 'N/A'}
- ZIP Code: ${data.zip || 'N/A'}
- Phone: ${data.phone || 'N/A'}

Validate the following:
1. Does the ZIP code match the city and state?
2. Does the phone area code match the geographic location?
3. Is the address format valid for the state?
4. Are there any obvious inconsistencies (e.g., CA ZIP with NY city)?

Respond in this exact JSON format:
{
  "isValid": true/false,
  "confidence": 0-100,
  "findings": ["list of specific issues found"],
  "details": "Brief explanation of the validation"
}

If everything looks correct, set isValid to true and findings to an empty array.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';

    // Parse the JSON response
    const result: GeographicValidationResult = JSON.parse(responseText);

    return result;
  } catch (error) {
    console.error('Geographic validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      findings: ['Error during validation'],
      details: 'An error occurred while validating geographic data',
    };
  }
}
