"use client";

import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/button";

type CheckoutPaymentFormProps = {
  orderNumber: string;
  returnUrl: string;
};

export function CheckoutPaymentForm({
  orderNumber,
  returnUrl,
}: CheckoutPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setPending(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment could not be completed.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <p className="text-sm text-foreground/70">
        Order{" "}
        <span className="font-semibold text-foreground">{orderNumber}</span>
      </p>
      <ExpressCheckoutElement
        onConfirm={async () => {
          if (!stripe || !elements) return;
          setPending(true);
          setErrorMessage(null);
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
          });
          if (error) {
            setErrorMessage(error.message ?? "Wallet payment failed.");
            setPending(false);
          }
        }}
      />
      <PaymentElement />
      {errorMessage ? (
        <p className="text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button type="submit" disabled={!stripe || pending} className="w-full sm:w-auto">
        {pending ? "Processing…" : "Pay now →"}
      </Button>
    </form>
  );
}
