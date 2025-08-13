import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

const currencies = [
  { code: 'EUR', name: 'Euro', balance: '2,450.32', change: '+2.4%', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', balance: '1,876.90', change: '+1.8%', flag: '🇬🇧' },
  { code: 'USD', name: 'US Dollar', balance: '3,124.56', change: '+0.9%', flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', balance: '89,432.10', change: '+3.2%', flag: '🇮🇳' },
];

const CurrencyDashboard = () => {
  return (
    <section className="py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Multi-currency{' '}
            <span className="text-lime-400 font-medium">balances</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Hold and manage money in 50+ currencies. Get local bank details 
            in 10 countries and spend with your FlowPay card.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currencies.map((currency, index) => (
            <motion.div
              key={currency.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:bg-slate-800/70 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{currency.flag}</span>
                  <div>
                    <div className="text-white font-semibold">{currency.code}</div>
                    <div className="text-slate-400 text-sm">{currency.name}</div>
                  </div>
                </div>
                <ArrowUpRight className="text-slate-400" size={20} />
              </div>

              <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="mb-4"
              >
                <div className="text-2xl font-semibold text-white mb-1">
                  {currency.balance}
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-lime-400" size={16} />
                  <span className="text-lime-400 text-sm font-medium">
                    {currency.change}
                  </span>
                </div>
              </motion.div>

              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.random() * 60 + 40}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className="bg-gradient-to-r from-lime-400 to-emerald-400 h-2 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <button className="bg-lime-400 text-slate-900 px-8 py-4 rounded-md text-lg font-medium hover:bg-lime-300 transition-colors">
            Open multi-currency account
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CurrencyDashboard;