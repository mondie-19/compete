import {
  Html, Head, Body, Container, Preview, Font,
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

          {/* Top accent bar */}
          <div style={{ height: '3px', background: CompeteTheme.brand }} />

          {/* Wordmark */}
          <div style={{
            padding: '28px 40px 24px',
            borderBottom: `1px solid ${CompeteTheme.border}`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: CompeteTheme.text,
              letterSpacing: '-1px',
              fontStyle: 'italic',
              lineHeight: 1,
            }}>
              COMPETE
            </div>
            <div style={{
              width: '28px',
              height: '2px',
              background: CompeteTheme.brand,
              margin: '8px auto 0',
            }} />
          </div>

          {/* Content */}
          <div style={{ padding: '36px 40px', fontFamily: "'Courier New', Courier, monospace" }}>
            {children}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: `1px solid ${CompeteTheme.border}`,
            padding: '18px 40px',
            backgroundColor: CompeteTheme.background,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '11px',
              color: CompeteTheme.muted,
              letterSpacing: '1px',
            }}>
              © {new Date().getFullYear()} Compete HQ
            </div>
          </div>

        </Container>
      </Body>
    </Html>
  );
};
