import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { coordinateValidation } from '../../../lib/agents/coordinator';
import { validateGeographic } from '../../../lib/agents/geographic';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    console.log('Chat message:', message);

    const npiMatch = message.match(/\b\d{10}\b/);
    
    if (npiMatch) {
      const npiString = npiMatch[0];
      const npiNumber = parseInt(npiString, 10);
      
      console.log('Searching for NPI:', npiNumber, '(as number)');
      
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('Rndrng_NPI', npiNumber)
        .maybeSingle();

      console.log('Query result:', { 
        found: !!provider, 
        error: error?.message,
        npiSearched: npiNumber 
      });

      if (error) {
        console.error('Supabase error:', error);
      }

      if (!provider) {
        const { count } = await supabase
          .from('providers')
          .select('*', { count: 'exact', head: true });

        return NextResponse.json({
          response: `I couldn't find a provider with NPI ${npiString} in the database. The database currently has ${count?.toLocaleString() || 0} providers.`,
          found: false,
        });
      }

      // Provider found! Build validation data
      const validationData = {
        npi: npiString,
        provider_name: `${provider.Rndrng_Prvdr_First_Name || ''} ${provider.Rndrng_Prvdr_Last_Org_Name || ''}`.trim(),
        address: provider.Rndrng_Prvdr_St1 || '',
        city: provider.Rndrng_Prvdr_City || '',
        state: provider.Rndrng_Prvdr_State_Abrvtn || '',
        zip: provider.Rndrng_Prvdr_Zip5 || '',
        phone: '',
      };

      console.log('Found provider:', validationData.provider_name);

      // SMART CACHING: Check if we have a SUCCESSFUL validation cached
      let validationResults = provider.validation_results;
      let usedCache = false;

      // Only use cache if validation was successful (has valid structure and data)
      if (
        validationResults && 
        validationResults.coordination && 
        validationResults.geographic &&
        validationResults.geographic.confidence > 0 &&
        validationResults.geographic.findings &&
        validationResults.geographic.findings.length > 0
      ) {
        console.log('✓ Using cached validation (successful result found)');
        usedCache = true;
      } else {
        // No valid cache - run fresh validation
        console.log('⟳ Running fresh validation (no valid cache found)...');

        try {
          const coordination = await coordinateValidation(validationData);
          let geographic = null;

          if (coordination.needsGeographicValidation) {
            geographic = await validateGeographic(validationData);
          }

          validationResults = { coordination, geographic };

          console.log('Validation complete:', {
            isValid: geographic?.isValid,
            confidence: geographic?.confidence,
            findings: geographic?.findings,
          });

          // ONLY SAVE IF VALIDATION WAS SUCCESSFUL
          // Check if we got valid results (confidence > 0, has findings)
          const isSuccessfulValidation = 
            geographic &&
            typeof geographic.confidence === 'number' &&
            geographic.confidence > 0 &&
            Array.isArray(geographic.findings) &&
            geographic.findings.length > 0;

          if (isSuccessfulValidation) {
            console.log('✓ Validation successful - saving to cache');
            
            const { error: updateError } = await supabase
              .from('providers')
              .update({
                validation_status: geographic?.isValid ? 'valid' : 'invalid',
                validation_results: validationResults,
                updated_at: new Date().toISOString(),
              })
              .eq('Rndrng_NPI', npiNumber);

            if (updateError) {
              console.error('Failed to save validation:', updateError);
            } else {
              console.log('✓ Validation cached successfully');
            }
          } else {
            console.log('✗ Validation failed - NOT caching (will retry next time)');
            // Don't save to database - next query will retry
          }

        } catch (validationError) {
          console.error('Validation error:', validationError);
          
          // Return error response but don't cache it
          return NextResponse.json({
            response: `Found provider: ${validationData.provider_name} (NPI: ${npiString})`,
            provider: {
              npi: npiString,
              name: validationData.provider_name,
              address: validationData.address,
              city: validationData.city,
              state: validationData.state,
              zip: validationData.zip,
              type: provider.Rndrng_Prvdr_Type || 'Unknown',
            },
            validation: {
              coordination: null,
              geographic: {
                isValid: false,
                confidence: 0,
                findings: ['Error during validation - please try again'],
                details: 'Validation service encountered an error',
              },
            },
            found: true,
            error: 'Validation failed - result not cached, retry will run fresh validation',
          });
        }
      }

      return NextResponse.json({
        response: `Found provider: ${validationData.provider_name} (NPI: ${npiString})`,
        provider: {
          npi: npiString,
          name: validationData.provider_name,
          address: validationData.address,
          city: validationData.city,
          state: validationData.state,
          zip: validationData.zip,
          type: provider.Rndrng_Prvdr_Type || 'Unknown',
        },
        validation: validationResults,
        found: true,
        cached: usedCache,
      });
    }

    return NextResponse.json({
      response: "I can help you check providers! Try asking: 'Check NPI 1164955043' or share a provider's NPI number.",
      found: false,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}