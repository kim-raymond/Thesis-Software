"use client";

import Login from "@/components/Login";
import Main from "@/components/Main";
import Test from "@/components/test";
import { useState } from "react";
// import Test from "@/components/test";
export default function Home() {

  const [logIn, setLogIn] = useState<boolean>(false);
  return (
    <div>
    <Login logIn={logIn} setLogIn={setLogIn}/>
    <Main logIn={logIn} setLogIn={setLogIn}/>
    <Test />
    </div>
  );
}