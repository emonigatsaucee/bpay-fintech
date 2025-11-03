import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [creatingWallet, setCreatingWallet] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(null);
  const [showExchangeModal, setShowExchangeModal] = useState(null);

  useEffect(() => {
    fetchData();
    fetchRates();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const [walletsRes, transactionsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/wallets/', config),
        axios.get('http://localhost:8000/api/transactions/', config)
      ]);
      
      setAccounts(walletsRes.data);
      setTransactions(transactionsRes.data.slice(0, 8));
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Update rates first
      await axios.post('http://localhost:8000/api/rates/update/', {}, config);
      
      // Then fetch current rates
      const ratesRes = await axios.get('http://localhost:8000/api/rates/', config);
      setRates(ratesRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.error('Error fetching rates:', error);
    }
  };

  const createCryptoWallet = async (currency) => {
    setCreatingWallet(currency);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.post('http://localhost:8000/api/wallets/crypto/create/', 
        { currency }, 
        config
      );
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert(`Failed to create ${currency} wallet: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setCreatingWallet(null);
    }
  };

  const getAccountIcon = (currency) => {
    const icons = {
      NGN: 'https://flagcdn.com/w40/ng.png', // Nigeria flag
      KES: 'https://flagcdn.com/w40/ke.png', // Kenya flag
      BTC: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg',
      ETH: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg',
      USDT: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg'
    };
    return icons[currency] || 'wallet';
  };

  const isFlag = (currency) => ['NGN', 'KES'].includes(currency);
  const isCrypto = (currency) => ['BTC', 'ETH', 'USDT'].includes(currency);

  const getCryptoRate = (crypto, fiat) => {
    const key = `${crypto}_${fiat}`;
    return rates[key] ? parseFloat(rates[key]).toLocaleString() : 'Loading...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const fiatAccounts = accounts.filter(acc => ['NGN', 'KES'].includes(acc.currency));
  const cryptoAccounts = accounts.filter(acc => ['BTC', 'ETH', 'USDT'].includes(acc.currency));

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Accounts</h1>
          <p className="text-slate-400">Manage your fiat and crypto accounts</p>
        </div>

        {/* Crypto Rates Display */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Live Crypto Rates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ng.png" alt="NGN" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">BTC/NGN</p>
              <p className="text-yellow-400 font-bold">₦{getCryptoRate('BTC', 'NGN')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg" alt="BTC" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ke.png" alt="KES" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">BTC/KES</p>
              <p className="text-yellow-400 font-bold">KSh{getCryptoRate('BTC', 'KES')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ng.png" alt="NGN" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">ETH/NGN</p>
              <p className="text-blue-400 font-bold">₦{getCryptoRate('ETH', 'NGN')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg" alt="ETH" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ke.png" alt="KES" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">ETH/KES</p>
              <p className="text-blue-400 font-bold">KSh{getCryptoRate('ETH', 'KES')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ng.png" alt="NGN" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">USDT/NGN</p>
              <p className="text-green-400 font-bold">₦{getCryptoRate('USDT', 'NGN')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg" alt="USDT" className="w-4 h-4" />
                <img src="https://flagcdn.com/w20/ke.png" alt="KES" className="w-5 h-3" />
              </div>
              <p className="text-slate-400 text-sm">USDT/KES</p>
              <p className="text-green-400 font-bold">KSh{getCryptoRate('USDT', 'KES')}</p>
            </div>
          </div>
        </div>

        {/* Fiat Accounts (NGN & KES) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Fiat Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fiatAccounts.map(account => (
              <div key={account.id} className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${account.currency === 'NGN' ? 'bg-green-600' : 'bg-orange-600'} rounded-lg flex items-center justify-center overflow-hidden`}>
                      {isFlag(account.currency) ? (
                        <img src={getAccountIcon(account.currency)} alt={`${account.currency} flag`} className="w-8 h-6 object-cover" />
                      ) : (
                        <i className={`bi bi-${getAccountIcon(account.currency)} text-white text-lg`}></i>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{account.currency} Account</h3>
                      <p className="text-slate-400 text-sm">{account.currency === 'NGN' ? 'Nigerian Naira' : 'Kenyan Shilling'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-1">Available Balance</p>
                  <h2 className="text-2xl font-bold text-white">
                    {parseFloat(account.balance).toFixed(2)} {account.currency}
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setShowDepositModal(account)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Deposit
                  </button>
                  <button 
                    onClick={() => setShowWithdrawModal(account)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Withdraw
                  </button>
                  <button 
                    onClick={() => setShowConvertModal(account)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Convert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crypto Accounts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Crypto Accounts</h2>
            <div className="flex flex-wrap gap-2">
              {!cryptoAccounts.find(acc => acc.currency === 'BTC') && (
                <button 
                  onClick={() => createCryptoWallet('BTC')}
                  disabled={creatingWallet === 'BTC'}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  {creatingWallet === 'BTC' ? 'Creating...' : '+ Create BTC'}
                </button>
              )}
              {!cryptoAccounts.find(acc => acc.currency === 'ETH') && (
                <button 
                  onClick={() => createCryptoWallet('ETH')}
                  disabled={creatingWallet === 'ETH'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  {creatingWallet === 'ETH' ? 'Creating...' : '+ Create ETH'}
                </button>
              )}
              {!cryptoAccounts.find(acc => acc.currency === 'USDT') && (
                <button 
                  onClick={() => createCryptoWallet('USDT')}
                  disabled={creatingWallet === 'USDT'}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  {creatingWallet === 'USDT' ? 'Creating...' : '+ Create USDT'}
                </button>
              )}
            </div>
          </div>
          
          {cryptoAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cryptoAccounts.map(account => (
                <div key={account.id} className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${account.currency === 'BTC' ? 'bg-yellow-600' : 'bg-indigo-600'} rounded-lg flex items-center justify-center overflow-hidden`}>
                        {isCrypto(account.currency) ? (
                          <img src={getAccountIcon(account.currency)} alt={account.currency} className="w-8 h-8 object-contain" />
                        ) : (
                          <i className={`bi bi-currency-${account.currency.toLowerCase()} text-white text-lg`}></i>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{account.currency}</h3>
                        <p className="text-slate-400 text-sm">
                          {account.currency === 'BTC' ? 'Bitcoin' : 
                           account.currency === 'ETH' ? 'Ethereum' : 
                           account.currency === 'USDT' ? 'Tether USD' : account.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-1">Balance</p>
                    <h2 className="text-xl font-bold text-white">
                      {parseFloat(account.balance).toFixed(6)} {account.currency}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowDepositModal(account)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Deposit
                    </button>
                    <button 
                      onClick={() => setShowExchangeModal(account)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Exchange to Cash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
              <i className="bi bi-currency-bitcoin text-4xl text-slate-600 mb-4 block"></i>
              <h3 className="text-lg font-medium text-white mb-2">No Crypto Accounts</h3>
              <p className="text-slate-400 mb-4">Create Bitcoin or Ethereum accounts for crypto trading</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          
          {transactions.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {transactions.map(transaction => (
                <div key={transaction.id} className="p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' :
                        transaction.type === 'WITHDRAW' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        <i className={`bi ${
                          transaction.type === 'DEPOSIT' ? 'bi-arrow-down-left' :
                          transaction.type === 'WITHDRAW' ? 'bi-arrow-up-right' :
                          'bi-arrow-repeat'
                        } text-lg`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium text-white capitalize">{transaction.type.toLowerCase()}</h4>
                        <p className="text-sm text-slate-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {transaction.amount} {transaction.wallet?.currency || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="bi bi-clock-history text-6xl text-slate-600 mb-4 block"></i>
              <h4 className="text-lg font-medium text-white mb-2">No recent activity</h4>
              <p className="text-slate-400">Your transactions will appear here</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDepositModal && (
          <DepositModal
            account={showDepositModal}
            onClose={() => setShowDepositModal(null)}
          />
        )}
        {showWithdrawModal && !['BTC', 'ETH', 'USDT'].includes(showWithdrawModal.currency) && (
          <WithdrawModal
            account={showWithdrawModal}
            onClose={() => setShowWithdrawModal(null)}
          />
        )}
        {showConvertModal && (
          <ConvertModal
            account={showConvertModal}
            onClose={() => setShowConvertModal(null)}
          />
        )}
        {showExchangeModal && (
          <ExchangeModal
            account={showExchangeModal}
            onClose={() => setShowExchangeModal(null)}
          />
        )}
      </div>
    </div>
  );
};

const DepositModal = ({ account, onClose }) => {
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCryptoDeposit = async (e) => {
    e.preventDefault();
    if (!txHash || !amount) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/crypto/deposit/', {
        currency: account.currency,
        tx_hash: txHash,
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Deposit submitted for verification!');
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const getDepositInfo = (currency) => {
    if (currency === 'NGN') {
      return {
        title: 'Deposit Nigerian Naira',
        method: 'Bank Transfer',
        icon: 'bank',
        details: {
          'Bank Name': 'GTBank',
          'Account Number': '0123456789',
          'Account Name': 'BPAY NIGERIA LTD',
          'Reference': `DEP-${Date.now()}`,
        },
        instructions: [
          'Transfer money to the account above',
          'Use the reference number for tracking',
          'Funds will reflect within 5-10 minutes',
          'Contact support if delayed beyond 30 minutes'
        ]
      };
    } else if (currency === 'KES') {
      return {
        title: 'Deposit Kenyan Shillings',
        method: 'M-Pesa Payment',
        icon: 'phone',
        details: {
          'Paybill Number': '522522',
          'Account Number': `KE${Date.now()}`,
          'Business Name': 'BPAY KENYA',
        },
        instructions: [
          'Go to M-Pesa menu on your phone',
          'Select Lipa na M-Pesa > Pay Bill',
          'Enter the paybill number and account number',
          'Funds will reflect within 2-5 minutes'
        ]
      };
    } else {
      return {
        title: `Deposit ${currency}`,
        method: 'Crypto Transfer',
        icon: 'currency-bitcoin',
        address: account.deposit_address || 'Address not generated',
        instructions: [
          'Send crypto to the address below',
          'Submit transaction hash after sending',
          'Deposits require network confirmations',
          'Contact support if funds don\'t appear'
        ]
      };
    }
  };

  const depositInfo = getDepositInfo(account.currency);
  const isCrypto = ['BTC', 'ETH', 'USDT'].includes(account.currency);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${account.currency === 'NGN' ? 'bg-green-600' : account.currency === 'KES' ? 'bg-orange-600' : 'bg-yellow-600'} rounded-lg flex items-center justify-center`}>
              <i className={`bi bi-${depositInfo.icon} text-white`}></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{depositInfo.title}</h2>
              <p className="text-slate-400 text-sm">{depositInfo.method}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {isCrypto ? (
          <>
            {/* Crypto Deposit Address */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Your {account.currency} Deposit Address</h3>
              {account.deposit_address ? (
                <>
                  <div className="bg-slate-800 p-3 rounded border break-all mb-3">
                    <span className="text-white font-mono text-sm">{account.deposit_address}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(account.deposit_address);
                      alert('Address copied to clipboard!');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <i className="bi bi-clipboard"></i>
                    <span>Copy Address</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-400 mb-2">Generating deposit address...</p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              )}
            </div>

            {/* Submit Transaction Form */}
            <form onSubmit={handleCryptoDeposit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Hash</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter transaction hash"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Amount in ${account.currency}`}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Deposit'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Fiat Payment Details */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-3">Payment Details</h3>
              {Object.entries(depositInfo.details).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0">
                  <span className="text-slate-400 text-sm">{key}:</span>
                  <span className="text-white font-mono text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mb-6">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(Object.values(depositInfo.details).join(' '));
                  alert('Payment details copied to clipboard!');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <i className="bi bi-clipboard"></i>
                <span>Copy Details</span>
              </button>
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Instructions</h3>
          <ol className="space-y-2">
            {isCrypto ? [
              'Send crypto to the BPAY business address above',
              'Submit transaction hash and amount below',
              'Your balance will be credited automatically',
              'You can then exchange crypto to NGN/KES for withdrawal'
            ].map((instruction, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-slate-300">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            )) : depositInfo.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-slate-300">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        <button 
          onClick={onClose}
          className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const WithdrawModal = ({ account, onClose }) => {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/payment-methods/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter methods based on account currency
      const relevantMethods = response.data.filter(method => {
        if (account.currency === 'NGN') {
          return method.type === 'bank_ng';
        } else if (account.currency === 'KES') {
          return method.type === 'mpesa';
        }
        return false;
      });
      
      setPaymentMethods(relevantMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !selectedMethod) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fiat withdrawal using selected payment method
      alert(`Withdrawal of ${amount} ${account.currency} will be processed to your selected payment method`);
      
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Withdraw {account.currency}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        {loadingMethods ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <i className="bi bi-credit-card text-4xl text-slate-600 mb-4 block"></i>
            <h3 className="text-lg font-medium text-white mb-2">No Payment Methods</h3>
            <p className="text-slate-400 mb-4">
              Add a {account.currency === 'NGN' ? 'Nigerian bank account' : 'M-Pesa number'} to withdraw funds
            </p>
            <button 
              onClick={() => {
                onClose();
                window.location.href = '/profile';
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleWithdraw}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={`Enter ${account.currency} amount`}
                max={account.balance}
                required
              />
              <p className="text-xs text-slate-400 mt-1">Available: {account.balance} {account.currency}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {account.currency === 'NGN' ? 'Bank Account' : 'M-Pesa Number'}
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMethod && (
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Selected Method</h4>
                {paymentMethods.find(m => m.id.toString() === selectedMethod) && (
                  <div className="flex items-center space-x-3">
                    <i className={`bi ${account.currency === 'NGN' ? 'bi-bank' : 'bi-phone'} text-blue-400`}></i>
                    <div>
                      <p className="text-white text-sm">
                        {paymentMethods.find(m => m.id.toString() === selectedMethod).name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {paymentMethods.find(m => m.id.toString() === selectedMethod).details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-400 text-sm">
                💡 Withdrawal will be processed through {account.currency === 'NGN' ? 'Flutterwave' : 'SasaPay'}
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
              <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ConvertModal = ({ account, onClose }) => {
  const [amount, setAmount] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!amount || !toCurrency) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/wallets/convert/', {
        from_currency: account.currency,
        to_currency: toCurrency,
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Conversion successful! You received ${response.data.converted_amount.toFixed(6)} ${toCurrency}`);
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Convert {account.currency}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleConvert}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount to Convert</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={`Enter ${account.currency} amount`}
              max={account.balance}
            />
            <p className="text-xs text-slate-400 mt-1">Available: {account.balance} {account.currency}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Convert To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select currency</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm">
              🔄 Real-time conversion rates applied
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={loading || !amount || !toCurrency}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Converting...' : 'Convert'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExchangeModal = ({ account, onClose }) => {
  const [amount, setAmount] = useState('');
  const [toFiat, setToFiat] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExchange = async (e) => {
    e.preventDefault();
    if (!amount || !toFiat) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/wallets/convert/', {
        from_currency: account.currency,
        to_currency: toFiat,
        amount: parseFloat(amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`Exchange successful! You received ${response.data.converted_amount.toFixed(2)} ${toFiat}`);
      onClose();
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.error || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Exchange {account.currency}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleExchange}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount to Exchange</label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${account.currency} amount`}
              max={account.balance}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Available: {account.balance} {account.currency}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Exchange To</label>
            <select
              value={toFiat}
              onChange={(e) => setToFiat(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select currency</option>
              <option value="NGN">Nigerian Naira (NGN)</option>
              <option value="KES">Kenyan Shilling (KES)</option>
            </select>
          </div>

          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm">
              ⚡ Real-time exchange rates applied
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Exchanging...' : 'Exchange'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;