import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
  verificationLink: string;
}

export const WelcomeEmail = ({ username, verificationLink }: WelcomeEmailProps) => {
  return (
    <CompeteLayout previewText={`Welcome to Compete, ${username}!`}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: CompeteTheme.text, fontSize: '22px', margin: '0 0 10px 0' }}>
          Welcome to the Arena
        </h2>
        <p style={{ color: CompeteTheme.muted, fontSize: '14px' }}>
          Operative: <span style={{ color: CompeteTheme.brand }}>{username}</span>
        </p>
      </div>

      <p style={{ color: CompeteTheme.text, fontSize: '16px', lineHeight: '1.6' }}>
        You've successfully registered for <strong>Compete</strong>. Your account has been created, and you're almost ready to start climbing the leaderboards and earning payouts.
      </p>

      {/* Verification Instructions */}
      <div style={{ 
        borderLeft: `4px solid ${CompeteTheme.brand}`, 
        paddingLeft: '15px', 
        margin: '25px 0',
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        padding: '15px',
        borderRadius: '0 8px 8px 0'
      }}>
        <p style={{ color: CompeteTheme.text, fontSize: '15px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Action Required: Verify Your Identity
        </p>
        <p style={{ color: CompeteTheme.muted, fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
          Before you can deposit funds or join high-stakes matches, you must verify your email address. 
          Please click the link below to activate your account.
        </p>
      </div>

      {/* Call to Action */}
      <div style={{ textAlign: 'center', marginTop: '35px', marginBottom: '20px' }}>
        <a href={verificationLink} style={{
          display: 'inline-block',
          backgroundColor: CompeteTheme.brand,
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '15px',
          boxShadow: `0 4px 15px ${CompeteTheme.primaryGlow}`
        }}>
          Verify Email Address
        </a>
      </div>

      <p style={{ color: CompeteTheme.muted, fontSize: '13px', textAlign: 'center', marginTop: '30px' }}>
        If you didn't create this account, you can safely ignore this email.
      </p>
    </CompeteLayout>
  );
};
