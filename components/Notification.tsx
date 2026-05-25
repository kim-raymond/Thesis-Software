'use client'
import { useState, useEffect } from "react";
import { db } from "@src/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

interface historyReadings {
    id: string,
    data: Record<string, any>
}

export default function History() {

    const [records, setRecords] = useState<historyReadings[]>([]);

    useEffect(() => {
        // listen for user-visible notifications
        const q = query(collection(db, "notification"), orderBy("time", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecords(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        });

        // listen for buzzerState changes and add a notification when a buzzer indicates removal
        const buzzerUnsub = onSnapshot(collection(db, "buzzerState"), async (snap) => {
            for (const change of snap.docChanges()) {
                if (change.type === 'added' || change.type === 'modified') {
                    const d = change.doc.data();
                    if (d?.state === true) {
                        try {
                            await addDoc(collection(db, "notification"), {
                                message: 'tag is being removed',
                                tagId: d.tagId ?? d.tag ?? null,
                                assetName: d.assetName ?? null,
                                time: serverTimestamp(),
                            });
                        } catch (err) {
                            console.error('Error adding buzzer notification', err);
                        }
                    }
                }
            }
        });

        return () => { unsubscribe(); buzzerUnsub(); };
    }, []);

    const formatTime = (value: any) => {
        if (!value) return '';
        if (value instanceof Date) return value.toLocaleString();
        if (value && typeof value.toDate === "function") return value.toDate().toLocaleString();
        return String(value);
    };

    const renderLine = (data: any) => {
        const parts = [data.message || 'Notification'];
        if (data.assetName) parts.push(data.assetName);
        else if (data.tagId) parts.push(data.tagId);
        if (data.Location) parts.push(data.Location);
        if (data.Battery !== undefined && data.Battery !== null && !isNaN(Number(data.Battery))) {
            parts.push(`Battery ${Number(data.Battery)}%`);
        }
        return parts.filter(Boolean).join(' · ');
    };

    return (
        <div className='w-full h-full flex flex-col gap-[2rem] bg-white text-[1rem] px-[2rem] py-[1rem] shadow-md rounded-lg'>

            <h2 className="font-bold text-center text-stone-600">Notification</h2>

            <div className="flex flex-col gap-3 w-full overflow-y-scroll">
                {records.map(record => {
                    const data = record.data || {};
                    return (
                        <div key={record.id} className="rounded-lg bg-slate-50 w-full p-3 border border-slate-200">
                            <p className="text-sm font-medium text-slate-800 truncate">{renderLine(data)}</p>
                            <p className="text-[0.65rem] text-slate-500 mt-1">{formatTime(data.time)}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}