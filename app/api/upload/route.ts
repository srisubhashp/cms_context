import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { supabase } from '../../../lib/supabase';
import { coordinateValidation } from '../../../lib/agents/coordinator';
import { validateGeographic } from '../../../lib/agents/geographic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const data = parseResult.data as any[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    console.log(`Processing ${data.length} rows...`);

    const rowsToInsert = data.map(row => ({
      ...row,
      validation_status: 'pending',
    }));

    const { error: insertError } = await supabase
      .from('providers')
      .insert(rowsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save to database', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`Saved ${data.length} rows to database`);

    const rowsToValidate = data.slice(0, 10);
    const results = [];

    for (const row of rowsToValidate) {
      try {
        const validationData = {
          npi: row.Rndrng_NPI,
          provider_name: `${row.Rndrng_Prvdr_First_Name || ''} ${row.Rndrng_Prvdr_Last_Org_Name || ''}`.trim(),
          address: row.Rndrng_Prvdr_St1,
          city: row.Rndrng_Prvdr_City,
          state: row.Rndrng_Prvdr_State_Abrvtn,
          zip: row.Rndrng_Prvdr_Zip5,
          phone: '',
        };

        const coordination = await coordinateValidation(validationData);
        let geographicResult = null;

        if (coordination.needsGeographicValidation) {
          geographicResult = await validateGeographic(validationData);
        }

        await supabase
          .from('providers')
          .update({
            validation_status: geographicResult?.isValid ? 'valid' : 'invalid',
            validation_results: { coordination, geographic: geographicResult },
          })
          .eq('Rndrng_NPI', row.Rndrng_NPI);

        results.push({
          rowData: validationData,
          coordination,
          geographic: geographicResult,
        });
      } catch (error) {
        console.error('Validation error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: data.length,
      savedToDatabase: data.length,
      processedRows: results.length,
      results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}