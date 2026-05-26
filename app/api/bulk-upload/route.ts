import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { supabase } from '../../../lib/supabase';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Starting bulk upload...', file.name);

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

    console.log(`Uploading ${data.length} rows...`);

    const rowsToInsert = data.map(row => ({
      ...row,
      validation_status: 'pending',
    }));

    // Supabase handles large inserts well (up to 1000 at a time)
    const BATCH_SIZE = 1000;
    let savedCount = 0;

    for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
      const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
      
      const { error } = await supabase
        .from('providers')
        .insert(batch);

      if (error) {
        console.error('Batch error:', error);
      } else {
        savedCount += batch.length;
        console.log(`Progress: ${savedCount}/${data.length}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalRows: data.length,
      savedToDatabase: savedCount,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}