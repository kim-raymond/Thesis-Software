'use client'

import { useState, useEffect, use } from "react";
import { db } from "@src/lib/firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";

interface historyReadings {
    id:string,
    data:Record<string, any>
}

export default function History() {

    const [records, setRecords] = useState<historyReadings[]>([]);

    const formatFieldValue = (value: any) => {
    if (value instanceof Date) return value.toLocaleString();
    if (value && typeof value.toDate === "function") return value.toDate().toLocaleString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
    };

    useEffect(() => {
        const q = query(collection(db,"history"),orderBy("time","desc"));
        const unsubscribe = onSnapshot(q, (snapshot)=>{
            setRecords(snapshot.docs.map(doc => ({
                id:doc.id,
                data:doc.data(),
            })));
        });
        return ( )=> unsubscribe();
    },["history"]);

    return (
        <div className='w-full h-full flex flex-col gap-[2rem] bg-white text-[1rem] px-[2rem] py-[1rem] shadow-md rounded-lg'>

        <h2 className="font-bold text-center text-stone-600">History Log</h2>

        <div className="flex flex-col gap-4 w-full overflow-y-scroll">
        {records.map(record => (
        <div key={record.id}>
        <p className="text-red-500">Record</p>
        {/* Details Containr */}
        <div className="flex flex-col gap-1">
        {Object.entries(record.data).map(([key, value]) => (
        <div key={key} 
        className="rounded-lg bg-slate-50 w-[20rem] p-3 border border-slate-200">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
            {key}</p>
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
            {formatFieldValue(value)}
            </pre>
        </div>
        ))}
        </div>

        </div>
        ))}
        </div>
        </div>
    )
}