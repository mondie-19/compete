import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
  verificationLink: string;
}

const mono: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
};

export const WelcomeEmail = ({ username, verificationLink }: WelcomeEmailProps) => {
  return (
    <CompeteLayout previewText={`Verify your email to start playing, ${username}.`}>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          ...mono,
          fontSize: '22px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: CompeteTheme.text,
          letterSpacing: '-0.5px',
          lineHeight: '1.2',
          textTransform: 'uppercase',
        }}>
          Hey {username},
        </div>
        <div style={{
          ...mono,
          fontSize: '22px',
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: CompeteTheme.brand,
          letterSpacing: '-0.5px',
          lineHeight: '1.2',
          textTransform: 'uppercase',
        }}>
          almost there.
        </div>
      </div>

      {/* Body */}
      <p style={{
        ...mono,
        fontSize: '14px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        margin: '0 0 32px 0',
      }}>
        Click the button below to verify your email and activate your Compete account.
        The link expires in <strong style={{ color: CompeteTheme.text }}>24 hours</strong>.
      </p>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <a
          href={verificationLink}
          style={{
            display: 'inline-block',
            backgroundColor: CompeteTheme.brand,
            color: '#ffffff',
            padding: '14px 36px',
            borderRadius: '100px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontFamily: "'Courier New', Courier, monospace",
            textDecoration: 'none',
            fontSize: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Verify Email →
        </a>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: CompeteTheme.border, margin: '0 0 20px 0' }} />

      {/* Small print */}
      <p style={{
        ...mono,
        fontSize: '11px',
        color: CompeteTheme.muted,
        margin: '0 0 6px 0',
        lineHeight: '1.6',
      }}>
        If you didn't sign up for Compete, you can ignore this email.
      </p>
      <p style={{
        ...mono,
        fontSize: '11px',
        color: CompeteTheme.muted,
        margin: '0 0 4px 0',
      }}>
        Button not working? Paste this link into your browser:
      </p>
      <p style={{
        ...mono,
        fontSize: '10px',
        color: CompeteTheme.brand,
        margin: 0,
        wordBreak: 'break-all',
      }}>
        {verificationLink}
      </p>

    </CompeteLayout>
  );
};
