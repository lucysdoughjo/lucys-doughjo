import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { brandColors, getEmailSiteUrl } from "../lib/brand";

type BrandLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function BrandLayout({ preview, children }: BrandLayoutProps) {
  const siteUrl = getEmailSiteUrl();
  const logoUrl = `${siteUrl}/assets/icons/horizontal_logo.png`;

  return (
    <Html lang="en">
      <Head />
      <Body style={bodyStyle}>
        <Preview>{preview}</Preview>
        <Container style={containerStyle}>
          <Section style={logoSectionStyle}>
            <Link href={siteUrl}>
              <Img
                src={logoUrl}
                alt="Lucy's Doughjo"
                width={180}
                height={48}
                style={logoStyle}
              />
            </Link>
          </Section>
          {children}
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            Lucy&apos;s Doughjo · Chino, CA ·{" "}
            <Link href={siteUrl} style={footerLinkStyle}>
              lucydoughjo.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: CSSProperties = {
  backgroundColor: brandColors.cream,
  fontFamily:
    'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: "24px 12px",
};

const containerStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: `1px solid ${brandColors.goldenWheat}`,
  borderRadius: "4px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px 28px",
};

const logoSectionStyle: CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoStyle: CSSProperties = {
  margin: "0 auto",
};

const hrStyle: CSSProperties = {
  borderColor: brandColors.sage,
  borderStyle: "solid",
  borderWidth: "1px 0 0 0",
  margin: "28px 0 16px",
};

const footerStyle: CSSProperties = {
  color: brandColors.sage,
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: 0,
};

const footerLinkStyle: CSSProperties = {
  color: brandColors.terracotta,
  textDecoration: "underline",
};

export const headingStyle: CSSProperties = {
  color: brandColors.espresso,
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "24px",
  fontWeight: 600,
  lineHeight: "32px",
  margin: "0 0 16px",
};

export const textStyle: CSSProperties = {
  color: brandColors.espresso,
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

export const mutedTextStyle: CSSProperties = {
  color: brandColors.sage,
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 12px",
};

export const panelStyle: CSSProperties = {
  backgroundColor: brandColors.cream,
  borderRadius: "4px",
  padding: "16px 18px",
  margin: "0 0 20px",
};

export const buttonStyle: CSSProperties = {
  backgroundColor: brandColors.terracotta,
  borderRadius: "4px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "100%",
  padding: "14px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  boxSizing: "border-box" as const,
};
