import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface PayoutNotificationProps {
  username: string;
  gameName: string;
  payoutAmount: number;
  matchId: string;
}

export const PayoutNotification = ({ 
  username, 
  gameName, 
  payoutAmount, 
  matchId 
}: PayoutNotificationProps) => {
  
  return (
    <CompeteLayout previewText={`Payout Processed: KES ${payoutAmount} for ${gameName}`}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: CompeteTheme.success, fontSize: '24px', margin: '0 0 10px 0' }}>
          Victory Secured!
        </h2>
        <p style={{ color: CompeteTheme.muted, fontSize: '14px' }}>
          Match ID: <span style={{ color: CompeteTheme.brand }}>#{matchId}</span>
        </p>
      </div>

      <p style={{ color: CompeteTheme.text, fontSize: '16px', lineHeight: '1.6', textAlign: 'center' }}>
        Congratulations, <strong>{username}</strong>! Your recent <strong>{gameName}</strong> match has been successfully resolved in your favor.
      </p>

      {/* Payout Details */}
      <div style={{ 
        backgroundColor: '#000000', 
        borderRadius: '12px', 
        padding: '25px', 
        margin: '30px 0', 
        border: `1px solid ${CompeteTheme.success}`,
        textAlign: 'center'
      }}>
        <p style={{ color: CompeteTheme.muted, margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Total Payout Credited
        </p>
        <p style={{ color: CompeteTheme.success, margin: '0', fontSize: '32px', fontWeight: 'bold' }}>
          KES {payoutAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <p style={{ color: CompeteTheme.text, fontSize: '15px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 30px 0' }}>
        These funds have been deposited directly into your platform wallet. You can use them to deploy new matches or withdraw them to your external account.
      </p>

      {/* Call to Action */}
      <div style={{ textAlign: 'center' }}>
        <a href={`https://compete.app/wallet`} style={{
          display: 'inline-block',
          backgroundColor: CompeteTheme.card,
          color: CompeteTheme.text,
          border: `1px solid ${CompeteTheme.border}`,
          padding: '14px 28px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '15px',
          transition: 'all 0.2s ease',
        }}>
          View Wallet Balance
        </a>
      </div>
    </CompeteLayout>
  );
};
