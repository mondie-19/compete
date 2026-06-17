import {
  Html, Head, Body, Container, Preview, Font, Section, Text,
} from '@react-email/components';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface CompeteLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export const CompeteLayout = ({ children, previewText }: CompeteLayoutProps) => {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Courier New"
          fallbackFontFamily="monospace"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{
        backgroundColor: CompeteTheme.background,
        margin: 0,
        padding: '32px 0',
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        <Container style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: CompeteTheme.card,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${CompeteTheme.border}`,
        }}>

          {/* Top purple accent bar */}
          <div style={{
            height: '3px',
            background: CompeteTheme.brand,
          }} />

          {/* Header / wordmark */}
          <div style={{
            padding: '32px 40px 28px',
            borderBottom: `1px solid ${CompeteTheme.border}`,
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block',
              marginBottom: '6px',
            }}>
              <span style={{ fontSize: '10px', letterSpacing: '4px', color: CompeteTheme.brand, fontWeight: 'bold' }}>
                ● ● ●
              </span>
            </div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: CompeteTheme.text,
              letterSpacing: '-1px',
              fontStyle: 'italic',
              lineHeight: 1,
            }}>
              COMPETE
            </div>
            <div style={{
              width: '32px',
              height: '2px',
              background: CompeteTheme.brand,
              margin: '10px auto 0',
            }} />
          </div>

          {/* Main content */}
          <div style={{
            padding: '36px 40px',
            fontFamily: "'Courier New', Courier, monospace",
          }}>
            {children}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: `1px solid ${CompeteTheme.border}`,
            padding: '20px 40px',
            backgroundColor: CompeteTheme.background,
          }}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={{
                    fontSize: '10px',
                    color: CompeteTheme.muted,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                  }}>
                    ENCRYPTED TRANSMISSION
                  </td>
                  <td style={{
                    fontSize: '10px',
                    color: CompeteTheme.muted,
                    textAlign: 'right',
                  }}>
                    © {new Date().getFullYear()} Compete
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </Container>
      </Body>
    </Html>
  );
};
