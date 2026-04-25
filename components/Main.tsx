'use client'
import Map from '@/components/mapContainer'
import Test from '@/components/test'
import React,{useState} from 'react';
import Calibration from '@/components/Calibration';

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
    const [SysSubSec, setSysSubSec] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [showCalibration, setShowCalibration] = useState(false);

    const handleFloorOpt = () =>{
        if(!floorOption){
            setFloorOptions(true)
        }
        else{
        setFloorOptions(false)
        }
    }
    const toCVS = () =>{
        setIsBiomed(false);
        setFloorOptions(false);
        // console.log(isBiomed);
    }
    const changeFloor = () =>{
        setIsBiomed(true);
        setFloorOptions(false);
        console.log(isBiomed);
    }
    const showSystemSubSec = () =>{
        if(!SysSubSec)setSysSubSec(true);
        else setSysSubSec(false);
    }

    const handleShowTest = () =>{
        if(!showTest)setShowTest(true);
        else setShowTest(false)
        setShowCalibration(calibration => calibration? false : false);
    }
    const handleShowCalibration = () =>{
        if(!showCalibration)setShowCalibration(true);
        else setShowCalibration(false) 
    }

    return(
        <div className={`${logIn ? '':'hidden'} w-full h-auto bg-stone-50 text-[1rem] text-stone-800`}>
        {/* NAV SECTION OF MAIN */}
        <div className="flex justify-between py-4 relative px-6">
        <div className="flex gap-[0.8rem] justify-center items-center">
            <div className="w-[2.9rem] h-[1.9rem] bg-logo bg-cover bg-center bg-no-repeat "></div> 
            {/* <h2 className="font-semibold text-stone-600 items-center">mapa</h2> */}
        </div>
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
        <form className={`shadow-stone-500 absolute top-2 z-20 ${showTest||showCalibration?'hidden':''} `}>
        <input className="bg-stone-100 py-2 px-4 rounded-l-md w-80 focus:outline-none focus:bg-white" type="text" placeholder="Find Equipment"/>
        <button className="py-2 px-3 text-stone-100 font-medium bg-blue-400 rounded-r-sm hover:cursor-pointer" type="submit">Find</button>
        </form>

        {/*SIDE BAR WRAPPER */}
        <div className='hidden md:block z-20 h-full w-[16rem] bg-stone-100 absolute flex flex-col left-0 py-[1.125rem] px-[1.5rem] gap-8'>
        
        <div className='w-full flex flex-col '>
            
        {/* header */}
        <span className='font-semibold text-stone-700'>Active Tags</span>

        <div className='w-full flex justify-between items-baseline text-[0.75rem] pl-4 py-1.5'>
        <span className='font-semibold text-stone-700'>Device</span>
        <span className='text-[0.75rem]'>Serial No.</span>
        </div>

        {/* ACTIVE LIST CONTAINER */}
        <div className='w-full text-[0.875rem] flex flex-col gap-[0.25rem] pl-4 py-2'>

        <section className='w-full flex justify-between items-center'>
            <span className='text-green-500 py-[0.125rem] leading-[1]'>Infusion Pump</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>Nebulizer</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal}</span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>Surgical Pump</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>Suction Machine</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>BP Apparatus</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>Syringe Pump</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>

        <section className='w-full flex justify-between items-center'>
            <span className=''>Infusion Pump</span>
            <span className='font-medium text-stone-700 text-[0.7rem] leading-[1]'>{signal} </span>
        </section>
        </div>
        </div>
        
        {/* SETTINGS CONTAINER */}
        <div className='w-full flex flex-col justify-between py-2 border-t border-stone-400'>
        <span className='font-semibold text-stone-700'>Settings</span>
        {/* <span className='text-[0.875rem]'>Signal</span> */}

        <div>
        <section className='flex items-center gap-2 '>
        <div className=' flex items-center w-[1rem]'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className=''>
        <path fill="rgb(56, 55, 59)" d="M512 320C512 214 426 128 320 128L320 512C426 512 512 426 512 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320z"/>
        </svg>
        </div>
        <p className={'hover:cursor-pointer'}>Themes</p>
        </section>

        <section className="hover:cursor-pointer">

        <section className='flex items-center gap-2'>
        <div className=' w-[1.1rem]'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
        {/* <!--!Font Awesome Pro v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.--> */}
        <path fill="rgb(56, 55, 59)" d="M541.4 162.6C549 155 561.7 156.9 565.5 166.9C572.3 184.6 576 203.9 576 224C576 312.4 504.4 384 416 384C398.5 384 381.6 381.2 365.8 376L178.9 562.9C150.8 591 105.2 591 77.1 562.9C49 534.8 49 489.2 77.1 461.1L264 274.2C258.8 258.4 256 241.6 256 224C256 135.6 327.6 64 416 64C436.1 64 455.4 67.7 473.1 74.5C483.1 78.3 484.9 91 477.4 98.6L388.7 187.3C385.7 190.3 384 194.4 384 198.6L384 240C384 248.8 391.2 256 400 256L441.4 256C445.6 256 449.7 254.3 452.7 251.3L541.4 162.6z"/></svg>
        </div>
        <p onClick={showSystemSubSec}>System Maintenance</p>
        </section>

        <section className={`text-[0.875rem] pl-4 w-auto ${SysSubSec? '':'hidden'} `}>
            <p onClick={handleShowCalibration}>Calibration</p>
            <p onClick={handleShowTest}>Testing</p>
        </section>
        </section>
        </div>
        </div>

        </div>

        {/*Map wrapper */}
        <div className={`w-full ${showTest||showCalibration? 'hidden':''} z-10`}>
        <Map isBiomed={isBiomed} setIsBiomed={setIsBiomed}/>
        </div>

        {/* Test Wrapper */}
        <div className={` h-full ${showTest? '':'hidden'}`}>
        <Test/>
        </div>

        {/* Calibration wrapper */}
        <div className={`h-full w-[50rem] ${showCalibration? '':'hidden'}`}>
        <Calibration/>
        </div>

        {/* LOWER RIGHT BOTTON WRAPPER */}
        <div className={`z-20 right-0 bottom-0 px-4 py-6 flex flex-col absolute gap-2 ${showTest? 'hidden':''}`}>
            <section className='flex gap-2 justify-end items-center text-[0.875rem]'>
            <p>FLOOR</p>
            <button onClick={handleFloorOpt} className='w-[3rem] h-[3rem] bg-floor bg-cover bg-center rounded-full hover:cursor-pointer'>
            </button>

            <div className={`absolute ${floorOption ? '': 'hidden'} flex flex-col w-auto h-auto left-0 bottom-10 shadow-stone-500 shadow-md rounded-md`}>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400 rounded-t-md' onClick={toCVS}>CVS</button>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400'>2ND</button>
            <button className='w-full px-5 py-1 bg-stone-50 hover:bg-stone-400'>3RD</button>
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
        <p>All rights reserve</p>
        <p> magallanes | pacheco @2026</p>
        
        </div>

        </div>
    )
}