import { useId } from 'react';

type Props = { variant: 'option1' | 'option5'; friend?: boolean };

/** Articulated intro Buddy: eyes, arms and feet move independently. */
export default function LaunchMascot({ variant, friend = false }: Props) {
  const id = useId().replace(/:/g, '');
  const caterpillar = variant === 'option5';
  const body = `url(#${id}-body)`;
  const limb = caterpillar ? '#8443df' : '#0878e8';
  return <svg className="launch-mascot" viewBox="0 0 180 220" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-body`} cx="0" cy="0" r="1" gradientTransform="translate(53 61) rotate(49) scale(151 162)" gradientUnits="userSpaceOnUse">
        <stop stopColor={caterpillar ? '#d5a6ff' : '#62eaff'} /><stop offset=".48" stopColor={caterpillar ? '#b46af3' : '#19baf5'} /><stop offset="1" stopColor={caterpillar ? '#7433d4' : '#0864dd'} />
      </radialGradient>
      <linearGradient id={`${id}-tail`} x1="29" y1="157" x2="110" y2="193" gradientUnits="userSpaceOnUse"><stop stopColor="#5ce4ff" /><stop offset=".6" stopColor="#5c80f7" /><stop offset="1" stopColor="#8a4fe8" /></linearGradient>
      <linearGradient id={`${id}-eye`} x1="76" y1="85" x2="109" y2="130" gradientUnits="userSpaceOnUse"><stop stopColor="white" /><stop offset="1" stopColor="#dce8fb" /></linearGradient>
    </defs>
    {caterpillar && <g className="launch-mascot-tail"><ellipse cx="38" cy="176" rx="24" ry="22" fill={`url(#${id}-tail)`} /><ellipse cx="60" cy="174" rx="28" ry="27" fill="#8861ed" /><ellipse cx="86" cy="165" rx="32" ry="32" fill="#b37aef" /></g>}
    <g className="launch-mascot-leg launch-mascot-leg-left">
      <path d="M70 165 65 194" stroke={limb} strokeWidth="13" strokeLinecap="round" /><path d="M65 192c-13 0-23 7-22 14 5 6 29 6 35 0l-3-12Z" fill={limb} /><path d="M48 207h26" stroke={caterpillar ? '#6935b6' : '#0858bb'} strokeWidth="3" strokeLinecap="round" />
    </g>
    <g className="launch-mascot-leg launch-mascot-leg-right">
      <path d="m112 165 4 29" stroke={limb} strokeWidth="13" strokeLinecap="round" /><path d="M114 192c14-1 24 7 23 14-5 6-29 6-35 0l3-12Z" fill={limb} /><path d="M107 207h26" stroke={caterpillar ? '#6935b6' : '#0858bb'} strokeWidth="3" strokeLinecap="round" />
    </g>
    <g className="launch-mascot-upper">
      <g className="launch-mascot-arm launch-mascot-arm-left"><path d="M40 111c-17 5-22 20-31 27" stroke={limb} strokeWidth="13" strokeLinecap="round" /><circle cx="8" cy="138" r="10" fill={limb} /><path d="m7 134-5-5" stroke={limb} strokeWidth="7" strokeLinecap="round" /></g>
      <g className="launch-mascot-head">
        {caterpillar ? <>
          <path d="M71 47C63 19 47 15 44 23m53 18C92 9 76 3 73 13" stroke="#a15ced" strokeWidth="11" strokeLinecap="round" />
          <path d="M43 150C35 127 39 79 61 56c21-24 64-23 85 0 19 21 18 65 3 89-19 28-82 32-106 5Z" fill={body} stroke="#9763e4" strokeWidth="1.5" />
          <path d="M43 98c-8-55 102-87 115 1" stroke="#e1d2ff" strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="40" cy="114" rx="15" ry="24" fill="#dcd7ff" /><ellipse cx="38" cy="115" rx="11" ry="18" fill="#5fc9ff" /><path d="M34 123v-15l8 15v-15" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx="158" cy="109" rx="12" ry="22" fill="#c9baff" /><ellipse cx="161" cy="109" rx="7" ry="17" fill="#67cbff" />
        </> : <>
          <path d="M27 68C29 40 58 36 96 35c42-2 61 10 62 39l-2 66c-1 25-23 33-65 34l-36-1-27 17 5-30c-12-12-10-53-6-92Z" fill={body} stroke="#36baf1" strokeWidth="1.5" />
          <path d="M39 70c2-19 24-22 52-23" stroke="#a5f4ff" strokeWidth="4" strokeLinecap="round" opacity=".65" />
          {!friend && <path d="m130 22 9 13 15-2-5 15 8 12-16 2-9 13-8-14-16-3 10-12-2-15 14 5Z" fill="#69edec" stroke="#30d6e9" strokeWidth="2" strokeLinejoin="round" />}
        </>}
        <g className="launch-mascot-face">
          <ellipse cx="73" cy="103" rx="23" ry="28" fill={`url(#${id}-eye)`} /><ellipse cx="122" cy="99" rx="22" ry="27" fill={`url(#${id}-eye)`} />
          <g className="launch-mascot-pupils" fill={caterpillar ? '#411572' : '#0647bd'}><ellipse cx="77" cy="104" rx="12" ry="16" /><ellipse cx="125" cy="100" rx="12" ry="16" /><circle cx="80" cy="97" r="4" fill="white" /><circle cx="128" cy="93" r="4" fill="white" /></g>
          <g className="launch-mascot-worried" stroke={caterpillar ? '#6b2db4' : '#0855b7'} strokeWidth="5" strokeLinecap="round"><path d="M58 75q11 2 19-5m33-4q7 6 19 6" /><path d="M87 145q12-12 24-2" strokeWidth="4" /></g>
          <g className="launch-mascot-happy"><path d="M58 71q10-10 21-4m31-5q12-6 21 2" stroke={caterpillar ? '#6b2db4' : '#0855b7'} strokeWidth="5" strokeLinecap="round" /><path d="M81 136q19 11 40-3c1 16-7 25-19 25-12 0-19-7-21-22Z" fill={caterpillar ? '#471557' : '#064c9f'} /><path d="M91 153q10-11 21-2c-6 7-15 7-21 2Z" fill={caterpillar ? '#ff70bd' : '#42d5f6'} /></g>
          <ellipse cx="53" cy="128" rx="9" ry="5" fill={caterpillar ? '#ef96d8' : '#88e8ff'} opacity=".65" /><ellipse cx="145" cy="122" rx="8" ry="5" fill={caterpillar ? '#ef96d8' : '#88e8ff'} opacity=".65" />
        </g>
        {friend && <g className="launch-mascot-cap"><path d="M48 55C49 13 125 9 138 49l-44 9Z" fill="#fff1cf" stroke="#eaa752" strokeWidth="2" /><path d="m90 49 47-1c25 1 32 9 23 13-12 5-47 1-70-2Z" fill="#ff8b39" stroke="#e77324" strokeWidth="2" /><path d="M79 23q-7 12-5 28" stroke="#edc38b" strokeWidth="2" /><circle cx="93" cy="34" r="7" fill="#ff8b39" /><path d="m90 34 2 2 4-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>}
      </g>
      {friend && <g className="launch-mascot-scarf"><path d="m52 155 21 7-16 30-6-13-13 2Z" fill="#f27c2d" /><path d="m53 151 81-2-31 24Z" fill="#ff9f48" stroke="#ed7a2b" strokeWidth="2" strokeLinejoin="round" /><path d="m63 156 33 10" stroke="#ffd695" strokeWidth="3" strokeLinecap="round" /></g>}
      <g className="launch-mascot-arm launch-mascot-arm-right"><path d="M142 111c17 5 24 19 32 27" stroke={limb} strokeWidth="13" strokeLinecap="round" /><circle cx="174" cy="138" r="10" fill={limb} /><path d="m173 133 3-7" stroke={limb} strokeWidth="7" strokeLinecap="round" /></g>
    </g>
  </svg>;
}
