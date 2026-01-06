import React from "react";
import { FiClock } from "react-icons/fi";

function Approvalwait() {
  return (
       <div className="bg-[#0f0f1a] overflow-hidden border border-white/10 rounded-2xl shadow-2xl w-full h-full p-8 text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center animate-spin">
          <FiClock className="text-yellow-400 text-4xl" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Verification in Progress
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Your information has been successfully submitted and is now under
          review.<br/> After submission, your verification status will be updated to "Pending Approval."<br/>
           You'll need to wait for admin approval.
        </p>
      </div>
   
  )
}

export default Approvalwait;