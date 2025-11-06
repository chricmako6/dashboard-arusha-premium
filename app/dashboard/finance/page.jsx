import FinanceCard from '@/components/FinanceCard'
import FinanceTable from '@/components/FinanceTable'
import FinanceUser from '@/components/FinanceUser'
import React from 'react'


function pageFinance() {
  return (
    <>    
    <div className='flex gap-4 p-4 mt-3'>
      <div className='w-full h-[200px]'>
        <FinanceCard />
      </div>
        <FinanceUser />
    </div>
     <div className="">
        <FinanceTable />
      </div>
    </>
  )
}

export default pageFinance