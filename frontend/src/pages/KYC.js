import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const KYC = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get('http://localhost:8000/api/kyc/', config);
      setDocuments(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/kyc/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      toast.error('Failed to upload document');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        <i className={`bi bi-${status === 'PENDING' ? 'clock' : status === 'APPROVED' ? 'check-circle' : 'x-circle'} mr-1`}></i>
        {status}
      </span>
    );
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      'National ID': 'person-badge',
      'Passport': 'passport',
      'Driver License': 'car-front',
      'Utility Bill': 'receipt',
      'Bank Statement': 'bank',
      'Other': 'file-earmark'
    };
    return icons[docType] || 'file-earmark';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">KYC Verification</h1>
            <p className="text-slate-400">Upload your identity documents for account verification</p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
          >
            <i className="bi bi-cloud-upload"></i>
            <span>Upload Document</span>
          </button>
        </div>

        {/* KYC Status Overview */}
        {documents.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Verification Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {documents.filter(d => d.status === 'PENDING').length}
                </div>
                <div className="text-slate-400 text-sm">Pending Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {documents.filter(d => d.status === 'APPROVED').length}
                </div>
                <div className="text-slate-400 text-sm">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {documents.filter(d => d.status === 'REJECTED').length}
                </div>
                <div className="text-slate-400 text-sm">Rejected</div>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
          {documents.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {doc.document ? (
                          <img
                            className="w-full h-full object-cover"
                            src={`http://localhost:8000${doc.document}`}
                            alt={doc.doc_type}
                          />
                        ) : (
                          <i className={`bi bi-${getDocumentIcon(doc.doc_type)} text-slate-400 text-xl`}></i>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-white">{doc.doc_type}</h4>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-slate-400">
                          Uploaded: {new Date(doc.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {doc.reviewed_at && (
                          <p className="text-sm text-slate-400">
                            Reviewed: {new Date(doc.reviewed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {doc.document && (
                        <a
                          href={`http://localhost:8000${doc.document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          <i className="bi bi-eye text-lg"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="bi bi-shield-check text-6xl text-slate-600 mb-4 block"></i>
              <h3 className="text-lg font-medium text-white mb-2">No documents uploaded</h3>
              <p className="text-slate-400 mb-6">Upload your identity documents to verify your account</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Upload Your First Document
              </button>
            </div>
          )}
        </div>

        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSubmit={handleUpload}
          />
        )}
      </div>
    </div>
  );
};

const UploadModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    doc_type: '',
    document: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('doc_type', formData.doc_type);
    data.append('document', formData.document);
    
    onSubmit(data);
  };

  const handleFileChange = (file) => {
    setFormData({...formData, document: file});
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const documentTypes = [
    'National ID',
    'Passport', 
    'Driver License',
    'Utility Bill',
    'Bank Statement',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Upload KYC Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
            <select
              value={formData.doc_type}
              onChange={(e) => setFormData({...formData, doc_type: e.target.value})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Document File</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded mx-auto" />
                  <p className="text-sm text-slate-300">{formData.document?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <i className="bi bi-cloud-upload text-3xl text-slate-400"></i>
                  <p className="text-slate-300">Drop your file here or click to browse</p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="sr-only">Choose file</span>
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all"
            >
              Upload Document
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KYC;