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
    <CompeteLayout previewText={`One step away, ${username}. Verify your email to enter the arena.`}>

      {/* Status badge */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{
          ...mono,
          display: 'inline-block',
          backgroundColor: '#1a0a2e',
          border: `1px solid ${CompeteTheme.brand}`,
          color: CompeteTheme.brand,
          fontSize: '9px',
          fontWeight: 'bold',
          letterSpacing: '4px',
          padding: '5px 12px',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}>
          ⚡ IDENTITY PENDING VERIFICATION
        </span>
      </div>

      {/* Hero */}
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
          marginBottom: '4px',
        }}>
          CONFIRM
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
          YOUR ACCESS
        </div>
      </div>

      {/* Operative card */}
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
                  backgroundColor: CompeteTheme.gold,
                  borderRadius: '50%',
                  verticalAlign: 'middle',
                }} />
                <span style={{ ...mono, fontSize: '9px', color: CompeteTheme.gold, letterSpacing: '2px', textTransform: 'uppercase', marginLeft: '6px', verticalAlign: 'middle' }}>
                  PENDING
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Body */}
      <p style={{
        ...mono,
        fontSize: '13px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        margin: '0 0 28px 0',
      }}>
        You are one step away from the arena. Click the button below to verify
        your email address and activate your Compete account. The link expires
        in&nbsp;<strong style={{ color: CompeteTheme.text }}>24 hours</strong>.
      </p>

      {/* What you unlock preview */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '32px' }}>
        <tbody>
          <tr>
            <td width="48%" style={{ verticalAlign: 'top' }}>
              <div style={{
                backgroundColor: CompeteTheme.cardAlt,
                border: `1px solid ${CompeteTheme.border}`,
                borderRadius: '10px',
                padding: '16px',
              }}>
                <div style={{ ...mono, fontSize: '16px', marginBottom: '6px' }}>💰</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.brand, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
                  VAULT
                </div>
                <div style={{ ...mono, fontSize: '11px', color: CompeteTheme.muted, lineHeight: '1.5' }}>
                  Deposit credits and fund your wagers.
                </div>
              </div>
            </td>
            <td width="4%" />
            <td width="48%" style={{ verticalAlign: 'top' }}>
              <div style={{
                backgroundColor: CompeteTheme.cardAlt,
                border: `1px solid ${CompeteTheme.border}`,
                borderRadius: '10px',
                padding: '16px',
              }}>
                <div style={{ ...mono, fontSize: '16px', marginBottom: '6px' }}>⚔️</div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.brand, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
                  CHALLENGE
                </div>
                <div style={{ ...mono, fontSize: '11px', color: CompeteTheme.muted, lineHeight: '1.5' }}>
                  Host or intercept live matches.
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: CompeteTheme.border, marginBottom: '32px' }} />

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a
          href={verificationLink}
          style={{
            display: 'inline-block',
            backgroundColor: CompeteTheme.brand,
            color: '#ffffff',
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
          VERIFY &amp; ENTER THE ARENA →
        </a>
      </div>

      {/* Small print */}
      <p style={{
        ...mono,
        fontSize: '10px',
        color: CompeteTheme.muted,
        textAlign: 'center',
        margin: '0 0 8px 0',
        letterSpacing: '1px',
      }}>
        If you didn't create this account, ignore this transmission.
      </p>
      <p style={{
        ...mono,
        fontSize: '10px',
        color: CompeteTheme.muted,
        textAlign: 'center',
        margin: 0,
        letterSpacing: '1px',
      }}>
        Button not working? Copy and paste this link into your browser:
      </p>
      <p style={{
        ...mono,
        fontSize: '9px',
        color: CompeteTheme.brand,
        textAlign: 'center',
        margin: '4px 0 0 0',
        wordBreak: 'break-all',
      }}>
        {verificationLink}
      </p>

    </CompeteLayout>
  );
};
