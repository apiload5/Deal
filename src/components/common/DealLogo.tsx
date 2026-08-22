import React from 'react';

interface DealLogoProps {
  variant?: 'orange' | 'white' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  onClick?: () => void;
}

export const DealLogo: React.FC<DealLogoProps> = ({
  variant = 'orange',
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
  onClick
}) => {
  const sizeMap = {
    xs: { emblemHeight: 'h-6', text: 'text-sm sm:text-base', sub: 'text-[7.5px]', gap: 'gap-1.5' },
    sm: { emblemHeight: 'h-7', text: 'text-base sm:text-lg', sub: 'text-[8.5px]', gap: 'gap-2' },
    md: { emblemHeight: 'h-8', text: 'text-lg sm:text-xl', sub: 'text-[9.5px]', gap: 'gap-2' },
    lg: { emblemHeight: 'h-10', text: 'text-xl sm:text-2xl', sub: 'text-[10.5px]', gap: 'gap-2.5' },
    xl: { emblemHeight: 'h-12', text: 'text-2xl sm:text-3xl', sub: 'text-[11.5px]', gap: 'gap-3' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const mainPathFill = variant === 'white' ? '#FFFFFF' : '#FF8C00';
  const secondPathFill = variant === 'white' ? '#FF8C00' : '#FFFFFF';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${currentSize.gap} ${onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''} ${className}`}
    >
      {/* Emblem Graphic */}
      <div className={`${currentSize.emblemHeight} aspect-[802/603] shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 802 603"
          className="w-full h-full object-contain filter drop-shadow-sm"
        >
          <path fill={mainPathFill} fillRule="evenodd" d="M 582,503 L 555,511 L 548,515 L 491,532 L 488,535 L 482,548 L 482,551 L 476,560 L 471,572 L 523,572 L 536,565 L 559,550 L 581,530 L 583,527 Z M 643,376 L 617,384 L 612,387 L 608,387 L 587,394 L 583,396 L 584,399 L 596,401 L 608,405 L 610,404 L 625,408 L 631,411 L 633,410 L 640,412 L 642,409 L 644,394 Z M 473,362 L 407,362 L 405,364 L 406,410 L 405,436 L 407,438 L 440,437 L 442,435 L 454,411 L 459,398 L 469,380 L 469,377 L 474,368 Z M 320,363 L 319,384 L 320,437 L 322,438 L 344,438 L 345,437 L 376,438 L 389,436 L 390,434 L 389,409 L 390,386 L 388,362 Z M 249,288 L 152,376 L 152,572 L 376,572 L 397,530 L 400,515 L 254,513 L 254,289 Z M 389,263 L 373,265 L 367,267 L 354,274 L 352,277 L 338,288 L 330,299 L 330,302 L 324,312 L 321,323 L 320,337 L 321,345 L 328,345 L 329,346 L 389,345 L 390,343 Z M 406,263 L 405,297 L 406,305 L 405,328 L 406,329 L 406,345 L 411,346 L 422,345 L 473,346 L 475,344 L 475,331 L 473,327 L 469,308 L 462,296 L 451,282 L 435,271 L 424,267 L 422,265 L 409,262 Z M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 512,462 L 532,411 L 556,390 L 683,348 L 689,387 Z M 634,290 L 615,241 L 584,196 L 395,30 L 229,179 L 227,132 L 243,128 L 242,94 L 136,95 L 137,129 L 153,131 L 152,248 L 30,360 L 144,362 L 397,136 L 506,240 L 542,321 Z"/>
          <path fill={secondPathFill} fillRule="evenodd" d="M 770,290 L 657,259 L 650,261 L 669,295 L 503,355 L 478,389 L 392,572 L 457,571 L 482,521 L 593,485 L 599,517 L 671,434 L 567,409 L 582,439 L 511,464 L 532,411 L 556,390 L 683,348 L 689,387 Z"/>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center whitespace-nowrap leading-none">
          <span className={`font-black tracking-tight ${currentSize.text} ${textClassName}`}>
            <span className={variant === 'white' ? 'text-white' : 'text-[#FF8C00]'}>Deal</span>
            <span className={variant === 'white' ? 'text-[#FF8C00]' : 'text-white'}>Fast</span>
          </span>
          <span className={`font-bold tracking-widest text-slate-400 uppercase mt-0.5 ${currentSize.sub}`}>
            Escrow Real Estate
          </span>
        </div>
      )}
    </div>
  );
};
