// components/emails/MatchConfirmedEmail.tsx
import { CompeteLayout } from './CompeteLayout';
import { CompeteTheme } from '@/constants/email-theme';

interface MatchConfirmedProps {
  username: string;
  gameName: string; // e.g., "PUBG Mobile" or "CODM"
  wagerAmount: number;
  matchId: string;
}

export const MatchConfirmedEmail = ({ 
  username, 
  gameName, 
  wagerAmount, 
  matchId 
}: MatchConfirmedProps) => {
  
  // Compete Platform Logic: 15% cut
  const fee = wagerAmount * 0.15;
  const potentialWin = (wagerAmount * 2) - fee;

  return (
    <CompeteLayout previewText={`Match Locked: ${gameName} for KES ${wagerAmount}`}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: CompeteTheme.text, fontSize: '22px', margin: '0 0 10px 0' }}>
          Match Locked & Loaded
        </h2>
        <p style={{ color: CompeteTheme.muted, fontSize: '14px' }}>
          Match ID: <span style={{ color: CompeteTheme.purple }}>#{matchId}</span>
        </p>
      </div>

      <p style={{ color: CompeteTheme.text, fontSize: '16px', lineHeight: '1.6' }}>
        Ready to climb the leaderboard, <strong>{username}</strong>? Your wager for <strong>{gameName}</strong> has been confirmed.
      </p>

      {/* Stake Breakdown Table */}
      <div style={{ 
        backgroundColor: '#000000', 
        borderRadius: '12px', 
        padding: '20px', 
        margin: '25px 0', 
        border: `1px solid ${CompeteTheme.border}` 
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td style={{ color: CompeteTheme.muted, paddingBottom: '10px', fontSize: '14px' }}>Your Stake</td>
            <td style={{ color: CompeteTheme.text, textAlign: 'right', paddingBottom: '10px', fontWeight: 'bold' }}>
              KES {wagerAmount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td style={{ color: CompeteTheme.muted, paddingBottom: '10px', fontSize: '14px' }}>Platform Fee (15%)</td>
            <td style={{ color: '#f43f5e', textAlign: 'right', paddingBottom: '10px' }}>
              -KES {fee.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
          <tr style={{ borderTop: `1px solid ${CompeteTheme.border}` }}>
            <td style={{ color: CompeteTheme.purple, paddingTop: '15px', fontWeight: 'bold', fontSize: '16px' }}>
              Potential Payout
            </td>
            <td style={{ color: CompeteTheme.purpleGlow, textAlign: 'right', paddingTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>
              KES {potentialWin.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </table>
      </div>

      {/* Verification Instructions */}
      <div style={{ 
        borderLeft: `4px solid ${CompeteTheme.purple}`, 
        paddingLeft: '15px', 
        margin: '20px 0' 
      }}>
        <p style={{ color: CompeteTheme.text, fontSize: '14px', margin: '0 0 5px 0', fontWeight: 'bold' }}>
          Action Required:
        </p>
        <p style={{ color: CompeteTheme.muted, fontSize: '13px', margin: 0 }}>
          Once the match ends, upload a clear screenshot of the final score screen. Our OCR system will process the results immediately.
        </p>
      </div>

      {/* Call to Action */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href={`https://compete.app/match/${matchId}`} style={{
          display: 'inline-block',
          backgroundColor: CompeteTheme.purple,
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '15px',
          boxShadow: '0 4px 15px rgba(155, 92, 255, 0.4)'
        }}>
          Enter Match Lobby
        </a>
      </div>
    </CompeteLayout>
  );
};