import React, {useState} from 'react'
import { FiEdit, FiEye, FiFileText } from 'react-icons/fi'
import { IoMdCloseCircle } from 'react-icons/io'
import { IoDocumentAttachOutline } from 'react-icons/io5'

function ProDoc({ profileData, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [viewingDocument, setViewingDocument] = useState(null)
  
  // Helper function to determine if it's an image
  const isImage = (data) => {
    if (!data) return false
    return typeof data === 'string' && (
      data.startsWith('data:image/') || 
      data.startsWith('http') ||
      data.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
    )
  }

  // Helper function to get document type label
  const getDocumentTypeLabel = (type) => {
    switch(type) {
      case 'id or passport': return 'ID or Passport'
      case 'proof address': return 'Proof of Address'
      default: return type || 'Document'
    }
  }

  // Helper function to check if it's a PDF
  const isPDF = (data) => {
    if (!data) return false
    return typeof data === 'string' && (
      data.startsWith('data:application/pdf') ||
      data.toLowerCase().endsWith('.pdf')
    )
  }

  // Helper function to display document content
  const renderDocumentContent = (documentData) => {
    if (!documentData) return null;
    
    if (isImage(documentData)) {
      // For images - display full size image
      return (
        <div className="flex items-center justify-center">
          <img
            src={documentData}
            alt="Document Preview"
            className="w-full h-[500px] object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E";
            }}
          />
        </div>
      );
    } else if (isPDF(documentData)) {
      // For PDFs - display PDF viewer
      return (
        <div className="w-full h-[75vh]">
          <iframe 
            src={documentData} 
            className="w-full h-full border-0"
            title="PDF Document"
            allow="fullscreen"
          />
        </div>
      );
    } else if (typeof documentData === 'string') {
      // For other base64 documents - try to create blob and display
      try {
        // Extract MIME type from data URL
        const mimeMatch = documentData.match(/^data:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        
        // Extract base64 data
        const base64Data = documentData.split(',')[1];
        const binaryData = atob(base64Data);
        
        // Create blob URL
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }
        const blob = new Blob([uint8Array], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Check if it's an image (but not caught by isImage function)
        if (mimeType.startsWith('image/')) {
          return (
            <div className="flex items-center justify-center">
              <img
                src={blobUrl}
                alt="Document Preview"
                className="max-w-full max-h-[70vh] object-contain"
                onLoad={() => URL.revokeObjectURL(blobUrl)}
                onError={(e) => {
                  URL.revokeObjectURL(blobUrl);
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
            </div>
          );
        }
        
        // For other document types, provide download option
        return (
          <div className="text-center py-8">
            <IoDocumentAttachOutline className="w-24 h-24 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Document Preview</p>
            <p className="text-gray-600 mt-2">
              {getDocumentTypeLabel(profileData?.doctype)}
            </p>
            <div className="mt-6">
              <a
                href={blobUrl}
                download={`document.${mimeType.split('/')[1] || 'file'}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={() => URL.revokeObjectURL(blobUrl)}
              >
                <FiFileText className="mr-2" />
                Download Document ({mimeType})
              </a>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Error processing document:', error);
        return (
          <div className="text-center py-8">
            <IoDocumentAttachOutline className="w-24 h-24 text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Document Preview</p>
            <p className="text-gray-600 mt-2">
              {getDocumentTypeLabel(profileData?.doctype)}
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Raw document data:</p>
              <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                {documentData.substring(0, 200)}...
              </pre>
            </div>
          </div>
        );
      }
    }
    
    // Fallback for any other type
    return (
      <div className="text-center py-8">
        <IoDocumentAttachOutline className="w-24 h-24 text-blue-400 mx-auto mb-4" />
        <p className="text-gray-600">Document content not available</p>
      </div>
    );
  };

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
        {/* Document Type with Preview */}
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2 font-bold'>
            {getDocumentTypeLabel(profileData?.doctype) || "Document Type"}
          </p>
          
          {profileData?.proofAddress ? (
            <div className="relative w-full">
              {isImage(profileData.proofAddress) || isPDF(profileData.proofAddress) ? (
                // Display as Image or PDF preview
                <div className="relative">
                  <div className="w-full h-48 bg-white border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
                    onClick={() => setViewingDocument(profileData.proofAddress)}
                  >
                    {isImage(profileData.proofAddress) ? (
                      <img
                        src={profileData.proofAddress}
                        alt={getDocumentTypeLabel(profileData.doctype)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center p-4">
                        <IoDocumentAttachOutline className="w-20 h-20 text-red-500 mb-2" />
                        <p className="text-sm font-medium text-gray-700">PDF Document</p>
                        <p className="text-xs text-gray-500">Click to view</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Display as Document (non-image, non-PDF)
                <div 
                  className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:from-blue-100 hover:to-blue-200 transition"
                  onClick={() => setViewingDocument(profileData.proofAddress)}
                >
                  <IoDocumentAttachOutline className="w-16 h-16 text-blue-500 mb-3" />
                  <p className="text-gray-700 font-medium">
                    {getDocumentTypeLabel(profileData.doctype)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to view document
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewingDocument(profileData.proofAddress)
                    }}
                    className="mt-3 flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiEye size={16} />
                    <span className="text-sm">Preview</span>
                  </button>
                </div>
              )}
              
              {/* Document Type Label */}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {getDocumentTypeLabel(profileData.doctype)}
                </span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  ✓ Uploaded
                </span>
              </div>
            </div>
          ) : (
            // No document uploaded
            <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
              <FiFileText className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500">No document uploaded</p>
              <p className="text-xs text-gray-400 mt-1">
                {profileData?.doctype ? getDocumentTypeLabel(profileData.doctype) : 'Document'}
              </p>
            </div>
          )}
        </div>

        {/* Other Document Information */}
        <div className='space-y-3'>
          <div className='flex justify-between items-center'>
            <p className='text-sm text-gray-600'>TIN Number</p>
            <span className='font-medium text-gray-800'>
              {profileData?.tin || "Not provided"}
            </span>
          </div>
          
          <div className='flex justify-between items-center'>
            <p className='text-sm text-gray-600'>NIDA</p>
            <span className='font-medium text-gray-800'>
              {profileData?.nida || "Not provided"}
            </span>
          </div>
          
          <div className='flex justify-between items-center'>
            <p className='text-sm text-gray-600'>Education Level</p>
            <span className='font-medium text-gray-800'>
              {profileData?.education || "Not specified"}
            </span>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div 
          className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div 
            className="relative w-[450px] h-[90vh] bg-white shadow-2xl shadow-gray-100 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-[#0f0f1a] text-gray-200">
              <h3 className="font-medium">
                {getDocumentTypeLabel(profileData?.doctype)} - Preview
              </h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-2xl cursor-pointer hover:text-gray-400 text-gray-200 font-bold"
              >
                <IoMdCloseCircle />
              </button>
            </div>
            
            {/* Content - Full document display */}
            <div className="overflow-auto h-[500px] bg-[#0f0f1a]">
              {renderDocumentContent(viewingDocument)}
            </div>
           
          </div>
        </div>
      )}
    </div>
  )
}

export default ProDoc