import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get('${API_BASE_URL}/transactions/', config);
      setTransactions(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'ALL') return true;
    return transaction.type === filter;
  });

  const getTransactionIcon = (type) => {
    const icons = {
      DEPOSIT: 'arrow-down-left',
      WITHDRAW: 'arrow-up-right', 
      TRANSFER: 'arrow-left-right',
      CONVERT: 'arrow-repeat'
    };
    return icons[type] || 'circle';
  };

  const getTransactionColor = (type) => {
    const colors = {
      DEPOSIT: 'bg-green-500/20 text-green-400',
      WITHDRAW: 'bg-red-500/20 text-red-400',
      TRANSFER: 'bg-blue-500/20 text-blue-400',
      CONVERT: 'bg-purple-500/20 text-purple-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
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
            <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-slate-400">Track all your wallet activities</p>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Transactions</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAW">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
            <option value="CONVERT">Conversions</option>
          </select>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionColor(transaction.type)}`}>
                        <i className={`bi bi-${getTransactionIcon(transaction.type)} text-lg`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white capitalize">
                            {transaction.type.toLowerCase()}
                          </h4>
                          {transaction.counterparty && (
                            <span className="text-slate-400 text-sm">
                              • {transaction.counterparty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                        {parseFloat(transaction.amount).toFixed(
                          ['BTC', 'ETH'].includes(transaction.wallet?.currency) ? 6 : 2
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {transaction.wallet?.currency || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                    <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Transaction Details:</p>
                      <div className="text-xs text-slate-300">
                        {Object.entries(transaction.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <i className="bi bi-clock-history text-6xl text-slate-600 mb-4 block"></i>
              <h3 className="text-lg font-medium text-white mb-2">
                {filter === 'ALL' ? 'No transactions yet' : `No ${filter.toLowerCase()} transactions`}
              </h3>
              <p className="text-slate-400">
                {filter === 'ALL' 
                  ? 'Your transaction history will appear here' 
                  : 'Try selecting a different transaction type'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
