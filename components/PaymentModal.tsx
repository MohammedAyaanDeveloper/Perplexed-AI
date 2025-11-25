import React, { useState } from 'react';
import { X, CreditCard, Check, Loader2, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await onConfirm();
    setStep('success');
    setLoading(false);
    
    // Auto close after success
    setTimeout(() => {
      onClose();
      // Reset state for next time
      setTimeout(() => setStep('details'), 500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1f1f1f] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === 'details' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <CreditCard size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upgrade to Pro</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">$9.99 / month</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-teal-500 mt-0.5" />
                <span>Access to advanced reasoning models (Gemini 1.5 Pro)</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-teal-500 mt-0.5" />
                <span>Priority response time</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-teal-500 mt-0.5" />
                <span>Unlimited chat history</span>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Card Number (Dummy)</label>
                <input 
                  type="text" 
                  value="4242 4242 4242 4242"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm focus:outline-none cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">Expiry</label>
                  <input 
                    type="text" 
                    value="12/30"
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">CVC</label>
                  <input 
                    type="text" 
                    value="123"
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all transform active:scale-[0.98]"
                >
                  Confirm Payment
                </button>
                <p className="text-center mt-3 text-[10px] text-gray-400">
                  <ShieldCheck size={12} className="inline mr-1" />
                  Secure (Dummy) Transaction
                </p>
              </div>
            </form>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 size={48} className="text-teal-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Processing Payment...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please do not close this window.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4 animate-in zoom-in duration-300">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upgrade Successful!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">You are now a Pro member.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;