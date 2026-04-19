"use client";
import Login from "@/components/Login";
import Main from "@/components/Main";
import { useState } from "react";

export default function Home() {

  const [logIn, setLogIn] = useState<boolean>(false);
  return (
    <div className="font-poppins">
    <Login logIn={logIn} setLogIn={setLogIn}/>
    <Main logIn={logIn} setLogIn={setLogIn}/>
    </div>
  );
}