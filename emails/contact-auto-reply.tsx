import { Button, Heading, Text } from "@react-email/components";
import {
  BrandLayout,
  buttonStyle,
  headingStyle,
  textStyle,
} from "./components/brand-layout";
import { getEmailSiteUrl } from "./lib/brand";

export type ContactAutoReplyEmailProps = {
  customerName: string;
};

export default function ContactAutoReplyEmail({
  customerName,
}: ContactAutoReplyEmailProps) {
  const shopUrl = `${getEmailSiteUrl()}/shop`;

  return (
    <BrandLayout preview="We received your message — Lucy's Doughjo">
      <Heading as="h1" style={headingStyle}>
        Thanks for reaching out
      </Heading>
      <Text style={textStyle}>Hi {customerName},</Text>
      <Text style={textStyle}>
        We received your message and will get back to you within one to two business days.
      </Text>
      <Text style={textStyle}>
        If your question is about this week&apos;s menu, you can browse the
        Sunday Dough Drop anytime orders are open.
      </Text>
      <Button href={shopUrl} style={buttonStyle}>
        View this week&apos;s shop
      </Button>
      <Text style={{ ...textStyle, marginTop: "24px", marginBottom: 0 }}>
        With gratitude,
        <br />
        Lucy&apos;s Doughjo
      </Text>
    </BrandLayout>
  );
}

ContactAutoReplyEmail.PreviewProps = {
  customerName: "Jordan",
} satisfies ContactAutoReplyEmailProps;
