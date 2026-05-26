// Load environment variables from .env.local
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('API Key:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

// Test Claude 4 models (based on your Tier 1 access)
const modelsToTest = [
  'claude-sonnet-4-6-20241106',     // Claude Sonnet 4.6
  'claude-sonnet-4-5-20250929',     // Claude Sonnet 4.5
  'claude-haiku-4-5-20251001',      // Claude Haiku 4.5
  'claude-opus-4-7-20250514',       // Claude Opus 4.7 (most powerful)
];

async function testModels() {
  console.log('\nTesting Claude 4 models...\n');
  
  for (const model of modelsToTest) {
    try {
      const message = await anthropic.messages.create({
        model: model,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Hi' }],
      });

      console.log(`✅ ${model} - WORKS!`);
      console.log(`   Response: ${message.content[0].text}\n`);
      
    } catch (error) {
      console.log(`❌ ${model} - ${error.status} ${error.error?.type || 'failed'}`);
    }
  }
}

testModels();