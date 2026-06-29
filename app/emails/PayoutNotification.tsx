import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface PayoutNotificationProps {
  username: string;
  gameName: string;
  payoutAmount: number;
  matchId: string;
}

const mono: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
};

export const PayoutNotification = ({
  username,
  gameName,
  payoutAmount,
  matchId,
}: PayoutNotificationProps) => {
  return (
    <CompeteLayout previewText={`You won — KES ${payoutAmount.toLocaleString()} has been added to your balance.`}>

      {/* Heading */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          ...mono,
          fontSize: '9px',
          letterSpacing: '4px',
          color: CompeteTheme.success,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          Match Resolved
        </div>
        <div style={{
          ...mono,
          fontSize: '22px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: CompeteTheme.text,
          letterSpacing: '-0.5px',
          lineHeight: '1.2',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          You won, {username}.
        </div>
        <div style={{ ...mono, fontSize: '13px', color: CompeteTheme.muted }}>
          Game: <strong style={{ color: CompeteTheme.text }}>{gameName}</strong>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          Match: <span style={{ color: CompeteTheme.brand }}>#{matchId}</span>
        </div>
      </div>

      {/* Payout amount */}
      <div style={{
        backgroundColor: CompeteTheme.cardAlt,
        border: `1px solid ${CompeteTheme.success}`,
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <div style={{ ...mono, fontSize: '11px', color: CompeteTheme.muted, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Credited to your balance
        </div>
        <div style={{ ...mono, fontSize: '34px', fontWeight: 'bold', color: CompeteTheme.success, lineHeight: 1 }}>
          KES {payoutAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Body */}
      <p style={{
        ...mono,
        fontSize: '13px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        margin: '0 0 28px 0',
      }}>
        Your winnings are in your Compete wallet. Use them for your next match or
        withdraw them to your account.
      </p>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <a href="https://competehq.online/dashboard" style={{
          display: 'inline-block',
          backgroundColor: CompeteTheme.brand,
          color: '#ffffff',
          padding: '14px 32px',
          borderRadius: '100px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          fontFamily: "'Courier New', Courier, monospace",
          textDecoration: 'none',
          fontSize: '12px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          View Balance →
        </a>
      </div>

    </CompeteLayout>
  );
};
