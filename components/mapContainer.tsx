'use client'
import { motion } from "motion/react"
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, serverTimestamp, orderBy, limit, addDoc, where } from "firebase/firestore";
import { db } from "@src/lib/firebase";
import { initAndTrainModel, predictCurrentZone, Zone } from "../src/services/LocalizationModel";

// Single source of truth — imported by main.tsx too
export const TAGS = [
  { id: "TAG01", device: "XIAO_BATT_TAG01", name: "Infusion Pump", serial: "M1220050188" },
  { id: "TAG02", device: "XIAO_BATT_TAG02", name: "Nebulizer",     serial: "M1220050189" },
];

interface stateProps {
  isBiomed: boolean;
  setIsBiomed: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTagId: string;
}

function Map({ isBiomed, setIsBiomed, selectedTagId }: stateProps) {

  const [currentZone, setCurrentZone] = useState<Zone>({
    id: 999,
    name: "INITIALIZING...",
    x: 79,
    y: 35
  });

  const [assetName, setAssetName]       = useState<string>(TAGS[0].name);
  const [serialNumber, setSerialNumber] = useState<string>(TAGS[0].serial);
  const lastZoneRef = React.useRef<number | null>(null);

  useEffect(() => {
    const tag = TAGS.find(t => t.id === selectedTagId) ?? TAGS[0];

    // Update badge immediately on switch
    setAssetName(tag.name);
    setSerialNumber(tag.serial);
    setCurrentZone({ id: 999, name: "INITIALIZING...", x: 65, y: 72 });
    lastZoneRef.current = null;

    initAndTrainModel();

    if (!db) {
      console.warn("Firebase not available, skipping real-time data fetching");
      return;
    }

    const q = query(
      collection(db, "sensor_readings"),
      where("tagId", "==", selectedTagId),  // filter by selected tag
      orderBy("createdAt", "desc"),
      limit(10)
    );

    console.log(`[Map] Subscribing to sensor_readings for tagId=${selectedTagId}`);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log(`[Map] onSnapshot: tag=${selectedTagId} empty=${snapshot.empty} size=${snapshot.size}`);
      if (!snapshot.empty) {
        const docsRaw = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        console.log(`[Map] Snapshot docs for ${selectedTagId}:`, docsRaw);

        const docs = snapshot.docs.map(d => d.data());

        // Allow prediction even if some readers are missing by providing defaults
        const latestR1 = docs.find(d => d.BioMedReaderId === 1);
        const latestR2 = docs.find(d => d.BioMedReaderId === 2);
        const latestR3 = docs.find(d => d.BioMedReaderId === 3);

        // We only need AT LEAST ONE reader to attempt a prediction, 
        // though 3 is ideal for ML accuracy.
        if (latestR1 || latestR2 || latestR3) {
          const r1 = latestR1 ? Number(latestR1.rssi1 || latestR1.rssi) : -100;
          const r2 = latestR2 ? Number(latestR2.rssi2 || latestR2.rssi) : -100;
          const r3 = latestR3 ? Number(latestR3.rssi3 || latestR3.rssi) : -100;

          const rawR1 = latestR1 ? Number(latestR1.rawRssi1 ?? latestR1.rssi1 ?? latestR1.rssi) : r1;
          const rawR2 = latestR2 ? Number(latestR2.rawRssi2 ?? latestR2.rssi2 ?? latestR2.rssi) : r2;
          const rawR3 = latestR3 ? Number(latestR3.rawRssi3 ?? latestR3.rssi3 ?? latestR3.rssi) : r3;

          // Compute per-reader distances from RSSI using path-loss model (newfeature)
          // RSSI @ 1 meter and path-loss exponent
          const RSSI_1M = -68; // dBm at 1 meter
          const PATH_LOSS_N = 3.5;
          const computeDistanceFromRssi = (rssi: number) => {
            // treat very low sentinel values as missing
            if (isNaN(rssi) || rssi <= -99) return NaN;
            return Math.pow(10, (RSSI_1M - rssi) / (10 * PATH_LOSS_N));
          };

          const d1 = computeDistanceFromRssi(r1);
          const d2 = computeDistanceFromRssi(r2);
          const d3 = computeDistanceFromRssi(r3);

          console.log(`[${selectedTagId}] R1:${r1} | R2:${r2} | R3:${r3} | newfeature D1:${isNaN(d1) ? 'NA' : d1.toFixed(2)} | D2:${isNaN(d2) ? 'NA' : d2.toFixed(2)} | D3:${isNaN(d3) ? 'NA' : d3.toFixed(2)}`);

          const result = predictCurrentZone(r1, r2, r3, d1, d2, d3, rawR1, rawR2, rawR3);

          if (result && result.confidence > 80) {
            try {
              await addDoc(collection(db, "history"), {
                Battery: 20,
                Location: result.zone.name,
                tagId: selectedTagId,
                assetName: tag.name,
                time: serverTimestamp(),
              });
              lastZoneRef.current = result.zone.id;
            } catch (error) {
              console.error("Error writing to history:", error);
            }
            console.warn(`[${selectedTagId}] High confidence (${result.confidence.toFixed(1)}%): ${result.zone.name}`);
            setCurrentZone(result.zone);
          } else if (result) {
            try {
              await addDoc(collection(db, "history"), {
                Battery: 20,
                Location: result.zone.name,
                tagId: selectedTagId,
                assetName: tag.name,
                time: serverTimestamp(),
              });
            } catch (error) {
              console.error("Error writing to history:", error);
            }
            console.warn(`[${selectedTagId}] Low confidence (${result.confidence.toFixed(1)}%) - Position unchanged`);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [selectedTagId]); // re-runs on every tag switch

  const isInitialPosition = currentZone.id === 999 || currentZone.name === "INITIALIZING...";

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden touch-pan-x flex py-4">
      <div className={`relative flex-shrink-0 ${isBiomed ? 'w-[45em]' : 'w-[45em] sm:w-full'} h-full max-w-6xl shadow-2xl rounded-sm overflow-hidden bg-slate-200 mx-auto`}>
        <div className={`${isBiomed ? 'bg-biomed' : 'bg-map1'} bg-center bg-cover absolute inset-0 transition-opacity duration-700`} />

        {isInitialPosition ? (
          <div className="absolute inset-0 z-[100] flex items-center justify-center">
            <div className="text-center rounded-2xl bg-white/90 px-6 py-4 shadow-xl border border-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Searching</p>
              <p className="text-[0.625rem] text-slate-400 mt-1">waiting for sensor data...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={false}
            className="absolute flex flex-col items-center justify-center z-[100]"
            animate={{ left: `${currentZone.x}%`, top: `${currentZone.y}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 15 }}
            style={{ left: `${currentZone.x}%`, top: `${currentZone.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                width: 28,
                height: 28,
                backgroundColor: '#ff0088',
                borderRadius: '50%',
                boxShadow: '0 0 20px #ff0088',
                border: '3px solid white'
              }}
            />
            <div className="flex flex-col items-center mt-3 uppercase bg-white/80 backdrop-blur-sm px-5 py-1 rounded-full shadow-xl border border-pink-100">
              <span className="text-[10px] font-semibold text-slate-800">{assetName}</span>
              <span className="text-[10px] font-semibold tracking-tighter text-pink-500">
                {serialNumber}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Map);