import { Heading, Link, Text } from "@react-email/components";
import {
  BrandLayout,
  headingStyle,
  mutedTextStyle,
  panelStyle,
  textStyle,
} from "./components/brand-layout";

export type ContactOwnerEmailProps = {
  customerName: string;
  customerEmail: string;
  message: string;
};

export default function ContactOwnerEmail({
  customerName,
  customerEmail,
  message,
}: ContactOwnerEmailProps) {
  return (
    <BrandLayout preview={`New message from ${customerName}`}>
      <Heading as="h1" style={headingStyle}>
        New contact inquiry
      </Heading>
      <Text style={textStyle}>
        Someone reached out through the website contact form.
      </Text>
      <div style={panelStyle}>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Name:</strong> {customerName}
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Email:</strong>{" "}
          <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
        </Text>
        <Text style={{ ...textStyle, marginBottom: 0, whiteSpace: "pre-wrap" }}>
          <strong>Message:</strong>
          <br />
          {message}
        </Text>
      </div>
      <Text style={mutedTextStyle}>
        Reply directly to this email — the sender&apos;s address is set as
        reply-to.
      </Text>
    </BrandLayout>
  );
}

ContactOwnerEmail.PreviewProps = {
  customerName: "Jordan Lee",
  customerEmail: "jordan@example.com",
  message: "Hi! Do your cinnamon rolls contain nuts?",
} satisfies ContactOwnerEmailProps;
