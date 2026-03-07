import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History as HistoryIcon, Loader2, CheckCircle, ArrowRightLeft } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/history')
      .then(res => setHistory(res.data.data.history))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  if (history.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
        <HistoryIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">No Trade History</h3>
        <p className="text-gray-500 mt-2">Your completed OTP transactions will securely appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Trade History</h2>
        <span className="text-sm font-bold text-gray-500">{history.length} Completed</span>
      </div>
      <div className="divide-y divide-gray-100">
        {history.map((trade) => (
          <div key={trade.transaction_id} className="p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-gray-50 transition">
            <img src={trade.images?.[0] || 'https://via.placeholder.com/100'} alt={trade.title} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide ${trade.trade_type === 'Sold' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {trade.trade_type}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(trade.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{trade.title}</h3>
              <p className="text-gray-600 text-sm flex items-center justify-center md:justify-start gap-1 mt-1">
                <ArrowRightLeft className="w-3 h-3" /> 
                {trade.trade_type === 'Sold' ? `Sold to ${trade.buyer_name}` : `Bought from ${trade.seller_name}`}
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-2xl font-black text-gray-900">₹{trade.price}</p>
              <p className="text-xs text-green-600 font-bold flex items-center justify-center md:justify-end gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> OTP Verified
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;