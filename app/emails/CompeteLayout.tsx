import { Html, Head, Body, Container, Preview, Font } from '@react-email/components';
import { CompeteTheme } from '@/constants/email-theme';
import * as React from 'react';

interface CompeteLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export const CompeteLayout = ({ children, previewText }: CompeteLayoutProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf',
            format: 'truetype',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf',
            format: 'truetype',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: CompeteTheme.background, margin: 0, padding: 0 }}>
        <Container style={{
          backgroundColor: CompeteTheme.card,
          border: `1px solid ${CompeteTheme.border}`,
          borderRadius: '12px',
          margin: '40px auto',
          padding: '40px',
          maxWidth: '600px',
        }}>
          {/* Logo Section */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ 
              color: CompeteTheme.text, 
              fontSize: '28px', 
              margin: '0',
              fontWeight: 'bold',
              letterSpacing: '-0.5px'
            }}>
              COMPETE
            </h1>
            <div style={{
              height: '2px',
              width: '40px',
              backgroundColor: CompeteTheme.brand,
              margin: '10px auto 0'
            }} />
          </div>

          {/* Main Content */}
          <div style={{ color: CompeteTheme.text, fontFamily: 'Inter, sans-serif' }}>
            {children}
          </div>

          {/* Footer Section */}
          <div style={{
            borderTop: `1px solid ${CompeteTheme.border}`,
            marginTop: '40px',
            paddingTop: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: CompeteTheme.muted, fontSize: '12px', margin: '0' }}>
              &copy; {new Date().getFullYear()} Compete Esports Platform. All rights reserved.
            </p>
          </div>
        </Container>
      </Body>
    </Html>
  );
};
