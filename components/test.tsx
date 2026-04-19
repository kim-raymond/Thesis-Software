"use client";
import { useState, useEffect } from "react";
import { db } from "@src/lib/firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface SignalReading {
  id: string;
  data: Record<string, any>;
}

export default function Login() {
  const [rssi1Input, setRssi1Input] = useState("-70");
  const [rssi2Input, setRssi2Input] = useState("-80");
  const [rssi3Input, setRssi3Input] = useState("-75");
  const [distanceInput, setDistanceInput] = useState("5.0");
  const [collectionName, setCollectionName] = useState("sensor_readings");
  const [readings, setReadings] = useState<SignalReading[]>([]);
  const [buzzer, setBuzzer] = useState(false);

  const formatFieldValue = (value: any) => {
    if (value instanceof Date) return value.toLocaleString();
    if (value && typeof value.toDate === "function") return value.toDate().toLocaleString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const handleSetBuzzer = async () =>{
    try{
      const newBuzzerState = !buzzer;
      setBuzzer(newBuzzerState);
    addDoc(collection(db, collectionName), {
    // BioMedReaderId: 1,
    createdAt: serverTimestamp(),
    buzzerState: !buzzer,
    });
    }catch(err){
      console.error("Error setting buzzer state: ", err);
    }
  }

  const sendTestData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rssi1 = Number(rssi1Input);
      const rssi2 = Number(rssi2Input);
      const rssi3 = Number(rssi3Input);
      const distance = Number(distanceInput);

      await addDoc(collection(db, collectionName), {
        BioMedReaderId: 1,
        rssi1,
        distance,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
        // unixTime: Date.now(),
      });

      await addDoc(collection(db, collectionName), {
        BioMedReaderId: 2,
        rssi2,
        distance,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
        // unixTime: Date.now(),
      });

      await addDoc(collection(db, collectionName), {
        BioMedReaderId: 3,
        rssi3,
        distance,
        createdAt: serverTimestamp(),
        buzzerState: buzzer,
        // unixTime: Date.now(),
      });

      console.log(`✅ Injected Reader 1: ${rssi1}, Reader 2: ${rssi2}, Reader 3: ${rssi3}, Distance: ${distance}, buzzer: ${buzzer} into collection`);
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  const deleteReading = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error("Error deleting document: ", err);
    }
  };

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReadings(snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      })));
    });
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

      <form onSubmit={sendTestData} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BioMedReaderId 1 - RSSI (dBm)</label>
            <input 
              type="number"
              value={rssi1Input} 
              onChange={(e) => setRssi1Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BioMedReaderId 2 - RSSI (dBm)</label>
            <input 
              type="number"
              value={rssi2Input} 
              onChange={(e) => setRssi2Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BioMedReaderId 3 - RSSI (dBm)</label>
            <input 
              type="number"
              value={rssi3Input} 
              onChange={(e) => setRssi3Input(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex-1 flex flex-col justify-between">
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
            <li key={reading.id} className="bg-white p-4 border rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Document ID</p>
                  <p className="font-mono text-sm break-all">{reading.id}</p>
                </div>
                <button 
                  className="px-3 py-1 bg-red-50 text-red-500 rounded-md hover:bg-red-100 text-xs font-bold transition"
                  onClick={() => deleteReading(reading.id)}
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
          ))}
        </ul>
      </div>
    </main>
  );
}