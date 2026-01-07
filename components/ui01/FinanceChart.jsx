"use client"
import React from 'react'
import Image from 'next/image'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// #region Sample data
const data = [
  {
    name: 'Jan',
    income: 4000,
    expense: 2400,
  },
  {
    name: 'Feb',
    income: 3000,
    expense: 1398,
  },
  {
    name: 'Mar',
    income: 2000,
    expense: 9800,
  },
  {
    name: 'Apr',
    income: 2780,
    expense: 3908,
  },
  {
    name: 'May',
    income: 1890,
    expense: 4800,
  },
  {
    name: 'Jun',
    income: 2390,
    expense: 3800,
  },
  {
    name: 'Jul',
    income: 3490,
    expense: 4300,
  },
   {
    name: 'Aug',
    income: 3490,
    expense: 4300,
  },
   {
    name: 'Sep',
    income: 3490,
    expense: 4300,
  },
   {
    name: 'Oct',
    income: 3490,
    expense: 4300,
  },
   {
    name: 'Nov',
    income: 3490,
    expense: 4300,
  },
   {
    name: 'Dec',
    income: 3490,
    expense: 4300,
  },
];
function FinanceChart() {
  return (
    <div className='bg-white rounded-lg p-4'>
     {/* TITLE */}
        <div className='flex justify-between items-center'>
         <h1 className='text-lg font-semibold'> Finance</h1>
         <Image src="/3dots.svg" alt="menu" width={25} height={25}/>
        </div>
        {/* FINANCE CHART */}
     <LineChart
      style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke='#ddd'/>
      <XAxis
       dataKey="name" 
       axisLine={false} 
       tick={{fill:"#d1d5db"}} 
       tickLine={false}
       tickMargin={10}
       />
      <YAxis 
       width="auto" 
       axisLine={false} 
       tick={{fill:"#d1d5db"}} 
       tickLine={false}
       tickMargin={20}
       />
      <Tooltip contentStyle={{borderRadius:"10px", borderColor:"ligthgray"}}/>
       <Legend align='center' verticalAlign='top' wrapperStyle={{paddingTop: "20px", paddingBottom:"40px"}}/>
      <Line type="monotone" dataKey="income" stroke="#c3ebfa" strokeWidth={3}/>
      <Line type="monotone" dataKey="expense" stroke="#cfceff" strokeWidth={3}/>
    </LineChart>
    </div>
  )
}

export default FinanceChart