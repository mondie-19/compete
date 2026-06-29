import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface NewsletterEmailProps {
  email: string;
}

const mono: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
};

export const NewsletterEmail = ({ email }: NewsletterEmailProps) => {
  return (
    <CompeteLayout previewText="You're subscribed — we'll let you know when something drops.">

      {/* Heading */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          ...mono,
          fontSize: '9px',
          letterSpacing: '4px',
          color: CompeteTheme.brand,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          Newsletter
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
        }}>
          You're on the list.
        </div>
      </div>

      {/* Body */}
      <p style={{
        ...mono,
        fontSize: '14px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        margin: '0 0 28px 0',
      }}>
        When new tournaments, challenges, and features go live on Compete,
        you'll hear about it first — straight to your inbox.
      </p>

      {/* What you'll get */}
      <div style={{
        backgroundColor: CompeteTheme.cardAlt,
        border: `1px solid ${CompeteTheme.border}`,
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '28px',
      }}>
        <div style={{ ...mono, fontSize: '9px', letterSpacing: '3px', color: CompeteTheme.brand, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px' }}>
          What you'll receive
        </div>
        {[
          'Tournament launch announcements',
          'New game modes and challenges',
          'Platform updates and features',
          'Prize pool breakdowns',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ ...mono, color: CompeteTheme.brand, marginRight: '10px', fontSize: '12px' }}>→</span>
            <span style={{ ...mono, fontSize: '13px', color: CompeteTheme.mutedLight }}>{item}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <a href="https://competehq.online/tournaments" style={{
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
          Visit Compete →
        </a>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: CompeteTheme.border, margin: '0 0 16px 0' }} />

      {/* Unsubscribe note */}
      <p style={{
        ...mono,
        fontSize: '11px',
        color: CompeteTheme.muted,
        margin: 0,
        lineHeight: '1.6',
      }}>
        No spam, ever. You subscribed with <span style={{ color: CompeteTheme.text }}>{email}</span>.
        Reply to this email to unsubscribe.
      </p>

    </CompeteLayout>
  );
};
