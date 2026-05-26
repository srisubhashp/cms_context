import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const modelsToTest = [
  'claude-sonnet-4-6-20241106',     // Latest Sonnet 4.6
  'claude-sonnet-4-5-20250929',     // Latest Sonnet 4.5
  'claude-sonnet-4-20241022',       // Sonnet 4
  'claude-3-5-sonnet-20241022',     // Claude 3.5 Sonnet (fallback)
];

async function testModels() {
  console.log('Testing which models are available...\n');
  
  for (const model of modelsToTest) {
    try {
      const message = await anthropic.messages.create({
        model: model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      
      console.log(`✅ ${model} - WORKS`);
    } catch (error) {
      console.log(`❌ ${model} - ${error.error?.type || 'FAILED'}`);
    }
  }
}

testModels();