import React from 'react';
import Image from 'next/image';
import { FaUserLargeSlash } from 'react-icons/fa6';
import { FaUser } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { GrValidate } from "react-icons/gr";


function UsersCard({ userStats }) {
  const defaultStats = {
    active: 0,
    suspended: 0,
    admin: 0,
    total: 0
  };

  const stats = userStats || defaultStats;
    const userData = [
    { 
      id: 1, 
      action: <GrValidate className='w-8 h-8 text-gray-500'/>, 
      value: stats.active.toString(), 
      username: 'Active' 
    },
    { 
      id: 2, 
      action: <FaUserLargeSlash className='w-8 h-8 text-gray-500'/>, 
      value: stats.suspended.toString(), 
      username: 'Suspended' 
    },
    { 
      id: 3, 
      action: <MdAdminPanelSettings className='w-8 h-8 text-gray-500'/>, 
      value: stats.admin.toString(), 
      username: 'Admin' 
    },
    { 
      id: 4, 
      action: <FaUser className='w-8 h-8 text-gray-500'/>, 
      value: stats.total.toString(), 
      username: 'Total Users' 
    },
  ];
  return (
    <div className='flex flex-wrap gap-4 w-full'>
      {userData.map(user => (
        <div key={user.id} className='odd:bg-purple-200 even:bg-amber-200 rounded-xl p-4 shadow-md flex-1'>
          <div className='flex justify-between items-center'>
            <span className='text-[10px] bg-white p-2 items-center rounded-full'>
              {user.action}
            </span>
            <Image 
              src="/3dots.svg" 
              alt="menu" 
              width={25} 
              height={25} 
              className='w-6 h-6'
            />
          </div>
          <h1 className='text-2xl font-semibold my-4'>{user.value}</h1>
          <h2 className='capitalize text-sm font-medium text-gray-500'>{user.username}</h2>
        </div>
      ))}
    </div>
  );
}

export default UsersCard;
