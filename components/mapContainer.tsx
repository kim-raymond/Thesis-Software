'use client'
import { motion } from "motion/react"
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@src/lib/firebase"; 
import { initAndTrainModel, predictCurrentZone, Zone } from "../src/services/LocalizationModel";

interface stateProps {
    isBiomed: boolean;
    setIsBiomed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Map({ isBiomed, setIsBiomed }: stateProps) {
    // Initial State 
    const [currentZone, setCurrentZone] = useState<Zone>({
        id: 999,
        name: "INITIALIZING...",
        x: 85,  
        y: 42
    });

    const [assetName,setAssetName] = useState<String>("Infusion Pump");
    const [serialNumber,setSerialNumber] = useState<String>("M1220050188");

useEffect(() => {
  initAndTrainModel();

  // Only initialize Firebase listeners if db is available (client-side only)
  if (!db) {
    console.warn("Firebase not available, skipping real-time data fetching");
    return;
  }

  // fetch the last 10-20 readings to ensure have at least one from each ID
  const q = query(
    collection(db, "sensor_readings"), 
    orderBy("createdAt", "desc"),
    limit(10) 
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const docs = snapshot.docs.map(d => d.data());
      
      // Find the LATEST reading 
      const latestR1 = docs.find(d => d.BioMedReaderId === 1);
      const latestR2 = docs.find(d => d.BioMedReaderId === 2);
      const latestR3 = docs.find(d => d.BioMedReaderId === 3);

      if (latestR1 && latestR2 && latestR3) {
        // extract the RSSI and distance. Note: Reader 1 is 'rssi1', Reader 2 is 'rssi2', Reader 3 is 'rssi3'
        const r1 = Number(latestR1.rssi1);
        const r2 = Number(latestR2.rssi2);
        const r3 = Number(latestR3.rssi3);
        const distance = Number(latestR1.distance || latestR2.distance || latestR3.distance || 0); // Use distance from any reader

        console.log(` Multi-Reader Update: R1:${r1} | R2:${r2} | R3:${r3} | Distance:${distance}`);

        // Run the ML model with THREE signals and distance
        const result = predictCurrentZone(r1, r2, r3, distance);
        
        // Only update position if confidence is above 90%
        if (result && result.confidence > 90) {
          console.log(` High confidence prediction (${result.confidence.toFixed(1)}%): Moving to ${result.zone.name}`);
          setCurrentZone(result.zone);
        } else if (result) {
          console.warn(` Low confidence prediction (${result.confidence.toFixed(1)}%) - Position unchanged`);
        }
      }
    }
  });

  return () => unsubscribe();
}, []);

    return (
        <div className="h-[85vh] w-full flex flex-col items-center justify-center p-4">
            
            {/* <div className="mb-4 text-center">
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest">
                    {currentZone.name}
                </h1>
                <p className="text-xs font-mono text-pink-500">
                    {currentZone.x}% | {currentZone.y}%
                </p>
            </div> */}

            <div className={`relative ${isBiomed ? 'w-[52rem] h-[35rem]' : 'w-[65rem] h-[35rem]'} border border-white shadow-2xl rounded-sm overflow-hidden bg-slate-200`}>
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
                    <div className=" flex flex-col  items-center text-slate-800 mt-3 uppercase bg-white/95 backdrop-blur-sm px-5 py-1 rounded-full shadow-xl border border-pink-100">
                        <span className="text-[10px] font-bold">{assetName}</span> 
                        <span className="text-[10px] font-black tracking-tighter  text-pink-500">
                            {serialNumber}
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}