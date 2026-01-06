"use client";
import React from 'react'
import Image from 'next/image'
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
// #region Sample data
const data = [
  {
    name: 'Mon',
    present: 40,
    absent: 24,
  },
  {
    name: 'Tue',
    present: 30,
    absent: 13,
  },
  {
    name: 'Wed',
    present: 20,
    absent: 98,
  },
  {
    name: 'Thu',
    present: 27,
    absent: 39,
  },
  {
    name: 'Fri',
    present: 18,
    absent: 48,
  },
  {
    name: 'Sat',
    present: 23,
    absent: 38,
  },
  {
    name: 'Sun',
    present: 34,
    absent: 43,
  },
];

function AttendanceChart() {
  return (
    <div className='bg-white rounded-lg p-4 h-full'>
        <div className='flex justify-between items-center mb-4'>
            <h1 className='text-lg font-semibold'>Attendance</h1>
            <Image src="/3dots.svg" alt="menu" width={25} height={25}/>
        </div>
     <ResponsiveContainer width="100%" height="90%">
        <BarChart
        data={data}
        width={600}
        height={250}
        barSize={20}
        >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd'/>
        <XAxis dataKey="name" axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
        <YAxis axisLine={false} tick={{fill:"#d1d5db"}} tickLine={false}/>
        <Tooltip contentStyle={{borderRadius:"10px", borderColor:"ligthgray"}}/>
        <Legend align='center' verticalAlign='top' wrapperStyle={{paddingTop: "20px", paddingBottom:"40px"}}/>
        <Bar
         dataKey="present" 
         fill="#fae27c" 
         legendType='circle'
         radius={[10,10,0,0]}
         />
        <Bar
         dataKey="absent" 
         fill="#c3ebfa"  
         legendType='circle' 
         radius={[10,10,0,0]}
         />
        </BarChart>
     </ResponsiveContainer>
    </div>
  )
}

export default AttendanceChart