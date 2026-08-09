import * as React from 'react';
import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';

const CATEGORY_LABELS: Record<string, string> = {
  game:     'Game Suggestion',
  platform: 'Platform Request',
  bug:      'Bug Report',
  feedback: 'General Feedback',
};

interface SupportReplyEmailProps {
  agentName: string;
  replyMessage: string;
  originalMessage: string;
  category: string;
}

export function SupportReplyEmail({
  agentName,
  replyMessage,
  originalMessage,
  category,
}: SupportReplyEmailProps) {
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  return (
    <CompeteLayout previewText={`Reply from Compete Support — ${agentName}`}>
      {/* Category pill */}
      <div style={{
        display: 'inline-block',
        fontSize: '9px',
        fontWeight: 'bold',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: CompeteTheme.brand,
        marginBottom: '20px',
      }}>
        Support · {categoryLabel}
      </div>

      {/* Greeting */}
      <div style={{
        fontSize: '22px',
        fontWeight: 'bold',
        color: CompeteTheme.text,
        marginBottom: '24px',
        lineHeight: 1.2,
      }}>
        We got back to you.
      </div>

      {/* Reply body */}
      <div style={{
        fontSize: '14px',
        color: CompeteTheme.mutedLight,
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
        marginBottom: '32px',
      }}>
        {replyMessage}
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: CompeteTheme.border,
        margin: '28px 0',
      }} />

      {/* Original message quoted */}
      <div style={{
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: CompeteTheme.muted,
        marginBottom: '12px',
      }}>
        Your original message
      </div>
      <div style={{
        borderLeft: `3px solid ${CompeteTheme.brand}`,
        paddingLeft: '16px',
        fontSize: '12px',
        color: CompeteTheme.muted,
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
      }}>
        {originalMessage}
      </div>

      {/* Sign-off */}
      <div style={{
        marginTop: '36px',
        fontSize: '12px',
        color: CompeteTheme.mutedLight,
      }}>
        — {agentName}<br />
        <span style={{ color: CompeteTheme.muted, fontSize: '11px' }}>Compete Support</span>
      </div>
    </CompeteLayout>
  );
}
