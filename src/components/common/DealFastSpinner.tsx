'use client';
import React from 'react';

interface DealFastSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

// EXACT OFFICIAL LOGO EMBLEM PATHS (802x603)
const PATH_D =
  "M 582,503 L 555,511 L 548,515 L 491,532 L 488,535 L 482,548 L 482,551 L 476,560 L 471,572 L 523,572 L 536,565 L 559,550 L 581,530 L 583,527 Z M 643,376 L 617,384 L 612,387 L 608,387 L 587,394 L 583,396 L 584,399 L 596,401 L 608,405 L 610,404 L 625,408 L 631,411 L 633,410 L 640,412 L 642,409 L 644,394 Z M 473,362 L 407,362 L 405,364 L 406,410 L 405,436 L 407,438 L 440,437 L 442,435 L 454,411 L 459,398 L 469,380 L 469,377 L 474,368 Z M 320,363 L 319,384 L 320,437 L 322,438 L 344,438 L 345,437 L 376,438 L 389,436 L 390,434 L 389,409 L 390,386 L 388,362 Z M 249,288 L 152,376 L 152,572 L 376,572 L 397,530 L 400,515 L 254,513 L 254,289 Z M 389,263 L 373,265 L 367,267 L 354,274 L 352,277 L 338,288 L 330,299 L 330,302 L 324,312 L 321,323 L 320,337 L 321,345 L 328,345 L 329,346 L 389,345 L 390,343 Z M 406,263 L 405,297 L 406,305 L 405,328 L 406,329 L 406,345 L 411,346 L 422,345 L 473,346 L 475,344 L 475,331 L 473,327 L 469,308 L 462,296 L 451,282 L 435,271 L 424,267 L 422,265 L 409,262 Z M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 512,462 L 532,411 L 556,390 L 683,348 L 689,387 Z M 634,290 L 615,241 L 584,196 L 395,30 L 229,179 L 227,132 L 243,128 L 242,94 L 136,95 L 137,129 L 153,131 L 152,248 L 30,360 L 144,362 L 397,136 L 506,240 L 542,321 Z";

const PATH_F =
  "M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 511,464 L 532,411 L 556,390 L 683,348 L 689,387 Z";

// OFFICIAL INTERNAL WINDOW SUB-PATHS INSIDE LOGO D
const WINDOW_LEFT =
  "M 320,363 L 319,384 L 320,437 L 322,438 L 344,438 L 345,437 L 376,438 L 389,436 L 390,434 L 389,409 L 390,386 L 388,362 Z";

const WINDOW_RIGHT =
  "M 473,362 L 407,362 L 405,364 L 406,410 L 405,436 L 407,438 L 440,437 L 442,435 L 454,411 L 459,398 L 469,380 L 469,377 L 474,368 Z";

const WINDOW_ARCH_LEFT =
  "M 389,263 L 373,265 L 367,267 L 354,274 L 352,277 L 338,288 L 330,299 L 330,302 L 324,312 L 321,323 L 320,337 L 321,345 L 328,345 L 329,346 L 389,345 L 390,343 Z";

const WINDOW_ARCH_RIGHT =
  "M 406,263 L 405,297 L 406,305 L 405,328 L 406,329 L 406,345 L 411,346 L 422,345 L 473,346 L 475,344 L 475,331 L 473,327 L 469,308 L 462,296 L 451,282 L 435,271 L 424,267 L 422,265 L 409,262 Z";

export const DealFastSpinner: React.FC<DealFastSpinnerProps> = ({
  size = 'md',
  className = '',
  text = 'LOADING DEALFAST REAL ESTATE PORTAL...'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-56 h-56',
    xl: 'w-80 h-80'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 p-2 bg-transparent ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center bg-transparent`}>
        <svg
          viewBox="0 0 802 603"
          className="w-full h-full overflow-visible bg-transparent"
          style={{ background: 'transparent' }}
        >
          <defs>
            {/* Rich Neon Glow Filter for D */}
            <filter id="dNeonOrangeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="16" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Continuous Silver/White Neon Glow Filter for F */}
            <filter id="fNeonContinuousGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur1" />
              <feGaussianBlur stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Crisp Clean Window Illumination Filter (Centered, no offset) */}
            <filter id="windowGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. FAINT BASE OUTLINE OF D EMBLEM (SUBTLE BACKGROUND GUIDE) */}
          <path
            d={PATH_D}
            fillRule="evenodd"
            fill="rgba(255, 140, 0, 0.12)"
          />

          {/* 2. OFFICIAL D EMBLEM BUILDING CLOCKWISE FROM TOP-RIGHT */}
          <path
            d={PATH_D}
            fillRule="evenodd"
            fill="#FF8C00"
            filter="url(#dNeonOrangeGlow)"
            className="df-d-clockwise-build"
          />

          {/* 3. OFFICIAL WINDOWS ILLUMINATION (Stays hidden until D finishes, then lights up strictly in Orange) */}
          <g className="df-official-windows-illumination">
            <path d={WINDOW_LEFT} fill="#FF8C00" filter="url(#windowGlowFilter)" />
            <path d={WINDOW_RIGHT} fill="#FF8C00" filter="url(#windowGlowFilter)" />
            <path d={WINDOW_ARCH_LEFT} fill="#FF8C00" filter="url(#windowGlowFilter)" />
            <path d={WINDOW_ARCH_RIGHT} fill="#FF8C00" filter="url(#windowGlowFilter)" />
          </g>

          {/* 4. SILVER/WHITE 'F' EMBLEM - CONTINUOUS MUSALSAL NEON LIGHT */}
          <path
            d={PATH_F}
            fillRule="evenodd"
            fill="#FFFFFF"
            filter="url(#fNeonContinuousGlow)"
            className="df-f-continuous-neon"
          />
        </svg>
      </div>

      {text && (
        <p className="text-xs font-bold text-orange-400 tracking-wider uppercase animate-pulse text-center drop-shadow-md">
          {text}
        </p>
      )}

      {/* Pure CSS Animations */}
      <style>{`
        /* 1. Clockwise Conic Mask Build for D starting from top-right (0deg) at exact window center (49.5% 58%) */
        .df-d-clockwise-build {
          mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, transparent 0deg);
          -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, transparent 0deg);
          animation: df-d-clockwise-sweep 3.2s infinite ease-in-out;
        }

        /* 2. Windows Glow upon D completion */
        .df-official-windows-illumination {
          animation: df-windows-glow-cycle 3.2s infinite ease-in-out;
        }

        /* 3. Continuous Musalsal Neon Light for F Emblem */
        .df-f-continuous-neon {
          animation: df-f-neon-pulse 2.5s infinite ease-in-out;
        }

        @keyframes df-d-clockwise-sweep {
          0% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, transparent 0deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, transparent 0deg, transparent 360deg);
          }
          2.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 18deg, transparent 18deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 18deg, transparent 18deg, transparent 360deg);
          }
          5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 36deg, transparent 36deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 36deg, transparent 36deg, transparent 360deg);
          }
          7.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 54deg, transparent 54deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 54deg, transparent 54deg, transparent 360deg);
          }
          10% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 72deg, transparent 72deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 72deg, transparent 72deg, transparent 360deg);
          }
          12.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 90deg, transparent 90deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 90deg, transparent 90deg, transparent 360deg);
          }
          15% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 108deg, transparent 108deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 108deg, transparent 108deg, transparent 360deg);
          }
          17.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 126deg, transparent 126deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 126deg, transparent 126deg, transparent 360deg);
          }
          20% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 144deg, transparent 144deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 144deg, transparent 144deg, transparent 360deg);
          }
          22.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 162deg, transparent 162deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 162deg, transparent 162deg, transparent 360deg);
          }
          25% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 180deg, transparent 180deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 180deg, transparent 180deg, transparent 360deg);
          }
          27.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 198deg, transparent 198deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 198deg, transparent 198deg, transparent 360deg);
          }
          30% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 216deg, transparent 216deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 216deg, transparent 216deg, transparent 360deg);
          }
          32.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 234deg, transparent 234deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 234deg, transparent 234deg, transparent 360deg);
          }
          35% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 252deg, transparent 252deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 252deg, transparent 252deg, transparent 360deg);
          }
          37.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 270deg, transparent 270deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 270deg, transparent 270deg, transparent 360deg);
          }
          40% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 288deg, transparent 288deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 288deg, transparent 288deg, transparent 360deg);
          }
          42.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 306deg, transparent 306deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 306deg, transparent 306deg, transparent 360deg);
          }
          45% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 324deg, transparent 324deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 324deg, transparent 324deg, transparent 360deg);
          }
          47.5% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 342deg, transparent 342deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 342deg, transparent 342deg, transparent 360deg);
          }
          50%, 85% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, #000 0deg, #000 360deg);
            filter: drop-shadow(0 0 16px rgba(255, 140, 0, 0.95));
          }
          95%, 100% {
            mask-image: conic-gradient(from 0deg at 49.5% 58%, transparent 0deg, transparent 360deg);
            -webkit-mask-image: conic-gradient(from 0deg at 49.5% 58%, transparent 0deg, transparent 360deg);
          }
        }

        @keyframes df-windows-glow-cycle {
          0%, 50% {
            opacity: 0;
            visibility: hidden;
          }
          52% {
            opacity: 1;
            visibility: visible;
            filter: drop-shadow(0 0 10px #FF8C00) drop-shadow(0 0 20px #FF8C00);
          }
          62% {
            opacity: 0.3;
            visibility: visible;
          }
          72% {
            opacity: 1;
            visibility: visible;
            filter: drop-shadow(0 0 14px #FF8C00) drop-shadow(0 0 28px #FF7700);
          }
          85% {
            opacity: 1;
            visibility: visible;
            filter: drop-shadow(0 0 10px #FF8C00);
          }
          95%, 100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes df-f-neon-pulse {
          0%, 100% {
            opacity: 0.9;
            filter: drop-shadow(0 0 8px #FFFFFF) drop-shadow(0 0 16px #CBD5E1) drop-shadow(0 0 25px #94A3B8);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 12px #FFFFFF) drop-shadow(0 0 24px #E2E8F0) drop-shadow(0 0 35px #CBD5E1);
          }
        }
      `}</style>
    </div>
  );
};

export default DealFastSpinner;

