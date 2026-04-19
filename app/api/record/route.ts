import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { zoneName, zoneId, r1, r2, r3, distance } = await request.json();

    if (!zoneName || zoneId === undefined || r1 === undefined || r2 === undefined || r3 === undefined || distance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'recordedData.json');

    // Read existing data
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      if (fileContent.trim()) {
        existingData = JSON.parse(fileContent);
      }
    }

    // Add new record
    const newRecord = {
      r1: Number(r1),
      r2: Number(r2),
      r3: Number(r3),
      distance: Number(distance),
      zoneId: Number(zoneId),
      zoneName: zoneName,
      timestamp: new Date().toISOString()
    };

    existingData.push(newRecord);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Signal recorded successfully',
      record: newRecord
    });

  } catch (error) {
    console.error('Error recording signal:', error);
    return NextResponse.json({ error: 'Failed to record signal' }, { status: 500 });
  }
}