import React from 'react'
import UserCard from '@/components/ui/UserCard'
import CountChart from '@/components/ui/CountChart'
import AttendanceChart from '@/components/ui/AttendanceChart'
import FinanceChart from '@/components/ui/FinanceChart'
import EventCalendar from '@/components/ui/EventCalendar'
import Announcement from '@/components/ui/Announcement'

export default function MainDashboard() {
  return (
    <div className='flex md:flex-row flex-col gap-4 p-4'>
      {/* LEFT */}
       <div className='w-full lg:w-2/3 col-span-2'>
        {/* USER CARD */}
        <div className='flex justify-between gap-4'>
          <UserCard/>
        </div>

        {/* MIDDLE CHART */}
          <div className="flex gap-4 flex-col lg:flex-row mt-10">
            {/* COUNT CHART */}
            <div className='w-full lg:w-1/3 h-[450px] '>
              <CountChart/>
            </div>
            {/* ATTENDANCE CHART */}
            <div className='w-full'>
              <AttendanceChart/>
            </div>
          </div>

        {/* BOTTOM CHART */}
          <div className="w-full h-[500px] mt-10">
            <FinanceChart/>
          </div>
       </div>
       {/* RIGHT */}
       <div className='w-full lg:w-1/3 flex-col gap-8'>
         <EventCalendar/>
         <Announcement />
       </div>
    </div>
  )
}
