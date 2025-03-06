'use client';

import { useState } from 'react';
import { useAuth } from '../useUser';

export function TwoFactorAuthSetup() {
  const { user, enable2FA, verify2FA, disable2FA } = useAuth({ withFullUser: true });
  const [setupData, setSetupData] = useState<{ qrCodeUrl: string; secretKey: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return <div>You must be logged in to manage 2FA settings.</div>;
  }

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await enable2FA();
      if (data) {
        setSetupData(data);
      } else {
        setError('Failed to initialize 2FA setup.');
      }
    } catch (err) {
      setError('An error occurred during 2FA setup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const success = await verify2FA(verificationCode);
      if (success) {
        setSuccess('Two-factor authentication has been enabled successfully!');
        setSetupData(null);
        setVerificationCode('');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce the security of your account.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await disable2FA();
      if (result) {
        setSuccess('Two-factor authentication has been disabled.');
      } else {
        setError('Failed to disable two-factor authentication.');
      }
    } catch (err) {
      setError('An error occurred while disabling 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
      
      {user.twoFactorEnabled ? (
        <div>
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800">✓ Two-factor authentication is currently enabled.</p>
          </div>
          
          <button
            onClick={handleDisable2FA}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Disable 2FA'}
          </button>
        </div>
      ) : setupData ? (
        <div>
          <p className="mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
          
          <div className="mb-4 border p-4 bg-gray-50 flex justify-center">
            <img src={setupData.qrCodeUrl} alt="QR Code for 2FA" className="max-w-full h-auto" />
          </div>
          
          <p className="mb-4">Or enter this code manually in your app:</p>
          <pre className="mb-4 p-3 bg-gray-100 font-mono text-sm border rounded overflow-x-auto">
            {setupData.secretKey}
          </pre>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Enter the 6-digit code from your app:</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-2 border rounded"
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleVerify2FA}
              disabled={isLoading || verificationCode.length !== 6}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify and Enable 2FA'}
            </button>
            
            <button
              onClick={() => setSetupData(null)}
              disabled={isLoading}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">
            Two-factor authentication adds an extra layer of security to your account. When enabled, you'll
            need to provide a code from your mobile device in addition to your password when signing in.
          </p>
          
          <button
            onClick={handleEnable2FA}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Set Up Two-Factor Authentication'}
          </button>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">{success}</p>
        </div>
      )}
    </div>
  );
}

export function TwoFactorAuthVerification() {
  const { verify2FALogin, is2FARequired } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!is2FARequired) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const success = await verify2FALogin(verificationCode);
      if (!success) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication Required</h2>
      
      <p className="mb-4">
        Please enter the 6-digit code from your authenticator app to complete the sign-in process.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Authentication Code:</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full p-2 border rounded"
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}