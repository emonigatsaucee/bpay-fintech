import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await axios.get('${API_BASE_URL}/wallets/');
      setWallets(response.data);
    } catch (error) {
      toast.error('Failed to fetch wallets');
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async (currency) => {
    try {
      await axios.post('${API_BASE_URL}/wallets/', { currency });
      toast.success(`${currency} wallet created successfully`);
      fetchWallets();
    } catch (error) {
      toast.error('Failed to create wallet');
    }
  };

  const handleTransfer = async (formData) => {
    try {
      await axios.post(`${API_BASE_URL}/wallets/${selectedWallet.id}/transfer/`, formData);
      toast.success('Transfer successful');
      setShowTransferModal(false);
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    }
  };

  const handleDeposit = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallets/${selectedWallet.id}/deposit/`, formData);
      
      if (response.data.payment_url) {
        window.open(response.data.payment_url, '_blank');
      } else {
        toast.success(response.data.message || 'Deposit initiated');
      }
      
      setShowDepositModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Deposit failed');
    }
  };

  const handleWithdraw = async (formData) => {
    try {
      await axios.post(`${API_BASE_URL}/wallets/${selectedWallet.id}/withdraw/`, formData);
      toast.success('Withdrawal initiated');
      setShowWithdrawModal(false);
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Withdrawal failed');
    }
  };

  const handleConvert = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallets/${selectedWallet.id}/convert/`, formData);
      toast.success(`Converted to ${response.data.converted_amount} ${formData.to_currency}`);
      setShowConvertModal(false);
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Conversion failed');
    }
  };

  const availableCurrencies = ['NGN', 'KES', 'BTC', 'ETH'];
  const existingCurrencies = wallets.map(w => w.currency);
  const newCurrencies = availableCurrencies.filter(c => !existingCurrencies.includes(c));

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Wallets</h1>
        
        {newCurrencies.length > 0 && (
          <div className="space-x-2">
            {newCurrencies.map(currency => (
              <button
                key={currency}
                onClick={() => createWallet(currency)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create {currency} Wallet
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map(wallet => (
          <div key={wallet.id} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{wallet.currency} Wallet</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {parseFloat(wallet.balance).toFixed(wallet.currency.includes('BTC') || wallet.currency.includes('ETH') ? 8 : 2)}
                </p>
                <p className="text-sm text-gray-500">{wallet.currency}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedWallet(wallet);
                  setShowTransferModal(true);
                }}
                className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setSelectedWallet(wallet);
                  setShowDepositModal(true);
                }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Deposit
              </button>
              <button
                onClick={() => {
                  setSelectedWallet(wallet);
                  setShowWithdrawModal(true);
                }}
                className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
              >
                Withdraw
              </button>
              <button
                onClick={() => {
                  setSelectedWallet(wallet);
                  setShowConvertModal(true);
                }}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
              >
                Convert
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <TransferModal
          wallet={selectedWallet}
          onClose={() => setShowTransferModal(false)}
          onSubmit={handleTransfer}
        />
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          wallet={selectedWallet}
          onClose={() => setShowDepositModal(false)}
          onSubmit={handleDeposit}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          wallet={selectedWallet}
          onClose={() => setShowWithdrawModal(false)}
          onSubmit={handleWithdraw}
        />
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <ConvertModal
          wallet={selectedWallet}
          onClose={() => setShowConvertModal(false)}
          onSubmit={handleConvert}
          availableCurrencies={availableCurrencies.filter(c => c !== selectedWallet?.currency)}
        />
      )}
    </div>
  );
};

// Modal Components
const TransferModal = ({ wallet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ recipient_email: '', amount: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Send {wallet.currency}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Recipient Email</label>
            <input
              type="email"
              value={formData.recipient_email}
              onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Send
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DepositModal = ({ wallet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ amount: '', phone_number: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Deposit {wallet.currency}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {wallet.currency === 'KES' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="254XXXXXXXXX"
                required
              />
            </div>
          )}
          <div className="flex space-x-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Deposit
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WithdrawModal = ({ wallet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ 
    amount: '', 
    phone_number: '', 
    bank_account: { bank_code: '', account_number: '', account_name: '' }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Withdraw {wallet.currency}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          {wallet.currency === 'KES' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="254XXXXXXXXX"
                required
              />
            </div>
          )}
          
          {wallet.currency === 'NGN' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Bank Code</label>
                <input
                  type="text"
                  value={formData.bank_account.bank_code}
                  onChange={(e) => setFormData({
                    ...formData, 
                    bank_account: {...formData.bank_account, bank_code: e.target.value}
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.bank_account.account_number}
                  onChange={(e) => setFormData({
                    ...formData, 
                    bank_account: {...formData.bank_account, account_number: e.target.value}
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Account Name</label>
                <input
                  type="text"
                  value={formData.bank_account.account_name}
                  onChange={(e) => setFormData({
                    ...formData, 
                    bank_account: {...formData.bank_account, account_name: e.target.value}
                  })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-2">
            <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              Withdraw
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConvertModal = ({ wallet, onClose, onSubmit, availableCurrencies }) => {
  const [formData, setFormData] = useState({ amount: '', to_currency: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Convert {wallet.currency}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Convert To</label>
            <select
              value={formData.to_currency}
              onChange={(e) => setFormData({...formData, to_currency: e.target.value})}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Currency</option>
              {availableCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Convert
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Wallets;
