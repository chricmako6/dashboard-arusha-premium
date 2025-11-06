import React from 'react';
import Image from 'next/image';

const userData = [
  { id: 1, year: '2024/25', value: '1,234', username: 'Parent' },
  { id: 2, year: '2024/25', value: '1,679', username: 'Teacher' },
  { id: 3, year: '2024/25', value: '1,890', username: 'Student' },
  { id: 4, year: '2024/25', value: '1,345', username: 'Staff' },
];

function UserCard() {
  return (
    <div className='flex flex-wrap gap-4 w-full'>
      {userData.map(user => (
        <div key={user.id} className='odd:bg-purple-200 even:bg-amber-200 rounded-xl p-4 shadow-md flex-1'>
          <div className='flex justify-between items-center'>
            <span className='text-[10px] bg-white px-2 py-1 rounded-full'>
              {user.year}
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

export default UserCard;
