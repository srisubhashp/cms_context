// Load environment variables
import { readFileSync } from 'fs';
const envFile = readFileSync('.env.local', 'utf-8');
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Strip markdown from Claude responses
function cleanJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
    cleaned = cleaned.trim();
  }
  return cleaned;
}

async function validateProvider(provider) {
  const validationData = {
    npi: provider.Rndrng_NPI.toString(),
    provider_name: `${provider.Rndrng_Prvdr_First_Name || ''} ${provider.Rndrng_Prvdr_Last_Org_Name || ''}`.trim(),
    address: provider.Rndrng_Prvdr_St1 || '',
    city: provider.Rndrng_Prvdr_City || '',
    state: provider.Rndrng_Prvdr_State_Abrvtn || '',
    zip: provider.Rndrng_Prvdr_Zip5 || '',
  };

  try {
    // Geographic validation
    const prompt = `You are a geographic data validator. Check if this provider's location data is consistent:

Provider Data:
- Address: ${validationData.address}
- City: ${validationData.city}
- State: ${validationData.state}
- ZIP Code: ${validationData.zip}

Validate:
1. Does the ZIP code match the city?
2. Does the ZIP code match the state?
3. Is the state abbreviation valid?
4. Does the address format look reasonable?

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "isValid": true,
  "confidence": 95,
  "findings": ["Finding 1", "Finding 2"],
  "details": "explanation here"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const cleaned = cleanJSON(responseText);
    const result = JSON.parse(cleaned);

    return {
      ...validationData,
      validation: result,
      success: true,
    };
  } catch (error) {
    return {
      ...validationData,
      validation: null,
      success: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log('🔍 Fetching random sample of providers...\n');

  // Get 20 random providers
  const { data: providers, error } = await supabase
    .from('providers')
    .select('Rndrng_NPI, Rndrng_Prvdr_First_Name, Rndrng_Prvdr_Last_Org_Name, Rndrng_Prvdr_St1, Rndrng_Prvdr_City, Rndrng_Prvdr_State_Abrvtn, Rndrng_Prvdr_Zip5')
    .limit(20);

  if (error) {
    console.error('Error fetching providers:', error);
    return;
  }

  console.log(`✓ Found ${providers.length} providers\n`);
  console.log('🤖 Running AI validation on each provider...\n');
  console.log('='.repeat(120) + '\n');

  const results = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    console.log(`[${i + 1}/${providers.length}] Validating NPI ${provider.Rndrng_NPI}...`);

    const result = await validateProvider(provider);
    results.push(result);

    if (result.success && result.validation) {
      const status = result.validation.isValid ? '✅ VALID' : '❌ INVALID';
      const confidence = result.validation.confidence;
      console.log(`  ${status} (Confidence: ${confidence}%)`);
      console.log(`  ${result.provider_name}`);
      console.log(`  ${result.address}, ${result.city}, ${result.state} ${result.zip}`);
      if (result.validation.findings && result.validation.findings.length > 0) {
        console.log(`  Findings: ${result.validation.findings[0]}`);
      }
    } else {
      console.log(`  ⚠️  VALIDATION ERROR: ${result.error || 'Unknown error'}`);
    }
    console.log('');

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('='.repeat(120) + '\n');
  console.log('📊 SUMMARY\n');

  const valid = results.filter(r => r.success && r.validation?.isValid);
  const invalid = results.filter(r => r.success && !r.validation?.isValid);
  const errors = results.filter(r => !r.success);

  console.log(`✅ Valid: ${valid.length}`);
  console.log(`❌ Invalid: ${invalid.length}`);
  console.log(`⚠️  Errors: ${errors.length}\n`);

  // Show best examples for demo
  console.log('🎯 BEST EXAMPLES FOR YOUR DEMO:\n');

  if (valid.length > 0) {
    console.log('✅ VALID EXAMPLE (Good Provider):');
    const best = valid[0];
    console.log(`   NPI: ${best.npi}`);
    console.log(`   Name: ${best.provider_name}`);
    console.log(`   Address: ${best.address}`);
    console.log(`   City: ${best.city}`);
    console.log(`   State: ${best.state}`);
    console.log(`   ZIP: ${best.zip}`);
    console.log(`   Confidence: ${best.validation.confidence}%`);
    console.log(`   Findings:`);
    best.validation.findings.forEach(f => console.log(`     • ${f}`));
    console.log('');
  }

  if (invalid.length > 0) {
    console.log('❌ INVALID EXAMPLE (Shows AI catching errors):');
    const worst = invalid[0];
    console.log(`   NPI: ${worst.npi}`);
    console.log(`   Name: ${worst.provider_name}`);
    console.log(`   Address: ${worst.address}`);
    console.log(`   City: ${worst.city}`);
    console.log(`   State: ${worst.state}`);
    console.log(`   ZIP: ${worst.zip}`);
    console.log(`   Confidence: ${worst.validation.confidence}%`);
    console.log(`   Issues Found:`);
    worst.validation.findings.forEach(f => console.log(`     • ${f}`));
    console.log('');
  }

  // Save results to JSON file
  const fs = await import('fs');
  fs.writeFileSync(
    'validation-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('💾 Full results saved to: validation-results.json\n');
}

main();