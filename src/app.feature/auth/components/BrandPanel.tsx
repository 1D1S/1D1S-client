import { Icon, Stripe, Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import Link from 'next/link';

interface BrandPanelProps {
  heading: string;
  subtitle: string;
  className?: string;
}

const FOOTER_CHIPS: Array<{
  tone: string;
  name: string;
  text: string;
}> = [
  { tone: '#ffe0b2', name: '@minji', text: '5km 완주했어요' },
  { tone: '#c8f4e1', name: '@bookworm', text: '오늘 한 챕터 끝!' },
  { tone: '#deecfb', name: '@coder', text: '백준 골드 달성' },
];

export function BrandPanel({
  heading,
  subtitle,
  className,
}: BrandPanelProps): React.ReactElement {
  return (
    <section
      className={cn(
        'relative hidden overflow-hidden px-12 py-10 text-white lg:flex',
        'flex-col justify-between',
        'bg-[linear-gradient(160deg,#ff8a65_0%,#ff5722_60%,#ff3d00_100%)]',
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-20 -right-16 h-72 w-72',
          'rounded-full bg-white/15'
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -bottom-24 -left-12 h-60 w-60',
          'rounded-full bg-white/10'
        )}
      />

      <Link
        href="/"
        aria-label="홈으로 이동"
        className={cn(
          'relative flex w-fit items-center gap-3 rounded-[12px]',
          'transition-opacity hover:opacity-90 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-transparent'
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[10px]',
            'bg-white/25 text-white shadow-[0_6px_18px_rgba(0,0,0,0.18)]'
          )}
        >
          <Icon name="Logo" size={20} className="text-white" />
        </span>
        <Text size="heading2" weight="extrabold" className="text-white">
          1Day 1Streak
        </Text>
      </Link>

      <div className="relative">
        <div
          className={cn(
            'relative mb-7 flex h-[132px] w-[132px] items-center justify-center',
            'rounded-full border border-white/30 bg-white/15 backdrop-blur-md'
          )}
        >
          <span aria-hidden className="text-[56px] leading-none">
            🔥
          </span>
          <span
            className={cn(
              'text-main-800 absolute -right-1 -bottom-2 rounded-full',
              'bg-white px-3 py-[6px] text-[13px] font-extrabold',
              'shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
            )}
          >
            +27일
          </span>
        </div>
        <Text
          size="display1"
          weight="extrabold"
          as="h2"
          className="block whitespace-pre-line text-white"
        >
          {heading}
        </Text>
        <Text
          size="body1"
          weight="regular"
          as="p"
          className="mt-3 block max-w-[380px] whitespace-pre-line text-white/90"
        >
          {subtitle}
        </Text>
      </div>

      <div className="relative flex gap-2.5">
        {FOOTER_CHIPS.map((chip) => (
          <div
            key={chip.name}
            className={cn(
              'flex flex-1 flex-col gap-1.5 rounded-xl border border-white/20',
              'bg-white/15 px-3 py-2.5 backdrop-blur-sm'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="h-[22px] w-[22px] overflow-hidden rounded-full">
                <Stripe tone={chip.tone} label="" radius={0} />
              </span>
              <Text
                size="caption2"
                weight="bold"
                className="text-white/95"
              >
                {chip.name}
              </Text>
            </div>
            <Text size="caption2" weight="regular" className="text-white/90">
              {chip.text}
            </Text>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-12 right-12 hidden items-center',
          'gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11px]',
          'font-bold text-white backdrop-blur-sm xl:flex'
        )}
      >
        <Icon name="People" size={12} className="text-white" />
        12,847명 참여 중
      </div>
    </section>
  );
}
