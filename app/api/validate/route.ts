import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { coordinateValidation } from '@/lib/agents/coordinator';
import { validateGeographic, ProviderData } from '@/lib/agents/geographic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    const data = parseResult.data as ProviderData[];

    if (data.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Process first 5 rows (you can adjust this)
    const rowsToProcess = data.slice(0, 5);
    const results = [];

    for (const row of rowsToProcess) {
      // Step 1: Coordinator decides what to validate
      const coordination = await coordinateValidation(row);

      let geographicResult = null;

      // Step 2: Run geographic validation if needed
      if (coordination.needsGeographicValidation) {
        geographicResult = await validateGeographic(row);
      }

      results.push({
        rowData: row,
        coordination,
        geographic: geographicResult,
      });
    }

    return NextResponse.json({
      success: true,
      totalRows: data.length,
      processedRows: rowsToProcess.length,
      results,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
