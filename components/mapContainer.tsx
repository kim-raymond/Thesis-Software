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
    x: 59,
    y: 72
  });

  const [assetName, setAssetName]       = useState<string>(TAGS[0].name);
  const [serialNumber, setSerialNumber] = useState<string>(TAGS[0].serial);
  const lastZoneRef = React.useRef<number | null>(null);

  useEffect(() => {
    const tag = TAGS.find(t => t.id === selectedTagId) ?? TAGS[0];

    // Update badge immediately on switch
    setAssetName(tag.name);
    setSerialNumber(tag.serial);
    setCurrentZone({ id: 999, name: "INITIALIZING...", x: 59, y: 72 });
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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data());

        const latestR1 = docs.find(d => d.BioMedReaderId === 1);
        const latestR2 = docs.find(d => d.BioMedReaderId === 2);
        const latestR3 = docs.find(d => d.BioMedReaderId === 3);

        if (latestR1 && latestR2 && latestR3) {
          const r1 = Number(latestR1.rssi1);
          const r2 = Number(latestR2.rssi2);
          const r3 = Number(latestR3.rssi3);
          const distance = Number(latestR1.distance || latestR2.distance || latestR3.distance || 0);

          console.log(`[${selectedTagId}] R1:${r1} | R2:${r2} | R3:${r3} | Distance:${distance}`);

          const result = predictCurrentZone(r1, r2, r3, distance);

          if (result && result.confidence > 93) {
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

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4">
      <div className={`relative w-full h-full max-w-6xl shadow-2xl rounded-sm overflow-hidden bg-slate-200`}>
        <div className={`${isBiomed ? 'bg-biomed' : 'bg-map1'} bg-center bg-cover absolute inset-0 transition-opacity duration-700`} />

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
            style={{ width: 28, height: 28, backgroundColor: "#ff0088", borderRadius: "50%", boxShadow: "0 0 20px #ff0088", border: "3px solid white" }}
          />
          <div className="flex flex-col items-center text-slate-800 mt-3 uppercase bg-white/95 backdrop-blur-sm px-5 py-1 rounded-full shadow-xl border border-pink-100">
            <span className="text-[10px] font-bold">{assetName}</span>
            <span className="text-[10px] font-black tracking-tighter text-pink-500">
              {serialNumber}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default React.memo(Map);