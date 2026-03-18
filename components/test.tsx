"use client";
import { useState, useEffect } from "react";
import { db } from "@src/lib/firebase"; // Import the DB we initialized earlier
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp,deleteDoc,doc } from "firebase/firestore";

// Define a TypeScript type for our data
interface Task {
  id: string;
  value: string;
}

export default function Login() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // --- PART A: WRITE DATA ---
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await addDoc(collection(db, "sensor_readings"), {
        right: input,
        bottom: 47,
        createdAt: serverTimestamp(), // Records when it was added
      });
      setInput(""); // Clear input after clicking
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  const deleteTask = async (id:any) => {
    try{
    await deleteDoc(doc(db,"sensor_readings",id))
    }catch(err){
      console.error("Error deleting document: ", err)
    }

  }
  
  // --- PART B: READ DATA (REAL-TIME) ---
  useEffect(() => {
    // Create a query to get tasks ordered by time
    const q = query(collection(db, "sensor_readings"), orderBy("createdAt", "asc"));

    // This listener updates the UI automatically whenever Firestore changes!
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({
        id: doc.id,
        value: doc.data().value
      })));
    });

    return () => unsubscribe(); // Stop listening when page closes
  }, []);

  return (
    <main style={{ padding: "50px", fontFamily: "sans-serif" }}>
      <h1>Firebase Learning Project</h1>

      <form onSubmit={addTask}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <button className="bg-blue-500 p-2 text-white rounded" type="submit">Update Firebase</button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h3>Data from Firestore:</h3>
        <ul>
          {tasks.map((task) => (
            <li className="m-1" key={task.id}>{task.value}<button className="p-1 ml-1 bg-blue-500 rounded-md" onClick={()=> deleteTask(task.id)}>DELETE</button></li>
          ))}
        </ul>
      </div>
    </main>
  );
}