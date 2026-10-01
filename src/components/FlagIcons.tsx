'use client';

import React from 'react';

export function VietnamFlag({ className = 'w-4 h-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`${className} rounded-xs inline-block shrink-0 shadow-xs`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cờ Việt Nam"
    >
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,4 16.5,8.8 21.5,8.8 17.5,11.8 19,16.5 15,13.5 11,16.5 12.5,11.8 8.5,8.8 13.5,8.8"
        fill="#FFFF00"
      />
    </svg>
  );
}

export function UKFlag({ className = 'w-4 h-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={`${className} rounded-xs inline-block shrink-0 shadow-xs`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="British Flag"
    >
      <clipPath id="uk-clip-shared">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-diag-shared">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-clip-shared)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-shared)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
