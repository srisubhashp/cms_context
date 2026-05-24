import Anthropic from '@anthropic-ai/sdk';
import { ProviderData } from './geographic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CoordinatorDecision {
  needsGeographicValidation: boolean;
  reasoning: string;
  dataQuality: string;
}

export async function coordinateValidation(
  data: ProviderData
): Promise<CoordinatorDecision> {
  const prompt = `You are a Coordinator Agent that analyzes healthcare provider data and determines which validation checks are needed.

Provider Data:
${JSON.stringify(data, null, 2)}

Analyze this data and determine:
1. Does this data need geographic validation? (Check if it has address, city, state, ZIP, or phone)
2. What's the overall data quality? (Complete, Partial, Poor)
3. Brief reasoning for your decision

Respond in this exact JSON format:
{
  "needsGeographicValidation": true/false,
  "reasoning": "Brief explanation of why this validation is needed",
  "dataQuality": "Complete/Partial/Poor"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';

    const result: CoordinatorDecision = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error('Coordinator error:', error);
    return {
      needsGeographicValidation: true,
      reasoning: 'Error in coordination, defaulting to full validation',
      dataQuality: 'Unknown',
    };
  }
}
