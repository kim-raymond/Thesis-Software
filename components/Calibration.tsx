'use client'

import { useState, useEffect } from 'react';
import { db } from '@src/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface SignalData {
  r1: number | null;
  r2: number | null;
  r3: number | null;
  distance: number | null;
}

export default function Calibration() {
    const [zoneName, setZoneName] = useState('');
    const [zoneId, setZoneId] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedCount, setRecordedCount] = useState(0);
    const [liveSignals, setLiveSignals] = useState<SignalData>({ r1: null, r2: null, r3: null, distance: null });
    const [lastRecordedSignals, setLastRecordedSignals] = useState<SignalData>({ r1: null, r2: null, r3: null, distance: null });
    const dataSetLn = 20;

    const recordSample = async (signal: SignalData) => {
        const response = await fetch('/api/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                zoneName: zoneName.trim(), 
                zoneId: parseInt(zoneId), 
                r1: signal.r1, 
                r2: signal.r2, 
                r3: signal.r3,
                distance: signal.distance
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to record signal');
        }

        setRecordedCount(prev => prev + 1);
    };

    // Listen to live Firebase data and record on new payloads
    useEffect(() => {
        const q = query(collection(db, "sensor_readings"), orderBy("createdAt", "desc"), limit(10));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const docs = snapshot.docs.map(d => d.data());

            const latestR1 = docs.find(d => d.BioMedReaderId === 1);
            const latestR2 = docs.find(d => d.BioMedReaderId === 2);
            const latestR3 = docs.find(d => d.BioMedReaderId === 3);

            const newSignals = {
                r1: latestR1 ? latestR1.rssi1 || latestR1.rssi : null,
                r2: latestR2 ? latestR2.rssi2 || latestR2.rssi : null,
                r3: latestR3 ? latestR3.rssi3 || latestR3.rssi : null,
                distance: latestR1 ? latestR1.distance : latestR2 ? latestR2.distance : latestR3 ? latestR3.distance : null,
            };

            setLiveSignals(newSignals);

            if (!isRecording || recordedCount >= dataSetLn) {
                return;
            }

            const alreadyRecorded =
                newSignals.r1 === lastRecordedSignals.r1 &&
                newSignals.r2 === lastRecordedSignals.r2 &&
                newSignals.r3 === lastRecordedSignals.r3 &&
                newSignals.distance === lastRecordedSignals.distance;

            if (newSignals.r1 === null || newSignals.r2 === null || newSignals.r3 === null || newSignals.distance === null || alreadyRecorded) {
                return;
            }

            try {
                setLastRecordedSignals(newSignals);
                await recordSample(newSignals);
            } catch (error) {
                console.error('Recording failed during live update:', error);
                alert('Failed to record new signal sample. Recording stopped.');
                setIsRecording(false);
            }
        });

        return () => unsubscribe();
    }, [isRecording, recordedCount, lastRecordedSignals, zoneName, zoneId]);

    useEffect(() => {
        if (isRecording && recordedCount >= dataSetLn) {
            setIsRecording(false);
            alert(`Successfully recorded ${dataSetLn} signal samples for zone "${zoneName}"`);
        }
    }, [isRecording, recordedCount, zoneName]);

    const recordSignals = () => {
        if (!zoneName.trim() || !zoneId.trim()) {
            alert('Please enter both Zone Name and Zone ID');
            return;
        }

        if (liveSignals.r1 === null || liveSignals.r2 === null || liveSignals.r3 === null) {
            alert('No live signals detected. Please ensure sensors are active.');
            return;
        }

        setLastRecordedSignals({ r1: null, r2: null, r3: null, distance: null });
        setRecordedCount(0);

        if (!isRecording) {
            setIsRecording(true);
        }
        if (isRecording) {
            setIsRecording(false);
        }
    };

    const percent = isRecording ? (recordedCount / dataSetLn) * 100 : 0;
    return(
        <div className="h-full flex flex-col gap-4 w-auto bg-stone-100 py-8 px-12">
            <h1 className='w-full flex justify-center text-[1.5rem] text-stone-600 font-semibold leading-10'>Calibration</h1>

            <div className="flex gap-6">

            <div className="flex flex-col gap-2 text-[0.875rem]">
            <input
                type="text"
                placeholder="Input Zone Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="border border-stone-500 rounded-md focus:outline-none py-1 px-2 w-[8rem]"
                disabled={isRecording}
            />
            <input
                type="text"
                placeholder="Input zone ID"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="border border-stone-500 rounded-md focus:outline-none pt-1 px-2 w-[8rem]"
                disabled={isRecording}
            />
            <button
                onClick={recordSignals}
                // disabled={isRecording}
                className={`${isRecording ? 'bg-red-500' : 'bg-blue-500'} rounded-md py-2 px-2 w-[8rem] font-semibold text-stone-100 hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
                {isRecording ? 'Stop Recording' : 'Record Signals'}
            </button>
            </div>

            <div className="w-[12rem]">
            <p>Update Signal Patterns for each zone by recording new RSSI data</p>

            {/* Live Signals Display */}
            <div className="mt-4 p-3 bg-stone-100 rounded-md">
                <h3 className="text-sm font-semibold mb-2">Live Signals</h3>
                <div className="text-xs space-y-1">
                    <div>Reader 1 (r1): <span className="font-mono">{liveSignals.r1 ?? 'No data'}</span></div>
                    <div>Reader 2 (r2): <span className="font-mono">{liveSignals.r2 ?? 'No data'}</span></div>
                </div>
            </div>
            </div>

            </div>

            {/* STATUS BAR */}
            <div className="py-[1.5rem] px-[2rem] w-full h-min flex flex-col gap-4 shadow-md bg-stone-50 rounded-[0.9rem]">
            <section className='flex justify-between items-center'>
            <h2 className='flex items-center'>
                Recording Signals
                {isRecording && <span className="ml-2 text-blue-500">({recordedCount}/{dataSetLn})</span>}
            </h2>
            <span className="text-[0.875rem] text-stone-500">{Math.round(percent)}%</span>
            </section>
            <div className="w-full bg-stone-200 h-[0.3rem] rounded-full">
            <div
                className={`h-full bg-blue-500 rounded-full transition-all duration-300`}
                style={{width:`${percent}%`}}
            ></div>
            </div>
            {isRecording && (
                <p className="text-sm text-stone-600">
                    Recording signal samples... Please keep sensors active.
                </p>
            )}
            </div>

        </div>
    )
}