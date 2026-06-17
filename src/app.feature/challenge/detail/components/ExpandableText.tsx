'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React, { useEffect, useRef, useState } from 'react';

interface ExpandableTextProps {
  children: string;
  className?: string;
}

export function ExpandableText({
  children,
  className,
}: ExpandableTextProps): React.ReactElement {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const measure = (): void => {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <p
        ref={ref}
        className={cn(
          'break-keep whitespace-pre-wrap text-gray-600',
          !isExpanded && 'line-clamp-1',
          className
        )}
      >
        {children}
      </p>
      {isOverflowing || isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-1"
        >
          <Text size="body2" weight="medium" className="text-gray-400">
            {isExpanded ? '접기' : '더보기'}
          </Text>
        </button>
      ) : null}
    </div>
  );
}
