'use client'
import {easeIn, motion} from "motion/react"
import React,{Dispatch, SetStateAction,useState,useEffect} from 'react';


import { db } from "@src/lib/firebase"; // Import the DB we initialized earlier
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,deleteDoc,doc } from "firebase/firestore";

interface stateProps{
    isBiomed:boolean;
    setIsBiomed:React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Map ({isBiomed,setIsBiomed}:stateProps){
    const box ={
        width:25,
        height:25,
        backgroundColor:"#ff0088",
        borderRadius:"50%",
    }
    interface Position{
        right:number,
        bottom:number
    }
    const [asset1Position,setAsset1Position] = useState<Position>({right:60,bottom:42});

    useEffect(() => {
    // Create a query to get tasks ordered by time
    const q = query(collection(db, "sensor_readings"), orderBy("createdAt", "asc"));

    // This listener updates the UI automatically whenever Firestore changes!
    const unsubscribe = onSnapshot(q, (snapshot) => {
    const latestReading = snapshot.docs[snapshot.docs.length - 1];
    const latest = snapshot.docs[snapshot.docs.length - 1];
     if (latest) {
    setAsset1Position(latest.data() as Position);
     }
    });
    
    // Stop listening when page closes
    return () => unsubscribe(); 
  }, []);

    return(
        <div className="h-[85vh] w-full flex items-center justify-center">
            <div className={`${isBiomed ? 'bg-biomed' : 'bg-map1'} bg-center bg-cover w-[50rem] h-full relative border`}>
            <div className={`absolute flex items-center justify-center rounded-full w-24`} 
            style={{
                right:`${asset1Position.right}%`,
                bottom:`${asset1Position.bottom}%`,
                transition:"all 0.5s ease-in-out"
            }}>            
            <motion.div
            initial={{ scale: 0.6}}
            animate={{ scale:1}}
            transition={{ repeat: Infinity,repeatType:"reverse",duration:1,ease:"easeInOut"}}               
            style={box}
            />
            </div>
            </div>
        </div>
    )
}