import React from 'react';

export default function HeadsetIcon() {
  return (
    <svg className="headset-svg" viewBox="0 0 100 100" aria-hidden="true">
      {/* Outer silhouette of head */}
      <path
        d="M 48,15 C 32,15 24,28 24,46 C 24,56 24,70 34,78 L 34,86 L 40,86 L 40,78 C 48,78 54,76 60,70 C 66,64 68,56 68,48 C 68,42 66,37 63,33 C 67,31 70,27 70,22 C 70,16 62,15 48,15 Z"
        fill="none"
        stroke="#000000"
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Headset earpiece circle */}
      <circle cx="42" cy="50" r="9" fill="none" stroke="#000000" strokeWidth="7" />
      {/* Headband arch */}
      <path
        d="M 42,41 C 42,28 32,28 25,37"
        fill="none"
        stroke="#000000"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Microphone arm and tip */}
      <path
        d="M 48,56 L 60,68"
        fill="none"
        stroke="#000000"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="62" cy="70" r="5.5" fill="#000000" />
    </svg>
  );
}
