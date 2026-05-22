import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { zoneName, zoneId, r1, r2, r3, rawR1, rawR2, rawR3, distance, distance1, distance2, distance3 } = await request.json();
    const zoneIdNumber = Number(zoneId);

    // Basic validation: require zoneName, zoneId, r1,r2,r3 and at least one distance value
    const hasPerReader = distance1 !== undefined || distance2 !== undefined || distance3 !== undefined;
    const hasLegacy = distance !== undefined;

    if (!zoneName || zoneId === undefined || Number.isNaN(zoneIdNumber) || r1 === undefined || r2 === undefined || r3 === undefined || (!hasPerReader && !hasLegacy)) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
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

    // Normalize per-reader distances (do NOT compute or store an averaged distance)
    const d1 = distance1 !== undefined ? Number(distance1) : null;
    const d2 = distance2 !== undefined ? Number(distance2) : null;
    const d3 = distance3 !== undefined ? Number(distance3) : null;
    const validD1 = d1 !== null && !Number.isNaN(d1) ? d1 : null;
    const validD2 = d2 !== null && !Number.isNaN(d2) ? d2 : null;
    const validD3 = d3 !== null && !Number.isNaN(d3) ? d3 : null;

    // Add new record with separate distance fields only
    const newRecord: any = {
      r1: Number(r1),
      r2: Number(r2),
      r3: Number(r3),
      rawR1: rawR1 !== undefined ? Number(rawR1) : null,
      rawR2: rawR2 !== undefined ? Number(rawR2) : null,
      rawR3: rawR3 !== undefined ? Number(rawR3) : null,
      distance1: validD1,
      distance2: validD2,
      distance3: validD3,
      zoneId: zoneIdNumber,
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