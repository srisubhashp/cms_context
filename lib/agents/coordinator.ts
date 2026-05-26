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

interface CoordinatorDecision {
  needsGeographicValidation: boolean;
  reasoning: string;
  dataQuality: string;
}

export async function coordinateValidation(
  data: ValidationData
): Promise<CoordinatorDecision> {
  const prompt = `You are a data validation coordinator. Analyze this provider data and determine what validations are needed:

Provider Data:
- NPI: ${data.npi}
- Name: ${data.provider_name}
- Address: ${data.address}
- City: ${data.city}
- State: ${data.state}
- ZIP: ${data.zip}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "needsGeographicValidation": true,
  "reasoning": "explanation here",
  "dataQuality": "complete"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
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

    const result: CoordinatorDecision = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error('Coordinator error:', error);
    return {
      needsGeographicValidation: true,
      reasoning: 'Error during coordination',
      dataQuality: 'unknown',
    };
  }
}