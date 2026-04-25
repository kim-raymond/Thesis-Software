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
        <div className={` ${logIn ? 'hidden':''} w-full h-screen bg-logIn bg-contain flex flex-col items-center justify-center relative`}>
            <div className='flex flex-col lg:flex-row '>

            <div className='flex flex-col justify-center items-center px-[2rem] py-[3rem] rounded-[2rem] lg:rounded-r-[0rem] bg-stone-100 gap-[2rem]'>
            <div className="flex flex-col gap-[2.2rem] w-[14rem] text-center text-stone-500">
                <div className='flex items-center gap-[1.5rem] justify-center'>
                    <div className='bg-logo bg-cover bg-center bg-no-repeat w-[4.6rem] h-[3rem]'></div>
                    <h2 className='font-medium text-[1.5rem] tracking-tight leading-[2rem] '>mapa</h2>
                </div>
                <div className="text-[1.25rem] font-medium">Login Acess</div>
            </div>
            <div className="flex flex-col">
            {/* <p className=" text-[1rem] text-stone-600 text-center font-bold"><span className="text-blue-500">Login</span> User Account</p> */}
            <form className="flex flex-col w-60 md:w-80 gap-2">
                <input className="focus:outline-none focus:border-stone-500 border-b-2  border-stone-300 text-[0.875rem] text-stone-600 p-3 " placeholder="Account Name" type='text' onChange={e=>setUserId(e.target.value)} value={userId}/>
                <input className="focus:outline-none focus:border-stone-500 border-b-2 border-stone-300 text-[0.875rem] text-stone-600 p-3 " placeholder="Password" type='password' onChange={e=>setPassword(e.target.value)} value={password}/>
            </form>
            </div>
            <button type='submit' onClick={changeLoginStat} className="w-full bg-blue-500 hover:bg-blue-600 py-2.5 font-bold rounded-[20rem] hover:cursor-pointer">LOGIN</button>
            </div>
            
            <div className='text-stone-700 w-[18rem] h-full bg-center bg-cover bg-no-repeat bg-logIn2 gap-[2rem] rounded-r-[2rem] bg-stone-100'>
            {/* <div className=" w-full h-full px-[1.5rem] flex rounded-r-[2rem] justify-end">
                <p className='text-[1.5rem] font-bold w-[15rem] h-[2rem] border'>Equipment shouldn't play hide and seek, use 
                <span className="font-bold hover:cursor-pointer"> mapa.</span>
                </p>
            </div> */}
            </div>
            </div>

            {/* footer */}
            <div className='absolute bottom-0 p-8'>
            <p className='text-center text-stone-500 text-[0.75rem] mt-[2rem]'>Copyright © 2026. All rights reserved.</p>
            {/* <p className='text-center text-stone-500 text-[0.875rem]'>Designed and Developed by</p> */}
            <p className='text-center text-stone-500 text-[0.75rem]'>magallanes | pacheco</p>
            </div>
        </div>
    )

}