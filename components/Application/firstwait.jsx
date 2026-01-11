import React from 'react'
import { FiClock } from 'react-icons/fi'

function Firstwait() {
  return (
    <div className='fixed inset-0 z-50 backdrop-blur-xl'>
     <div className="fixed top-48 left-1/2 transform -translate-x-1/2 z-9999 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0f0f1a] overflow-hidden border border-white/10 rounded-2xl shadow-2xl w-full h-full p-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center animate-spin">
                <FiClock className="text-yellow-400 text-4xl" />
            </div>
    
            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
                Just a Moment...
            </h2>
    
            {/* Description */}
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
             We are processing your information. Please wait while we verify your details. 
             This should only take a few moments.
            </p>
          </div>
     </div>
    </div>
  )
}

export default Firstwait