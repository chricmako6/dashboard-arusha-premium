import React from 'react'
import Image from 'next/image';
import { PiChartLineUp } from "react-icons/pi";


const userData = [
  { 
    id: 1, 
    icon: <PiChartLineUp className='w-5 h-5 text-[#c3ebfa]'/>, 
    value: '1,234', 
    username: 'Total Amount' 
  },
  { 
    id: 2, 
    icon: <PiChartLineUp className='w-5 h-5 text-[#c3ebfa]'/>, 
    value: '1,679', 
    username: 'Total Tuition' 
  },
  { 
    id: 3, 
    icon: <PiChartLineUp className='w-5 h-5 text-[#c3ebfa]'/>, 
    value: '2,345', 
    username: 'Total Amount' 
  },
];

function FinanceUser() {
   return (
      <div className='grid gap-3 w-[450px] '>
        {userData.map(user => (
          <div key={user.id} className='odd:bg-purple-200 even:bg-amber-200 rounded-xl p-4 shadow-md w-[340px]'>
            <div className='flex justify-between items-center'>
              <span className='text-[10px] bg-white p-2 rounded-full'>
                {user.icon}
              </span>
              <Image 
                src="/3dots.svg" 
                alt="menu" 
                width={25} 
                height={25} 
                className='w-6 h-6'
              />
            </div>
            <h1 className='text-3xl font-semibold my-4'>${user.value}</h1>
            <h2 className='capitalize text-sm font-medium text-gray-500'>{user.username}</h2>
          </div>
        ))}
      </div>
    );
}

export default FinanceUser

