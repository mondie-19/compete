import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface MatchConfirmedProps {
  username: string;
  gameName: string;
  wagerAmount: number;
  matchId: string;
  matchUrl?: string;
}

const mono: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
};

const fmt = (n: number) => `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

export const MatchConfirmedEmail = ({
  username,
  gameName,
  wagerAmount,
  matchId,
  matchUrl,
}: MatchConfirmedProps) => {
  const fee = wagerAmount * 0.15;
  const potentialWin = (wagerAmount * 2) - fee;
  const lobbyUrl = matchUrl ?? `https://competehq.online/match/${matchId}`;

  return (
    <CompeteLayout previewText={`Your ${gameName} match is confirmed. Match #${matchId}`}>

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
          Match Confirmed
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
          You're in, {username}.
        </div>
        <div style={{ ...mono, fontSize: '13px', color: CompeteTheme.muted }}>
          Game: <strong style={{ color: CompeteTheme.text }}>{gameName}</strong>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          Match ID: <span style={{ color: CompeteTheme.brand }}>#{matchId}</span>
        </div>
      </div>

      {/* Stake breakdown */}
      <div style={{
        backgroundColor: CompeteTheme.cardAlt,
        border: `1px solid ${CompeteTheme.border}`,
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ ...mono, fontSize: '13px', color: CompeteTheme.muted, paddingBottom: '10px' }}>Your stake</td>
              <td style={{ ...mono, fontSize: '13px', color: CompeteTheme.text, textAlign: 'right', paddingBottom: '10px', fontWeight: 'bold' }}>
                {fmt(wagerAmount)}
              </td>
            </tr>
            <tr>
              <td style={{ ...mono, fontSize: '13px', color: CompeteTheme.muted, paddingBottom: '10px' }}>Platform fee (15%)</td>
              <td style={{ ...mono, fontSize: '13px', color: CompeteTheme.danger, textAlign: 'right', paddingBottom: '10px' }}>
                −{fmt(fee)}
              </td>
            </tr>
            <tr style={{ borderTop: `1px solid ${CompeteTheme.border}` }}>
              <td style={{ ...mono, fontSize: '14px', color: CompeteTheme.brand, paddingTop: '12px', fontWeight: 'bold' }}>
                If you win
              </td>
              <td style={{ ...mono, fontSize: '16px', color: CompeteTheme.brand, textAlign: 'right', paddingTop: '12px', fontWeight: 'bold' }}>
                {fmt(potentialWin)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Instruction */}
      <div style={{
        borderLeft: `3px solid ${CompeteTheme.brand}`,
        paddingLeft: '14px',
        marginBottom: '28px',
      }}>
        <p style={{ ...mono, fontSize: '13px', color: CompeteTheme.text, margin: '0 0 4px 0', fontWeight: 'bold' }}>
          After the match
        </p>
        <p style={{ ...mono, fontSize: '12px', color: CompeteTheme.muted, margin: 0, lineHeight: '1.6' }}>
          Upload a clear screenshot of the final score screen in your match lobby.
          Results are verified automatically.
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <a href={lobbyUrl} style={{
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
          Open Match Lobby →
        </a>
      </div>

    </CompeteLayout>
  );
};
