"use client"
import React from 'react'
import Image from 'next/image'
import { BiMaleFemale } from "react-icons/bi";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

// #region Sample data
const data = [
    {
    name: 'Toatl',
    count: 106,
    fill: 'white',
  },
  {
    name: 'Girls',
    count: 53,
    fill: '#fae27c',
  },
  {
    name: 'Boys',
    count: 53,
    fill: '#c3ebfa',
  },
];

// #endregion
const style = {
  top: '50%',
  right: 0,
  transform: 'translate(0, -50%)',
  lineHeight: '24px',
};

function CountChart() {
  return (
    <div className='bg-white rounded-xl w-full h-full p-4'>
        {/* TITLE */}
        <div className='flex justify-between items-center'>
          <h1 className='text-lg font-semibold'>Students</h1>
          <Image src="/3dots.svg" alt="menu" width={25} height={25}/>
        </div>

        {/* CHART */}
        <div className='w-full h-[75%] relative'>
           <ResponsiveContainer>
             <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="100%"
                barSize={32}
                data={data}
            >
                <RadialBar background dataKey="count" />
            </RadialBarChart>
           </ResponsiveContainer>
           <BiMaleFemale size={40} 
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#fae27c]'
            />
        </div>

        {/* BOTTOM */}
        <div className='flex justify-center gap-16'> 
          <div className='flex flex-col gap-1 items-center'>
            <div className='w-6 h-6 bg-purple-200 rounded-full drop-shadow-2xl'/>
            <h1 className='font-bold'>1,234</h1>
            <h2 className='text-xs text-gray-300'>Boys(55%)</h2>
          </div>

          <div className='flex flex-col gap-1 items-center'>
            <div className='w-6 h-6 bg-amber-200 rounded-full drop-shadow-2xl'/>
            <h1 className='font-bold'>1,234</h1>
            <h2 className='text-xs text-gray-300'>Girls(55%)</h2>
          </div>
        </div>
    </div>
  )
}

export default CountChart