import { Column, Heading, Row, Section, Text } from "@react-email/components";
import {
  BrandLayout,
  headingStyle,
  mutedTextStyle,
  panelStyle,
  textStyle,
} from "./components/brand-layout";
import { formatCents } from "./lib/brand";
import type { OrderEmailLineItem } from "./order-types";

export type OrderCustomerEmailProps = {
  orderNumber: string;
  customerName: string;
  fulfillmentLabel: string;
  fulfillmentDetails: string;
  fulfillmentDateLabel: string;
  items: OrderEmailLineItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  orderNotes?: string | null;
};

export default function OrderCustomerEmail({
  orderNumber,
  customerName,
  fulfillmentLabel,
  fulfillmentDetails,
  fulfillmentDateLabel,
  items,
  subtotalCents,
  deliveryFeeCents,
  totalCents,
  orderNotes,
}: OrderCustomerEmailProps) {
  return (
    <BrandLayout preview={`Order ${orderNumber} confirmed — Sunday fulfillment`}>
      <Heading as="h1" style={headingStyle}>
        Your order is confirmed
      </Heading>
      <Text style={textStyle}>Hi {customerName},</Text>
      <Text style={textStyle}>
        Thank you for your Sunday Dough Drop preorder. We bake Saturday and
        fulfill on Sunday.
      </Text>
      <div style={panelStyle}>
        <Text style={{ ...mutedTextStyle, marginBottom: "4px" }}>
          Order {orderNumber}
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px" }}>
          <strong>{fulfillmentLabel}</strong>
        </Text>
        <Text style={{ ...textStyle, marginBottom: "8px", whiteSpace: "pre-wrap" }}>
          {fulfillmentDetails}
        </Text>
        <Text style={{ ...textStyle, marginBottom: 0 }}>
          <strong>When:</strong> {fulfillmentDateLabel}
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
        <Row>
          <Column>
            <Text style={{ ...textStyle, margin: "0 0 8px" }}>Subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={{ ...textStyle, margin: "0 0 8px", textAlign: "right" }}>
              {formatCents(subtotalCents)}
            </Text>
          </Column>
        </Row>
        {deliveryFeeCents > 0 ? (
          <Row>
            <Column>
              <Text style={{ ...textStyle, margin: "0 0 8px" }}>Delivery</Text>
            </Column>
            <Column align="right">
              <Text style={{ ...textStyle, margin: "0 0 8px", textAlign: "right" }}>
                {formatCents(deliveryFeeCents)}
              </Text>
            </Column>
          </Row>
        ) : null}
        <Row>
          <Column>
            <Text style={{ ...textStyle, margin: 0, fontWeight: 600 }}>Total</Text>
          </Column>
          <Column align="right">
            <Text style={{ ...textStyle, margin: 0, fontWeight: 600, textAlign: "right" }}>
              {formatCents(totalCents)}
            </Text>
          </Column>
        </Row>
      </div>
      {orderNotes ? (
        <Text style={textStyle}>
          <strong>Notes:</strong> {orderNotes}
        </Text>
      ) : null}
      <Text style={{ ...textStyle, marginBottom: 0 }}>
        Questions? Reply to this email and we&apos;ll help.
      </Text>
    </BrandLayout>
  );
}

OrderCustomerEmail.PreviewProps = {
  orderNumber: "LDJ-1042",
  customerName: "Jordan",
  fulfillmentLabel: "Sunday delivery",
  fulfillmentDetails: "123 Main St\nChino, CA 91710",
  fulfillmentDateLabel: "Sunday, October 19",
  items: [
    {
      key: "1",
      name: "Original Sourdough",
      optionLabel: "1 loaf",
      quantity: 1,
      lineTotalCents: 1400,
    },
  ],
  subtotalCents: 1400,
  deliveryFeeCents: 500,
  totalCents: 1900,
  orderNotes: null,
} satisfies OrderCustomerEmailProps;
