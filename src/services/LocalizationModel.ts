import { RandomForestClassifier } from 'random-forest';
import trainingData from '../data/recordedData.json';

interface TrainingRecord {
  r1: number;
  r2: number;
  r3: number;
  rawR1?: number;
  rawR2?: number;
  rawR3?: number;
  distance?: number;
  distance1?: number;
  distance2?: number;
  distance3?: number;
  zoneId: number;
  zoneName: string;
  timestamp: string;
}

export interface Zone {
  id: number;
  name: string;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
}

export interface PredictionResult {
  zone: Zone;
  confidence: number; // 0-100
}

// Coordinates to Percentages for Responsive Map
export const ZONES: Zone[] = [
  // { id: 0, name: "WORKING AREA A1", x: 55, y: 35 },
  // { id: 1, name: "WORKING AREA A2", x: 77, y: 28 },
  // { id: 2, name: "WORKING AREA B1", x: 55, y: 85 },
  // { id: 3, name: "WORKING AREA B2", x: 80, y: 83 },
  // { id: 4, name: "PANTRY TABLE 1",  x: 67, y: 73 },
  // { id: 5, name: "PANTRY TABLE 2",  x: 67, y: 38 },
  // { id: 6, name: "ENTRANCE DOOR",   x: 25, y: 63 },
  { id: 7, name: "CVC CENTRAL 1", x: 70, y: 30 },
  { id: 8, name: "CVS CENTRAL 2", x: 74, y: 30 },
  { id: 9, name: "CVS CENTRAL 3", x: 78, y: 30 },
  { id: 10, name: "CVS FRONT 4", x: 74, y:  50},
  { id: 11, name: "CVS BACK", x: 84, y:  52},
];

const rf = new RandomForestClassifier({ nEstimators: 100 });


export const initAndTrainModel = (): void => {
  try {
    console.log(" ML: Starting Random Forest training...");

    const validTrainingData = (trainingData as TrainingRecord[]).filter(item => !Number.isNaN(Number(item.zoneId)));
    // Build feature vector [r1, r2, r3, rawR1, rawR2, rawR3, d1, d2, d3, r3-r2, r2-r1, r1-r3]
    const features = validTrainingData.map(item => {
      const r1 = Number(item.r1);
      const r2 = Number(item.r2);
      const r3 = Number(item.r3);
      const rawR1 = Number(item.rawR1 ?? item.r1);
      const rawR2 = Number(item.rawR2 ?? item.r2);
      const rawR3 = Number(item.rawR3 ?? item.r3);
      const d1 = Number(item.distance1 ?? item.distance ?? 0);
      const d2 = Number(item.distance2 ?? item.distance ?? 0);
      const d3 = Number(item.distance3 ?? item.distance ?? 0);

      const diff_r3_r2 = r3 - r2;
      const diff_r2_r1 = r2 - r1;
      const diff_r1_r3 = r1 - r3;

      return [r1, r2, r3, rawR1, rawR2, rawR3, d1, d2, d3, diff_r3_r2, diff_r2_r1, diff_r1_r3];
    });
    const labels = validTrainingData.map(item => Number(item.zoneId));

    if (features.length === 0) {
      console.error(" ML Error: trainingData.json has no valid samples.");
      return;
    }

    console.log(`ML: Processing ${features.length} signal samples with 12 features.`);

    // Train the model
    rf.train(features, labels);
    console.log(" ML: Training Complete.");

    // SELF-TEST: Using 2D array syntax
    const testResult = rf.predict([[-66, -83, -70, -66, -83, -70, 5.0, 5.0, 5.0, 13, -17, 4]]);
    console.log(`ML Self-Test: Predicted Zone ID: ${testResult[0]}`);

  } catch (error) {
    console.error("ML Error: Training failed.", error);
  }
};

/**
 * Predicts the current Zone based on live negative RSSI and distance with confidence score
 * Confidence is estimated based on distance to training data
 */

export const predictCurrentZone = (r1: any, r2: any, r3: any, d1: any, d2: any, d3: any, rawR1?: any, rawR2?: any, rawR3?: any): PredictionResult | undefined => {
  //  Basic Validation - Allow NaN for distances, but ensure RSSIs are present
  if (r1 === null || r2 === null || r3 === null || r1 === undefined || r2 === undefined || r3 === undefined) return undefined;

  try {
    // Convert string inputs to numbers, defaulting to -100 for RSSI and 10 for distance if invalid
    const val1 = isNaN(Number(r1)) ? -100 : Number(r1);
    const val2 = isNaN(Number(r2)) ? -100 : Number(r2);
    const val3 = isNaN(Number(r3)) ? -100 : Number(r3);
    const rawVal1 = isNaN(Number(rawR1 ?? r1)) ? val1 : Number(rawR1 ?? r1);
    const rawVal2 = isNaN(Number(rawR2 ?? r2)) ? val2 : Number(rawR2 ?? r2);
    const rawVal3 = isNaN(Number(rawR3 ?? r3)) ? val3 : Number(rawR3 ?? r3);
    const val4 = isNaN(Number(d1)) ? 0 : Number(d1);
    const val5 = isNaN(Number(d2)) ? 0 : Number(d2);
    const val6 = isNaN(Number(d3)) ? 0 : Number(d3);

    const diff_r3_r2 = val3 - val2;
    const diff_r2_r1 = val2 - val1;
    const diff_r1_r3 = val1 - val3;

    // --- HEURISTIC FALLBACK (User suggestion: "Doesn't even need ML") ---
    // Lowered threshold from -58 to -62 because training data maxed at -60/-64.
    // If one reader is extremely strong, prioritize that zone.
    let heuristicZoneId = -1;
    if (val1 > -62) heuristicZoneId = 7; // Reader 1 -> Zone 7
    if (val2 > -62) heuristicZoneId = 8; // Reader 2 -> Zone 8
    if (val3 > -62) heuristicZoneId = 9; // Reader 3 -> Zone 9

    // Predict using 12 features
    const prediction = rf.predict([[val1, val2, val3, rawVal1, rawVal2, rawVal3, val4, val5, val6, diff_r3_r2, diff_r2_r1, diff_r1_r3]]);
    let predictedId = Number(prediction[0]);

    // Overwrite with heuristic if very close to a known reader
    if (heuristicZoneId !== -1) {
        predictedId = heuristicZoneId;
    }

    // Calculate confidence based on proximity to training data IN THE PREDICTED ZONE
    let minDistance = Infinity;
    const trainingRecords = trainingData as TrainingRecord[];
    const samplesInZone = trainingRecords.filter(s => Number(s.zoneId) === predictedId);
    
    // If we have no training data for this zone, confidence should be low
    if (samplesInZone.length === 0) {
        minDistance = 100; 
    } else {
        for (const sample of samplesInZone) {
          const sr1 = Number(sample.r1);
          const sr2 = Number(sample.r2);
          const sr3 = Number(sample.r3);

          const distance = Math.sqrt(
            Math.pow(val1 - sr1, 2) + 
            Math.pow(val2 - sr2, 2) + 
            Math.pow(val3 - sr3, 2)
          );

          if (distance < minDistance) {
            minDistance = distance;
          }
        }
    }

    // Confidence decay: exp(-dist / 20). 
    // Tightened from 80 to 20 to be more sensitive to signal differences.
    let confidence = Math.min(100, 100 * Math.exp(-minDistance / 20));
    
    // If heuristic triggered, boost confidence significantly
    if (heuristicZoneId !== -1) {
        confidence = Math.max(confidence, 98);
    }

    // If predicted zone has NO data for the reader that is strongest, penalize confidence
    // (e.g. if we predict Zone 7 but Reader 2 is strongest)
    if (val1 < val2 && predictedId === 7) confidence *= 0.8;
    if (val2 < val1 && predictedId === 8) confidence *= 0.8;
    if (val3 < val1 && predictedId === 9) confidence *= 0.8;

    const match = ZONES.find(zone => zone.id === predictedId);
    
    if (!match) {
        console.warn(`ML predicted ID ${predictedId}, but it doesn't exist in ZONES array.`);
        return undefined;
    }

    return {
      zone: match,
      confidence: confidence
    };
  } catch (error) {
    console.error("ML Prediction Error:", error);
    return undefined;
  }
};