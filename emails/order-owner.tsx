import { Column, Heading, Link, Row, Section, Text } from "@react-email/components";
import {
  BrandLayout,
  headingStyle,
  mutedTextStyle,
  panelStyle,
  textStyle,
} from "./components/brand-layout";
import { formatCents } from "./lib/brand";
import type { OrderEmailLineItem } from "./order-types";

export type OrderOwnerEmailProps = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentLabel: string;
  fulfillmentDetails: string;
  fulfillmentDateLabel: string;
  items: OrderEmailLineItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  orderNotes?: string | null;
};

export default function OrderOwnerEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  fulfillmentLabel,
  fulfillmentDetails,
  fulfillmentDateLabel,
  items,
  subtotalCents,
  deliveryFeeCents,
  totalCents,
  orderNotes,
}: OrderOwnerEmailProps) {
  return (
    <BrandLayout preview={`New order ${orderNumber} — ${customerName}`}>
      <Heading as="h1" style={headingStyle}>
        New order received
      </Heading>
      <Text style={textStyle}>
        Order <strong>{orderNumber}</strong> · {fulfillmentDateLabel}
      </Text>
      <div style={panelStyle}>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Customer:</strong> {customerName}
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Email:</strong>{" "}
          <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Phone:</strong> {customerPhone}
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>Fulfillment:</strong> {fulfillmentLabel}
        </Text>
        <Text style={{ ...textStyle, marginBottom: 0, whiteSpace: "pre-wrap" }}>
          {fulfillmentDetails}
        </Text>
      </div>
      <Section style={{ marginBottom: "16px" }}>
        {items.map((item) => (
          <Row key={item.key} style={{ marginBottom: "12px" }}>
            <Column style={{ width: "70%" }}>
              <Text style={{ ...textStyle, margin: 0 }}>
                {item.name}
                {item.optionLabel ? ` · ${item.optionLabel}` : ""}
              </Text>
              <Text style={{ ...mutedTextStyle, margin: "4px 0 0", fontSize: "15px" }}>
                Quantity: {item.quantity}
              </Text>
            </Column>
            <Column align="right" style={{ width: "30%" }}>
              <Text style={{ ...textStyle, margin: 0, textAlign: "right" }}>
                {formatCents(item.lineTotalCents)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>
      <div style={panelStyle}>
        <Text style={{ ...textStyle, margin: "0 0 8px" }}>
          Subtotal {formatCents(subtotalCents)}
          {deliveryFeeCents > 0
            ? ` · Delivery ${formatCents(deliveryFeeCents)}`
            : ""}
        </Text>
        <Text style={{ ...textStyle, margin: 0, fontWeight: 600 }}>
          Total {formatCents(totalCents)}
        </Text>
      </div>
      {orderNotes ? (
        <Text style={textStyle}>
          <strong>Customer notes:</strong> {orderNotes}
        </Text>
      ) : null}
    </BrandLayout>
  );
}

OrderOwnerEmail.PreviewProps = {
  orderNumber: "LDJ-1042",
  customerName: "Jordan Lee",
  customerEmail: "jordan@example.com",
  customerPhone: "(909) 555-0100",
  fulfillmentLabel: "Sunday pickup",
  fulfillmentDetails: "Pickup address from site settings",
  fulfillmentDateLabel: "Sunday, October 19",
  items: [
    {
      key: "1",
      name: "Cinnamon Rolls",
      optionLabel: "4-pack",
      quantity: 1,
      lineTotalCents: 2500,
    },
  ],
  subtotalCents: 2500,
  deliveryFeeCents: 0,
  totalCents: 2500,
  orderNotes: "Please ring the doorbell.",
} satisfies OrderOwnerEmailProps;
