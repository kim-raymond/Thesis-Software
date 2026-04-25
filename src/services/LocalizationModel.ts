import { RandomForestClassifier } from 'random-forest';
import trainingData from '../data/recordedData.json';

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
  { id: 0, name: "WORKING AREA A1", x: 55, y: 28 },
  { id: 1, name: "WORKING AREA A2", x: 77, y: 28 },
  { id: 2, name: "WORKING AREA B1", x: 55, y: 85 },
  { id: 3, name: "WORKING AREA B2", x: 80, y: 83 },
  { id: 4, name: "PANTRY TABLE 1",  x: 67, y: 73 },
  { id: 5, name: "PANTRY TABLE 2",  x: 67, y: 38 },
  { id: 6, name: "ENTRANCE DOOR",   x: 25, y: 63 },
  { id: 7, name: "CVS FRONT 1", x: 60, y: 50 },
  { id: 8, name: "CVS FRONT 2", x: 60, y: 70 },
  { id: 9, name: "CVS FRONT 3", x: 65, y: 70 },
  { id: 10, name: "CVS FRONT 4", x: 72, y: 70 },
];

const rf = new RandomForestClassifier({ nEstimators: 100 });


export const initAndTrainModel = (): void => {
  try {
    console.log(" ML: Starting Random Forest training...");
    
    const validTrainingData = trainingData.filter(item => !Number.isNaN(Number(item.zoneId)));
    const features = validTrainingData.map(item => [Number(item.r1), Number(item.r2), Number(item.r3), Number(item.distance)]);
    const labels = validTrainingData.map(item => Number(item.zoneId));

    if (features.length === 0) {
      console.error(" ML Error: trainingData.json has no valid samples.");
      return;
    }

    console.log(`ML: Processing ${features.length} signal samples.`);

    // Train the model
    rf.train(features, labels);
    console.log(" ML: Training Complete.");
    
    // SELF-TEST: Using 2D array syntax [[r1, r2, r3, distance]]
    const testResult = rf.predict([[-66, -83, -70, 5.0]]);
    console.log(`🧪 ML Self-Test: Input [-66,-83,-70,5.0] -> Predicted Zone ID: ${testResult[0]}`);

  } catch (error) {
    console.error(" ML Error: Training failed.", error);
  }
};

/**
 * Predicts the current Zone based on live negative RSSI and distance with confidence score
 * Confidence is estimated based on distance to training data
 */
export const predictCurrentZone = (r1: any, r2: any, r3: any, distance: any): PredictionResult | undefined => {
  //  Basic Validation
  if (r1 === null || r2 === null || r3 === null || distance === null || r1 === undefined || r2 === undefined || r3 === undefined || distance === undefined) return undefined;

  try {
    // Force to Numbers (essential for Firestore string inputs)
    const val1 = Number(r1);
    const val2 = Number(r2);
    const val3 = Number(r3);
    const val4 = Number(distance);

    // Predict using 2D array syntax: [[val1, val2, val3, val4]]
    const prediction = rf.predict([[val1, val2, val3, val4]]);
    const predictedId = Number(prediction[0]);

    // Calculate confidence based on proximity to training data
    // Find closest training sample and use distance as inverse confidence metric
    let minDistance = Infinity;
    for (const sample of trainingData) {
      const sr1 = Number(sample.r1);
      const sr2 = Number(sample.r2);
      const sr3 = Number(sample.r3);
      const sdistance = Number(sample.distance);
      
      const distance = Math.sqrt(
        Math.pow(val1 - sr1, 2) + 
        Math.pow(val2 - sr2, 2) + 
        Math.pow(val3 - sr3, 2) +
        Math.pow(val4 - sdistance, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // Convert distance to confidence: closer = higher confidence
    // Use exponential decay: confidence = 100 * e^(-distance/30)
    const confidence = Math.min(100, 100 * Math.exp(-minDistance / 30));

    // Find and return the matching Zone object
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