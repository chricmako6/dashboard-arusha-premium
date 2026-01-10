import React,{useState} from 'react'
import { FiEdit, FiEye } from 'react-icons/fi'

function ProDoc({ profileData, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [viewingImage, setViewingImage] = useState(null)
  return (
    <div className='bg-gray-100 rounded-md p-4 shadow-xl '>
      <div className='flex flex-row justify-between items-center'>
          <h2 className='font-bold'>Document Information</h2>
            <button 
              onClick={() => onEdit ? onEdit() : setIsEditing(!isEditing)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiEdit className='w-5 h-5 text-gray-500 cursor-pointer'/> 
            </button>
      </div>

      <div className='mt-4'>
          <div className='flex gap-4'>
            <p className='text-sm text-gray-600 mb-2 font-bold'>{profileData?.doctype || "Not uploaded"}
              <span className='font-bold text-gray-500 flex flex-col'>
                {profileData?.passport ? (
                  <span className="relative">
                    <img
                      src={profileData.passport}
                      alt="ID/Passport"
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => setViewingImage(profileData.passport)}
                    />
                    <button 
                      onClick={() => setViewingImage(profileData.passport)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded"
                    >
                      <FiEye size={16} />
                    </button>
                  </span>
                ) : (
                <span className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No document uploaded</span>
                </span>
              )}
              </span>
            </p>
          </div>
          <p className='text-sm text-gray-600 mb-2'>TIN Number
            <span className='font-bold text-gray-500 float-end'>
               {profileData?.tin || "Not provided"}
            </span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>NIDA
            <span className='font-bold text-gray-500 float-end'>
              {profileData?.nida || "Not provided"}
            </span>
          </p>
          <p className='text-sm text-gray-600 mb-2'>Education Level
            <span className='font-bold text-gray-500 float-end'>
               {profileData?.education || "Not specified"}
            </span>
          </p>
        </div>

          {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={viewingImage}
              alt="Viewing document"
              className="max-w-full max-h-screen"
            />
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProDoc