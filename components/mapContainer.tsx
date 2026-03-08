'use client'
import {easeIn, motion} from "motion/react"
import {useState} from "react"

export default function Map (){
    const box ={
        width:25,
        height:25,
        backgroundColor:"#ff0088",
        borderRadius:"50%",
    }
    // interface Position{
    //     left:number,
    //     bottom:number
    // }
    // const [asset1Postion,setAsset1Position] = useState<Position[]>([]);
    const asset1Postion ={
        left:50,
        bottom:40,
    }
    return(
        <div className="h-[85vh] w-full flex items-center justify-center">
            <div className="bg-map1 bg-center bg-cover w-[76rem] h-full relative">
            <div className={`absolute flex items-center justify-center rounded-full w-24 left-[60%] bottom-[36%]`}>            
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