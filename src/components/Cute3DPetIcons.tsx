'use client';

import React from 'react';

interface CutePetIconProps {
  className?: string;
  size?: number;
}

/**
 * 3D Pixar/Disney Style Cute Cartoon Dog Icon
 * Ultra-sharp vector with radial gradients, glossy catchlights, floppy ears, and sweet smile
 */
export function Cute3DDogIcon({ className = 'w-7 h-7', size = 32 }: CutePetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_6px_rgba(217,119,6,0.35)] ${className}`}
      aria-label="Cún hoạt hình 3D dễ thương"
    >
      <defs>
        {/* Head 3D Sphere Gradient */}
        <radialGradient id="dogHeadGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF1CC" />
          <stop offset="35%" stopColor="#FCD34D" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </radialGradient>

        {/* Left Ear 3D Gradient */}
        <linearGradient id="dogEarLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Right Ear 3D Gradient */}
        <linearGradient id="dogEarRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Snout 3D Gradient */}
        <radialGradient id="dogSnoutGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>

        {/* Nose Glossy Gradient */}
        <radialGradient id="dogNoseGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="40%" stopColor="#1F2937" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>

        {/* Blush Gradient */}
        <radialGradient id="dogBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>

        {/* Eye 3D Gradient */}
        <radialGradient id="dogEyeGrad" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="60%" stopColor="#291405" />
          <stop offset="100%" stopColor="#0B0502" />
        </radialGradient>
      </defs>

      {/* 1. Floppy 3D Ears (Behind head) */}
      <path
        d="M22 32 C12 36, 4 54, 7 70 C9 79, 17 81, 23 74 C28 67, 30 52, 28 38 Z"
        fill="url(#dogEarLeft)"
      />
      <path
        d="M78 32 C88 36, 96 54, 93 70 C91 79, 83 81, 77 74 C72 67, 70 52, 72 38 Z"
        fill="url(#dogEarRight)"
      />

      {/* 2. Chubby 3D Head */}
      <circle cx="50" cy="50" r="38" fill="url(#dogHeadGrad)" />

      {/* 3. Soft Pink Blush on Cheeks */}
      <ellipse cx="26" cy="58" rx="8" ry="5" fill="url(#dogBlushGrad)" />
      <ellipse cx="74" cy="58" rx="8" ry="5" fill="url(#dogBlushGrad)" />

      {/* 4. Chubby 3D Snout */}
      <ellipse cx="50" cy="62" rx="19" ry="14" fill="url(#dogSnoutGrad)" />

      {/* 5. Glistening 3D Eyes (Pixar Style with Big Shiny Highlights) */}
      {/* Left Eye */}
      <circle cx="37" cy="46" r="7.5" fill="url(#dogEyeGrad)" />
      <circle cx="35" cy="43.5" r="3" fill="#FFFFFF" />
      <circle cx="39" cy="48" r="1.2" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="63" cy="46" r="7.5" fill="url(#dogEyeGrad)" />
      <circle cx="61" cy="43.5" r="3" fill="#FFFFFF" />
      <circle cx="65" cy="48" r="1.2" fill="#FFFFFF" />

      {/* Cute Expressive Eyebrows */}
      <ellipse cx="37" cy="35" rx="3.5" ry="2" fill="#B45309" opacity="0.6" />
      <ellipse cx="63" cy="35" rx="3.5" ry="2" fill="#B45309" opacity="0.6" />

      {/* 6. Glossy 3D Button Nose */}
      <path
        d="M44 56 C44 54, 46 53, 50 53 C54 53, 56 54, 56 56 C56 59, 52 62, 50 62 C48 62, 44 59, 44 56 Z"
        fill="url(#dogNoseGrad)"
      />
      {/* Nose Specular Highlight */}
      <ellipse cx="48.5" cy="55" rx="2" ry="1" fill="#FFFFFF" opacity="0.8" />

      {/* 7. Cute Open Mouth & Tongue */}
      <path
        d="M50 62 L50 66 M44 65 C47 68, 50 68, 50 66 C50 68, 53 68, 56 65"
        stroke="#78350F"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M47 67 C47 72, 53 72, 53 67 Z"
        fill="#F43F5E"
      />
      <path
        d="M48 68 C49 71, 51 71, 52 68"
        stroke="#BE123C"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/**
 * 3D Pixar/Disney Style Cute Cartoon Cat Icon
 * Ultra-sharp vector with soft pastel gradients, big emerald jewel eyes, and adorable expression
 */
export function Cute3DCatIcon({ className = 'w-7 h-7', size = 32 }: CutePetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_2px_6px_rgba(16,185,129,0.35)] ${className}`}
      aria-label="Mèo hoạt hình 3D dễ thương"
    >
      <defs>
        {/* Cat Head 3D Gradient */}
        <radialGradient id="catHeadGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#F1F5F9" />
          <stop offset="75%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>

        {/* Ear Outer 3D Gradient */}
        <linearGradient id="catEarOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Ear Inner Pink 3D Gradient */}
        <linearGradient id="catEarInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>

        {/* Big Jewel Turquoise Eyes Gradient */}
        <radialGradient id="catEyeGrad" cx="45%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>

        {/* Cat Blush */}
        <radialGradient id="catBlushGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB7185" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Pointy 3D Ears with Pink Inner */}
      {/* Left Ear */}
      <path
        d="M20 42 L30 14 C33 9, 39 12, 42 20 L44 32 Z"
        fill="url(#catEarOuter)"
      />
      <path
        d="M26 36 L32 18 C33 16, 36 17, 37 22 L38 30 Z"
        fill="url(#catEarInner)"
      />

      {/* Right Ear */}
      <path
        d="M80 42 L70 14 C67 9, 61 12, 58 20 L56 32 Z"
        fill="url(#catEarOuter)"
      />
      <path
        d="M74 36 L68 18 C67 16, 64 17, 63 22 L62 30 Z"
        fill="url(#catEarInner)"
      />

      {/* 2. Chubby 3D Cat Head */}
      <circle cx="50" cy="54" r="36" fill="url(#catHeadGrad)" />

      {/* 3. Forehead Tabby Mark (Subtle cute stripes) */}
      <path
        d="M48 24 L50 30 L52 24 M44 26 L47 32 M56 26 L53 32"
        stroke="#94A3B8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* 4. Rosy Cheek Blush */}
      <ellipse cx="26" cy="62" rx="7" ry="4.5" fill="url(#catBlushGrad)" />
      <ellipse cx="74" cy="62" rx="7" ry="4.5" fill="url(#catBlushGrad)" />

      {/* 5. Giant Glistening Jewel Eyes (Pixar Style) */}
      {/* Left Eye */}
      <circle cx="36" cy="49" r="8.5" fill="url(#catEyeGrad)" />
      {/* Pupil */}
      <ellipse cx="36" cy="49" rx="4.5" ry="6.5" fill="#022C22" />
      {/* Big Catchlight */}
      <circle cx="33.5" cy="46" r="3.2" fill="#FFFFFF" />
      <circle cx="38" cy="52" r="1.3" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="64" cy="49" r="8.5" fill="url(#catEyeGrad)" />
      {/* Pupil */}
      <ellipse cx="64" cy="49" rx="4.5" ry="6.5" fill="#022C22" />
      {/* Big Catchlight */}
      <circle cx="61.5" cy="46" r="3.2" fill="#FFFFFF" />
      <circle cx="66" cy="52" r="1.3" fill="#FFFFFF" />

      {/* 6. Tiny Pink 3D Heart Nose */}
      <path
        d="M47 59 C47 57.5, 48.5 57, 50 58 C51.5 57, 53 57.5, 53 59 C53 61, 50.5 62.5, 50 62.5 C49.5 62.5, 47 61, 47 59 Z"
        fill="#F43F5E"
      />
      <circle cx="49" cy="58.5" r="0.7" fill="#FFFFFF" opacity="0.8" />

      {/* 7. Cute ":3" Smiling Cat Mouth */}
      <path
        d="M44 64.5 C47 66.5, 50 66, 50 63 C50 66, 53 66.5, 56 64.5"
        stroke="#475569"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 8. Dainty Whiskers */}
      <path
        d="M18 58 L28 60 M18 63 L28 63 M19 68 L28 65"
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M82 58 L72 60 M82 63 L72 63 M81 68 L72 65"
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * 3D Paw Print Icon with glossy pads
 */
export function Cute3DPawIcon({ className = 'w-5 h-5', size = 20 }: CutePetIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_1px_4px_rgba(244,63,94,0.3)] ${className}`}
      aria-label="Dấu chân 3D"
    >
      <defs>
        <radialGradient id="pawGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="70%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </radialGradient>
      </defs>
      {/* Main Pad */}
      <path
        d="M50 48 C35 48, 25 60, 30 76 C33 84, 42 86, 50 85 C58 86, 67 84, 70 76 C75 60, 65 48, 50 48 Z"
        fill="url(#pawGrad)"
      />
      {/* 4 Toe Pads */}
      <ellipse cx="23" cy="40" rx="8" ry="11" transform="rotate(-20 23 40)" fill="url(#pawGrad)" />
      <ellipse cx="41" cy="27" rx="8" ry="12" transform="rotate(-6 41 27)" fill="url(#pawGrad)" />
      <ellipse cx="59" cy="27" rx="8" ry="12" transform="rotate(6 59 27)" fill="url(#pawGrad)" />
      <ellipse cx="77" cy="40" rx="8" ry="11" transform="rotate(20 77 40)" fill="url(#pawGrad)" />
      {/* Glossy catchlight on main pad */}
      <ellipse cx="44" cy="62" rx="7" ry="4" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}
