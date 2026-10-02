'use client';

import React from 'react';

interface PetMMBrandProps {
  prefix?: string;
  suffix?: string;
  className?: string;
  ampClassName?: string;
}

/**
 * PetMMBrand renders "PetM&M" where the '&' character is styled to be
 * visually lower and smaller than the two 'M' characters per brand identity.
 */
export default function PetMMBrand({
  prefix = '',
  suffix = '',
  className = '',
  ampClassName = '',
}: PetMMBrandProps) {
  return (
    <span className={`inline-flex items-baseline font-inherit ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span>PetM</span>
      <span
        className={`brand-and text-[0.76em] leading-none mx-[0.5px] font-sans font-bold relative top-[0.05em] select-none ${ampClassName}`}
        style={{ verticalAlign: 'baseline' }}
      >
        &amp;
      </span>
      <span>M</span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

/**
 * Helper to wrap any "PetM&M" / "PETM&M" substrings within a string
 * with proper typography where '&' is lower than the two 'M's.
 */
export function renderBrandText(text: string | null | undefined): React.ReactNode {
  if (!text) return text;
  const regex = /(PetM(?:&|&amp;)M|PETM(?:&|&amp;)M)/gi;
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (/^PetM(?:&|&amp;)M$/i.test(part)) {
      const isUpper = part.startsWith('PET');
      return (
        <span key={index} className="inline-flex items-baseline font-inherit">
          <span>{isUpper ? 'PETM' : 'PetM'}</span>
          <span
            className="brand-and text-[0.76em] leading-none mx-[0.5px] font-sans font-bold relative top-[0.05em] select-none"
            style={{ verticalAlign: 'baseline' }}
          >
            &amp;
          </span>
          <span>M</span>
        </span>
      );
    }
    return part;
  });
}
