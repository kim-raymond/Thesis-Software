'use client';
import React, {useState } from 'react'


interface LogInProps{
    logIn:boolean;
    setLogIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ({logIn, setLogIn}:LogInProps){

    function changeLoginStat(){
        // e.preventDefault();
        if(userId && password!==''){
            if(password=='thesisdefended'&& userId=='admin'){
             setLogIn(true);
            }
        }
    }
    const [password, setPassword]=useState<string>('');
    const [userId, setUserId] = useState<string>('');

    return(
        <div className={` ${logIn ? 'hidden':''} w-full h-screen bg-logIn bg-contain flex flex-col items-center justify-center`}>
            <div className='flex'>
            <div className='flex flex-col justify-center items-center px-[2rem] py-[3.5rem] rounded-l-[2rem] bg-stone-100 gap-[2rem]'>
            <h1 className=" w-[14rem] text-center  text-blue-500 ">
                <div className='font-gibed font-regular text-[3.53rem] tracking-tight leading-[2rem] '>mapa</div>
                <div className="text-[1.5rem] font-medium pt-[1rem]">Login Acess</div></h1>
            <div className="flex flex-col">
            {/* <p className=" text-[1rem] text-stone-600 text-center font-bold"><span className="text-blue-500">Login</span> User Account</p> */}
            <form className="flex flex-col w-80 gap-2">
                <input className="focus:outline-none focus:border-stone-500 w-80 border-b-2  border-stone-300 text-[0.875rem] text-stone-600 p-3 " placeholder="Account Name" type='text' onChange={e=>setUserId(e.target.value)} value={userId}/>
                <input className="focus:outline-none focus:border-stone-500 w-80 border-b-2 border-stone-300 text-[0.875rem] text-stone-600 p-3 " placeholder="Password" type='password' onChange={e=>setPassword(e.target.value)} value={password}/>
            </form>
            </div>
            <button type='submit' onClick={changeLoginStat} className="w-full bg-blue-500 py-2.5 font-bold rounded-[20rem] hover:cursor-pointer">LOGIN</button>
            </div>
            <div className='text-stone-700 w-[18rem] h-full bg-center bg-cover bg-no-repeat bg-logIn2 gap-[2rem] rounded-r-[2rem] bg-stone-100'>
            {/* <div className=" w-full h-full px-[1.5rem] flex rounded-r-[2rem] justify-end">
                <p className='text-[1.5rem] font-bold w-[15rem] h-[2rem] border'>Equipment shouldn't play hide and seek, use 
                <span className="font-bold hover:cursor-pointer"> mapa.</span>
                </p>
            </div> */}
            </div>
            </div>
        </div>
    )

}