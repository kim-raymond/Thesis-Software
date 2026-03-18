'use client'
import Map from '@/components/mapContainer'
import React,{Dispatch, SetStateAction,useState} from 'react';
interface loginProps{
    logIn:boolean;
    setLogIn:React.Dispatch<React.SetStateAction<boolean>>;
}
export default function({logIn,setLogIn}:loginProps){

    const signal = "M1220050188";

    const changeLogIn=()=>{
        setLogIn(false);
    }
    const [floorOption, setFloorOptions] = useState(false);
    const [isBiomed, setIsBiomed] = useState(false);

    const handleFloorOpt = () =>{
        if(!floorOption){
            setFloorOptions(true)
        }
        else{
        setFloorOptions(false)
        }
    }

    const changeFloor = () =>{
        setIsBiomed(true);
        setFloorOptions(false);
        console.log(isBiomed);
    }

    return(
        <div className={`${logIn ? '':'hidden'} w-full h-auto bg-stone-50 text-[1rem] text-stone-800`}>
        {/* NAV SECTION OF MAIN */}
        <div className="flex justify-between py-4 relative px-6">
        <h2 className=" font-semibold text-blue-400 italic items-center">NMMC <span className="text-blue-500">RTLS</span></h2>
        <nav className="flex gap-8 items-center">
            <p className="text-stone-700 text-[0.875rem] font-semibold hover:cursor-pointer">MAP</p>
            <p className="text-stone-700 text-[0.875rem] font-semibold hover:cursor-pointer">TAGS</p>
            <p className="text-stone-700 text-[0.875rem] font-semibold hover:cursor-pointer">DEVICE</p>
        </nav>
        <div className="flex gap-2 items-center group">
            <p className="font-medium text-stone-600">Admin</p>
            <div className="hover:cursor-pointer w-7  h-7 full  bg-avatar1 bg-cover bg-center rounded-full"></div>
        <button onClick={changeLogIn} className='absolute hidden group-hover:block group-hover:pointer-events-auto hover:cursor-pointer text-[0.75rem] right-0 bottom-0 bg-gray-200 py-1 px-2'>LOG OUT</button>
        </div>
        </div>

        {/* MAIN WRAPPER */}
        <div className="bg-stone-300 w-full h-140 relative flex flex-col items-center px-6">
        {/* Search Section */}
        <form className="shadow-stone-500 absolute top-2 z-20" action="">
        <input className="bg-stone-100 py-2 px-4 rounded-l-md w-80 focus:outline-none focus:bg-white" type="text" placeholder="Find Equipment"/>
        <button className="py-2 px-3 text-stone-100 font-medium bg-blue-400 rounded-r-sm hover:cursor-pointer" type="submit">Find</button>
        </form>

        {/* ACTIVE TAGS WRAPPER */}
        <div className='z-20 h-full w-[16rem] bg-stone-100 hidden flex flex-col left-0 py-[1.125rem] px-[1.5rem] gap-4'>
        {/* header */}
        <div className='w-full flex justify-between'>
        <span className='font-semibold text-stone-700'>Active Tags</span>
        {/* <span className='text-[0.875rem]'>Signal</span> */}
        </div>

        <div className='w-full flex justify-between items-baseline text-[0.875rem]'>
        <span className='font-semibold text-stone-700'>Device</span>
        <span className='text-[0.75rem]'>Serial No.</span>
        </div>

        {/* ACTIVE LIST CONTAINER */}
        <div className='w-full text-[0.875rem] flex flex-col gap-[0.25rem]'>

        <section className='w-full flex justify-between'>
            <span className='text-green-500'>Patient Monitor</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>Infusion Pump</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>Surgical Pump</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>Suction Machine</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>BP Apparatus</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>Asset 6</span>
            <span className='text-blue-300'>{signal} </span>
        </section>

        <section className='w-full flex justify-between'>
            <span className=''>Infusion Pump</span>
            <span className='text-blue-300'>{signal} </span>
        </section>
        
        </div>
        </div>

        {/*Map wrapper */}
        <div className='w-full z-10'>
        <Map isBiomed={isBiomed} setIsBiomed={setIsBiomed}/>
        </div>

        {/* LOWER RIGHT BOTTON WRAPPER */}
        <div className='z-20 right-0 bottom-0 px-4 py-6 flex flex-col absolute gap-2'>
            <section className='flex gap-2 justify-end items-center text-[0.875rem]'>
            <p>FLOOR</p>
            <button onClick={handleFloorOpt} className='w-[3rem] h-[3rem] bg-floor bg-cover bg-center rounded-full hover:cursor-pointer'>
            </button>

            <div className={`absolute ${floorOption ? '': 'hidden'} flex flex-col w-auto h-auto left-0 bottom-10 shadow-stone-500 shadow-md rounded-md`}>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400 rounded-t-md'>GND</button>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400'>2ND</button>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400 rounded-b-md'>3RD</button>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400 rounded-b-md' onClick={changeFloor}>BIOMED</button>
            </div>

            </section>
            <section className='flex items-center gap-2 justify-end'>
            <p className='text-[0.875rem] align-middle'>PATH</p>
            <button className='w-[3rem] h-[3rem] bg-path bg-cover bg-center bg-stone-800 rounded-full hover:cursor-pointer'>
            </button>
            </section>
        </div>
        </div>

        {/* FOOTER */}
        <div className='w-full h-max p-4 bg-stone-800 flex flex-col text-[0.75rem] text-stone-200 items-center justify-center'>
        <p>all rights reserve</p>
        <p> magallanes | pacheco @2026</p>
        </div>

        </div>
    )
}