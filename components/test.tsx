"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@src/lib/firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface SignalReading {
  id: string;
  data: Record<string, any>;
}

// Memoized document display component
const DocumentItem = ({ reading, onDelete }: { reading: SignalReading, onDelete: (id: string) => void }) => {
  const formatFieldValue = (value: any) => {
    if (value instanceof Date) return value.toLocaleString();
    if (value && typeof value.toDate === "function") return value.toDate().toLocaleString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <li className="bg-white p-4 border rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Document ID</p>
          <p className="font-mono text-sm break-all">{reading.id}</p>
        </div>
        <button 
          className="px-3 py-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 text-xs font-bold transition"
          onClick={() => onDelete(reading.id)}
        >
          DELETE
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {Object.entries(reading.data).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{key}</p>
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">{formatFieldValue(value)}</pre>
          </div>
        ))}
      </div>
    </li>
  );
};

const DocumentItemMemo = React.memo(DocumentItem);

export default function Login() {
  const [rssi1Input, setRssi1Input] = useState("-91");
  const [rssi2Input, setRssi2Input] = useState("-82");
  const [rssi3Input, setRssi3Input] = useState("-60");
  const [rawRssi1Input, setRawRssi1Input] = useState("-91");
  const [rawRssi2Input, setRawRssi2Input] = useState("-82");
  const [rawRssi3Input, setRawRssi3Input] = useState("-60");
  const [distanceInput, setDistanceInput] = useState("5.0");
  const [collectionName, setCollectionName] = useState("sensor_readings");
  const [tagId, setTagId] = useState("TAG01");
  const [readings, setReadings] = useState<SignalReading[]>([]);
  const [buzzer, setBuzzer] = useState(false);
  const [unsubscribeRef, setUnsubscribeRef] = useState<(() => void) | null>(null);

  const handleSetBuzzer = useCallback(async () => {
    try{
      const newBuzzerState = !buzzer;
      setBuzzer(newBuzzerState);
      addDoc(collection(db, collectionName), {
        createdAt: serverTimestamp(),
        buzzerState: !buzzer,
      });
    }catch(err){
      console.error("Error setting buzzer state: ", err);
    }
  }, [buzzer, collectionName]);

  const sendTestData = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rssi1 = Number(rssi1Input);
      const rssi2 = Number(rssi2Input);
      const rssi3 = Number(rssi3Input);
      const rawRssi1 = Number(rawRssi1Input);
      const rawRssi2 = Number(rawRssi2Input);
      const rawRssi3 = Number(rawRssi3Input);
      const distance = Number(distanceInput);
      const distance1 = distance;
      const distance2 = distance;
      const distance3 = distance;

      const ref1 = await addDoc(collection(db, collectionName), {
        tagId,
        BioMedReaderId: 1,
        rssi1,
        rawRssi1,
        distance1,
        distance2,
        distance3,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
      });
      console.log(`WROTE doc1 id=${ref1.id}`);

      const ref2 = await addDoc(collection(db, collectionName), {
        tagId,
        BioMedReaderId: 2,
        rssi2,
        rawRssi2,
        distance1,
        distance2,
        distance3,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
      });
      console.log(`WROTE doc2 id=${ref2.id}`);

      const ref3 = await addDoc(collection(db, collectionName), {
        tagId,
        BioMedReaderId: 3,
        rssi3,
        rawRssi3,
        distance1,
        distance2,
        distance3,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
      });
      console.log(`WROTE doc3 id=${ref3.id}`);

      console.log(`✅ Injected Reader 1: ${rssi1}(${rawRssi1}), Reader 2: ${rssi2}(${rawRssi2}), Reader 3: ${rssi3}(${rawRssi3}), D1:${distance1},D2:${distance2},D3:${distance3}, buzzer: ${buzzer} into collection`);
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  }, [rssi1Input, rssi2Input, rssi3Input, rawRssi1Input, rawRssi2Input, rawRssi3Input, distanceInput, collectionName, tagId, buzzer]);

  const deleteReading = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error("Error deleting document: ", err);
    }
  }, [collectionName]);

  useEffect(() => {
    // Unsubscribe from previous listener if it exists
    if (unsubscribeRef) {
      unsubscribeRef();
    }

    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReadings(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      })));
    });
    
    setUnsubscribeRef(() => unsubscribe);
    
    return () => unsubscribe();
  }, [collectionName]);

  return (
    <main className="font-poppins p-10 font-sans max-w-3xl bg-white h-full overflow-y-scroll text-slate-900">
      <h1 className="text-2xl text-stone-600 font-bold mb-4">Calibration Testing</h1>
      <p className="text-gray-500 mb-6 italic text-sm">Check system Functionality</p>

      {/* BUZZER SECTION */}
      <button 
      onClick={handleSetBuzzer}
      className={`px-[1rem] py-[0.5rem] text-white ${buzzer ? "bg-red-500":"bg-blue-600"} oultine-none rounded-md mb-4 hover:cursor-pointer`}>
      {buzzer ? "STOP BUZZER" : "START BUZZER"}
      </button>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Collection Name</label>
        <input 
          type="text"
          value={collectionName} 
          onChange={(e) => setCollectionName(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="sensor_readings"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tag ID</label>
        <select 
          value={tagId} 
          onChange={(e) => setTagId(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="TAG01">TAG01 (Infusion Pump)</option>
          <option value="TAG02">TAG02 (Nebulizer)</option>
        </select>
      </div>

      <form onSubmit={sendTestData} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R1 - RSSI</label>
            <input 
              type="number"
              value={rssi1Input} 
              onChange={(e) => setRssi1Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R1 - RAW RSSI</label>
            <input 
              type="number"
              value={rawRssi1Input} 
              onChange={(e) => setRawRssi1Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R2 - RSSI</label>
            <input 
              type="number"
              value={rssi2Input} 
              onChange={(e) => setRssi2Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R2 - RAW RSSI</label>
            <input 
              type="number"
              value={rawRssi2Input} 
              onChange={(e) => setRawRssi2Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R3 - RSSI</label>
            <input 
              type="number"
              value={rssi3Input} 
              onChange={(e) => setRssi3Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">R3 - RAW RSSI</label>
            <input 
              type="number"
              value={rawRssi3Input} 
              onChange={(e) => setRawRssi3Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Distance (m)</label>
            <input 
              type="number"
              step="0.1"
              value={distanceInput} 
              onChange={(e) => setDistanceInput(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 p-3 text-white rounded font-bold transition active:scale-95" type="submit">
          Inject Signal to Firebase
        </button>
      </form>

      <div className="mt-10">
        <h3 className="text-lg font-semibold border-b pb-2 text-slate-700">Database Documents</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {readings.map((reading) => (
            <DocumentItemMemo key={reading.id} reading={reading} onDelete={deleteReading} />
          ))}
        </ul>
      </div>
    </main>
  );
}