import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [kycRes, userRes, paymentRes] = await Promise.all([
        axios.get('${API_BASE_URL}/kyc/', config),
        axios.get('${API_BASE_URL}/user/profile/', config).catch(() => ({ data: {} })),
        axios.get('${API_BASE_URL}/payment-methods/', config).catch(() => ({ data: [] }))
      ]);
      
      setUser(userRes.data);
      setPaymentMethods(paymentRes.data);
      if (kycRes.data.length > 0) {
        setKycStatus(kycRes.data[0].status);
      } else {
        setKycStatus('NOT_SUBMITTED');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-slate-400">Manage your account, verification, and payment methods</p>
        </div>

        {/* Verification Status Banner */}
        {kycStatus && (
          <div className={`rounded-xl p-4 mb-8 border ${
            kycStatus === 'APPROVED' 
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : kycStatus === 'REJECTED'
              ? 'bg-red-900/20 border-red-500/30 text-red-400'
              : kycStatus === 'PENDING'
              ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
              : 'bg-slate-900/20 border-slate-500/30 text-slate-400'
          }`}>
            <div className="flex items-center space-x-3">
              <i className={`bi ${
                kycStatus === 'APPROVED' ? 'bi-shield-check' : 
                kycStatus === 'REJECTED' ? 'bi-shield-x' : 
                kycStatus === 'PENDING' ? 'bi-shield-exclamation' : 'bi-shield'
              } text-xl`}></i>
              <div>
                <h3 className="font-medium">
                  {kycStatus === 'APPROVED' ? 'Account Verified' : 
                   kycStatus === 'REJECTED' ? 'Verification Failed' : 
                   kycStatus === 'PENDING' ? 'Document Under Review' :
                   'Account Not Verified'}
                </h3>
                <p className="text-sm opacity-80">
                  {kycStatus === 'APPROVED' ? 'Full access to all features' : 
                   kycStatus === 'REJECTED' ? 'Please resubmit your documents' : 
                   kycStatus === 'PENDING' ? 'Your document is being reviewed' :
                   'Upload your ID to verify your account and increase limits'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-slate-800 p-1 rounded-lg">
          {[
            { id: 'profile', label: 'Profile', icon: 'person' },
            { id: 'kyc', label: 'Verification', icon: 'shield-check' },
            { id: 'payments', label: 'Payment Methods', icon: 'credit-card' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <i className={`bi bi-${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {activeTab === 'profile' && <ProfileTab user={user} setUser={setUser} />}
          {activeTab === 'kyc' && <KYCTab kycStatus={kycStatus} onUpdate={fetchUserData} />}
          {activeTab === 'payments' && <PaymentMethodsTab methods={paymentMethods} onUpdate={fetchUserData} />}
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ user, setUser }) => {
  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('${API_BASE_URL}/user/profile/update/', {
        full_name: user?.full_name
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      // Refresh profile data
      window.location.reload();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Account Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name (as on documents)</label>
          <input
            type="text"
            value={user?.full_name || ''}
            onChange={(e) => setUser({...user, full_name: e.target.value})}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name as it appears on your ID"
          />
        </div>
      </div>
      
      <button
        onClick={updateProfile}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Update Profile
      </button>

      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Account Limits</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Daily Transaction Limit:</span>
            <span className="text-white">${user?.daily_limit || 100} {user?.is_verified ? '(Verified)' : '(Unverified)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Monthly Limit:</span>
            <span className="text-white">${user?.monthly_limit || 1000} {user?.is_verified ? '(Verified)' : '(Unverified)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const KYCTab = ({ kycStatus, onUpdate }) => {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [country, setCountry] = useState('');

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    // Validation based on document type
    if (docType === 'passport') {
      if (!frontFile) {
        alert('Please upload passport document');
        return;
      }
    } else if (docType === 'national_id' || docType === 'drivers_license') {
      if (!frontFile || !backFile) {
        alert('Please upload both front and back of the document');
        return;
      }
    } else {
      alert('Please select document type');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', frontFile);
      if (backFile) {
        formData.append('document_back', backFile);
      }
      formData.append('doc_type', docType);
      formData.append('country', country);

      const token = localStorage.getItem('token');

      const response = await axios.post('${API_BASE_URL}/kyc/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success message with next steps
      alert('Document uploaded successfully! Your document is being analyzed. You will be notified once verification is complete.');
      
      // Reset form
      setFrontFile(null);
      setBackFile(null);
      setDocType('');
      setCountry('');
      
      // Refresh data to show new status
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      alert('Upload failed: ' + JSON.stringify(error.response?.data || error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Identity Verification</h2>
      
      {kycStatus === 'PENDING' && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
            <div>
              <h3 className="text-yellow-400 font-medium">Document Under Review</h3>
              <p className="text-yellow-300 text-sm">Your document is being analyzed. This typically takes 2-5 minutes for automatic verification, or up to 24 hours if manual review is required.</p>
            </div>
          </div>
        </div>
      )}
      
      {kycStatus === 'REJECTED' && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <i className="bi bi-x-circle text-red-400 text-xl"></i>
            <div>
              <h3 className="text-red-400 font-medium">Verification Failed</h3>
              <p className="text-red-300 text-sm">Please upload a clearer document or contact support.</p>
            </div>
          </div>
        </div>
      )}
      
      {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setCountry('NG')}
                className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                  country === 'NG' 
                    ? 'border-blue-500 bg-blue-600/20' 
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <img src="https://flagcdn.com/w40/ng.png" alt="Nigeria" className="w-8 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setCountry('KE')}
                className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                  country === 'KE' 
                    ? 'border-blue-500 bg-blue-600/20' 
                    : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                }`}
              >
                <img src="https://flagcdn.com/w40/ke.png" alt="Kenya" className="w-8 h-6" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              required
            >
              <option value="">Select Document</option>
              <option value="passport">Passport</option>
              <option value="national_id">National ID</option>
              <option value="drivers_license">Driver's License</option>
            </select>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {docType === 'passport' ? 'Upload Passport' : 'Upload Front Side'}
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFrontFile(e.target.files[0])}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            
            {(docType === 'national_id' || docType === 'drivers_license') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload Back Side</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setBackFile(e.target.files[0])}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}

      <div className="bg-slate-900 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">Verification Benefits</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-center space-x-2">
            <i className="bi bi-check-circle text-green-400"></i>
            <span>Increased daily limit to $10,000</span>
          </li>
          <li className="flex items-center space-x-2">
            <i className="bi bi-check-circle text-green-400"></i>
            <span>Access to all crypto features</span>
          </li>
          <li className="flex items-center space-x-2">
            <i className="bi bi-check-circle text-green-400"></i>
            <span>Priority customer support</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

const PaymentMethodsTab = ({ methods, onUpdate }) => {
  const [showAddMethod, setShowAddMethod] = useState(false);

  const addPaymentMethod = async (methodData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('${API_BASE_URL}/payment-methods/', methodData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddMethod(false);
      onUpdate(); // Refresh data
    } catch (error) {
      console.error('Error adding payment method:', error);
      alert('Failed to add payment method');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Payment Methods</h2>
        <button
          onClick={() => setShowAddMethod(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Method
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-8">
          <i className="bi bi-credit-card text-4xl text-slate-600 mb-4 block"></i>
          <h3 className="text-lg font-medium text-white mb-2">No Payment Methods</h3>
          <p className="text-slate-400">Add bank accounts or mobile money for easy deposits and withdrawals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="bg-slate-900 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className={`bi ${method.type === 'bank_ng' ? 'bi-bank' : 'bi-phone'} text-blue-400 text-xl`}></i>
                <div>
                  <h4 className="text-white font-medium">{method.name}</h4>
                  <p className="text-slate-400 text-sm">{method.details}</p>
                </div>
              </div>
              <button className="text-red-400 hover:text-red-300">
                <i className="bi bi-trash"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddMethod && (
        <AddPaymentMethodModal
          onClose={() => setShowAddMethod(false)}
          onAdd={addPaymentMethod}
        />
      )}
    </div>
  );
};

const AddPaymentMethodModal = ({ onClose, onAdd }) => {
  const [type, setType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');

  const handleSubmit = () => {
    if (!type) {
      alert('Please select payment method type');
      return;
    }

    let methodData = { type };

    if (type === 'bank_ng') {
      if (!accountNumber || !bankName) {
        alert('Please fill in all bank details');
        return;
      }
      methodData.name = `${bankName} - ${accountNumber.slice(-4)}`;
      methodData.details = `${accountNumber} (${bankName})`;
    } else if (type === 'mpesa') {
      if (!mpesaNumber) {
        alert('Please enter M-Pesa number');
        return;
      }
      methodData.name = `M-Pesa - ${mpesaNumber.slice(-4)}`;
      methodData.details = mpesaNumber;
    }

    onAdd(methodData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Payment Method</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              <option value="">Select Type</option>
              <option value="bank_ng">Nigerian Bank Account</option>
              <option value="mpesa">M-Pesa (Kenya)</option>
            </select>
          </div>

          {type === 'bank_ng' && (
            <>
              <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
              <input
                type="text"
                placeholder="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
              />
            </>
          )}

          {type === 'mpesa' && (
            <input
              type="text"
              placeholder="M-Pesa Number (+254...)"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            />
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Add Method
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
