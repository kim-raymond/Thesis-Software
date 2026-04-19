declare module 'random-forest' {
    export class RandomForestClassifier {
        constructor(options?: { nEstimators?: number });
        train(features: number[][], labels: number[]): void;
        predict(features: number[] | number[][]): number[];
    }
}