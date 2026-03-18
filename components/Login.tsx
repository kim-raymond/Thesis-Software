'use client';
import React, {useState } from 'react'


interface LogInProps{
    logIn:boolean;
    setLogIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ({logIn, setLogIn}:LogInProps){

    function changeLoginStat(e:React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(userId && password!==''){
            if(password=='thesisdefended'&& userId=='admin'){
             setLogIn(true);
            }
        }
    }
    const [password, setPassword]=useState<string>('');
    const [userId, setUserId] = useState<string>('');

    return(
        <div className={` ${logIn ? 'hidden':''} w-full h-screen  border-black bg-amber-50 flex flex-col items-center justify-center gap-7`}>
            <h1 className="w-40 text-center text-[2.25rem] text-blue-500 font-medium">Welcome!</h1>
            <div className="flex flex-col gap-5">
            <p className=" text-[1rem] text-stone-600 text-center font-bold"><span className="text-blue-500">Login</span> User Account</p>
            <form className="flex flex-col w-80 gap-5" onSubmit={changeLoginStat}>
                <input className="focus:outline-none focus:bg-white w-80 border border-stone-400 text-[0.875rem] text-stone-700 p-3 rounded-sm" placeholder="Input User Account Number" type='text' onChange={e=>setUserId(e.target.value)} value={userId}/>
                <input className="focus:outline-none focus:bg-white w-80 border border-stone-400 text-[0.875rem] text-stone-600 p-3 rounded-sm" placeholder="Password" type='password' onChange={e=>setPassword(e.target.value)} value={password}/>
                <button className="bg-blue-400 py-2.5 font-bold rounded-[20rem] mt-7 hover:cursor-pointer">LOGIN</button>
            </form>
            </div>
        </div>
    )

}