"use client";

import Login from "@/components/Login";
import Main from "@/components/Main";
import { useState } from "react";
// import Test from "@/components/test";
export default function Home() {

  const [logIn, setLogIn] = useState<boolean>(false);
  return (
    // <Test />
    <div>
    <Login logIn={logIn} setLogIn={setLogIn}/>
    <Main logIn={logIn} setLogIn={setLogIn}/>
    </div>
  );
}