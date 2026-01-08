import React from 'react'

import ProCard1 from '@/components/ui02/proCard1';
import ProAccount from '@/components/ui02/proAccount';
import ProDoc from '@/components/ui02/proDoc';
import ProPay from '@/components/ui02/proPay';

function pageProfile() {
  return (
    <div className='bg-white mb-10 rounded-md p-6 mt-4 shadow-md w-[98%] mx-auto'>
      <h2 className='text-lg font-semibold'>Profile Page</h2>
      <div className='flex flex-row gap-4 my-4'>
        {/* Profile content goes here */}
        <div className="w-1/2 h-96">
          <ProCard1/>
        </div>
        <div className="w-2/3 h-auto">
          <ProAccount/>
          <ProDoc/>
        </div>
        <div className="w-1/2 h-96">
          <ProPay/>
        </div>
      </div>
    </div>
  )
}
export default pageProfile;