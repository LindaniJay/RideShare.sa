import React, { useState } from 'react';
import Icon from './Icon';

interface PasswordResetProps {
  onReset: (email: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PasswordReset: React.FC<PasswordResetProps> = ({
  onReset,
  onCancel,
  loading = false
}) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onReset(email);
      setStep('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  if (step === 'sent') {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Mail" size="md" className="text-green-400" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-white/70 text-sm mb-4">
            We've sent a reset link to <strong>{email}</strong>
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                setStep('email');
                setEmail('');
              }}
              className="w-full px-3 py-2 bg-green-500/20 text-green-200 rounded-md hover:bg-green-500/30 transition-colors text-sm"
            >
              Try Different Email
            </button>
            <button
              onClick={onCancel}
              className="w-full px-3 py-2 bg-white/10 text-white/70 rounded-md hover:bg-white/20 transition-colors text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Lock" size="md" className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Forgot Password?</h2>
        <p className="text-white/70 text-sm">
          Enter your email address and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-400 transition-all text-sm"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-1 text-red-400 text-xs">
            <Icon name="AlertCircle" size="xs" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-md font-medium hover:from-green-500 hover:to-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Sending...</span>
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-3 py-2 bg-white/10 text-white/70 rounded-md hover:bg-white/20 transition-colors text-sm"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordReset;
