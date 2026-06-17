import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
  verificationLink: string;
}

export const WelcomeEmail = ({ username, verificationLink }: WelcomeEmailProps) => {
  const mono: React.CSSProperties = {
    fontFamily: "'Courier New', Courier, monospace",
  };

  return (
    <CompeteLayout previewText={`Identity confirmed, ${username}. The arena awaits.`}>

      {/* Status tag */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{
          ...mono,
          display: 'inline-block',
          backgroundColor: CompeteTheme.brandFaint,
          border: `1px solid ${CompeteTheme.brand}`,
          color: CompeteTheme.brand,
          fontSize: '9px',
          fontWeight: 'bold',
          letterSpacing: '4px',
          padding: '5px 12px',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}>
          ⚡ IDENTITY CONFIRMED
        </span>
      </div>

      {/* Hero headline */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          ...mono,
          fontSize: '28px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: CompeteTheme.text,
          letterSpacing: '-1px',
          lineHeight: '1.1',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          WELCOME TO
        </div>
        <div style={{
          ...mono,
          fontSize: '28px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: CompeteTheme.brand,
          letterSpacing: '-1px',
          lineHeight: '1.1',
          textTransform: 'uppercase',
        }}>
          THE ARENA
        </div>
      </div>

      {/* Operative tag */}
      <div style={{
        backgroundColor: CompeteTheme.cardAlt,
        border: `1px solid ${CompeteTheme.border}`,
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '28px',
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.muted, textTransform: 'uppercase', marginBottom: '4px' }}>
                  OPERATIVE
                </div>
                <div style={{ ...mono, fontSize: '18px', fontWeight: 'bold', fontStyle: 'italic', color: CompeteTheme.text, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                  {username}
                </div>
              </td>
              <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                <div style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: CompeteTheme.success,
                  borderRadius: '50%',
                  verticalAlign: 'middle',
                }} />
                <span style={{ ...mono, fontSize: '9px', color: CompeteTheme.success, letterSpacing: '2px', textTransform: 'uppercase', marginLeft: '6px', verticalAlign: 'middle' }}>
                  ACTIVE
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Body copy */}
      <p style={{
        ...mono,
        fontSize: '13px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        margin: '0 0 28px 0',
      }}>
        Your account is live on the Compete network. Challenge real opponents,
        wager real stakes, and collect real payouts — all verified on-platform.
        The leaderboard is waiting.
      </p>

      {/* Feature boxes */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '32px' }}>
        <tbody>
          <tr>
            <td width="48%" style={{ verticalAlign: 'top' }}>
              <div style={{
                backgroundColor: CompeteTheme.cardAlt,
                border: `1px solid ${CompeteTheme.border}`,
                borderRadius: '10px',
                padding: '18px',
              }}>
                <div style={{ ...mono, fontSize: '18px', marginBottom: '8px' }}>💰</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.brand, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px' }}>
                  VAULT
                </div>
                <div style={{ ...mono, fontSize: '12px', color: CompeteTheme.mutedLight, lineHeight: '1.5' }}>
                  Deposit M-Pesa credits and fund your wagers instantly.
                </div>
              </div>
            </td>
            <td width="4%" />
            <td width="48%" style={{ verticalAlign: 'top' }}>
              <div style={{
                backgroundColor: CompeteTheme.cardAlt,
                border: `1px solid ${CompeteTheme.border}`,
                borderRadius: '10px',
                padding: '18px',
              }}>
                <div style={{ ...mono, fontSize: '18px', marginBottom: '8px' }}>⚔️</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.brand, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px' }}>
                  CHALLENGE
                </div>
                <div style={{ ...mono, fontSize: '12px', color: CompeteTheme.mutedLight, lineHeight: '1.5' }}>
                  Host or intercept live matches across all platforms.
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: CompeteTheme.border, marginBottom: '32px' }} />

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <a
          href={verificationLink}
          style={{
            display: 'inline-block',
            backgroundColor: CompeteTheme.text,
            color: '#000000',
            padding: '16px 40px',
            borderRadius: '100px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontFamily: "'Courier New', Courier, monospace",
            textDecoration: 'none',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          ENTER THE ARENA →
        </a>
      </div>

      {/* Small print */}
      <p style={{
        ...mono,
        fontSize: '10px',
        color: CompeteTheme.muted,
        textAlign: 'center',
        margin: 0,
        letterSpacing: '1px',
      }}>
        If you didn't create this account, ignore this transmission.
      </p>

    </CompeteLayout>
  );
};
