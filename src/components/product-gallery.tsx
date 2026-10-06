"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ProductImage } from "@/sanity/shop-types";

const AUTO_ADVANCE_MS = 5000;

function isSanityCdn(url: string) {
  return url.startsWith("https://cdn.sanity.io/");
}

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = images.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);
    return () => mq.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (count <= 1 || interactionPaused || tabHidden || reduceMotion) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [count, interactionPaused, tabHidden, reduceMotion]);

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  if (count === 0) {
    return null;
  }

  const active = images[index] ?? images[0];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteractionPaused(false);
        }
      }}
    >
      <figure className="relative aspect-square overflow-hidden rounded-sm bg-espresso/5">
        <Image
          key={active.url}
          src={active.url}
          alt={active.alt || productName}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity duration-700 ease-in-out"
          unoptimized={isSanityCdn(active.url)}
        />
      </figure>

      {count > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={`${image.url}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-espresso/20 hover:bg-espresso/35"
              }`}
              aria-label={`View ${productName} photo ${i + 1} of ${count}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
