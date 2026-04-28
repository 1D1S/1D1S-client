'use client';

import { Text } from '@1d1s/design-system';
import { cn } from '@module/utils/cn';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  iconTone?: string;
  description?: string;
}

export function StatCard({
  icon,
  title,
  value,
  unit,
  iconTone = 'text-main-800',
  description,
}: StatCardProps): React.ReactElement {
  return (
    <article className="rounded-3 border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center',
            iconTone,
          )}
        >
          {icon}
        </span>
        <Text size="body1" weight="medium" className="text-gray-600">
          {title}
        </Text>
      </div>
      <div className="mt-3 flex min-w-0 items-baseline gap-1.5">
        <Text size="display2" weight="bold" className="text-gray-900">
          {value}
        </Text>
        <Text size="body1" weight="medium" className="text-gray-500">
          {unit}
        </Text>
        {description && (
          <Text
            size="body1"
            weight="medium"
            className="min-w-0 flex-1 truncate text-gray-500"
            title={description}
          >
            - {description}
          </Text>
        )}
      </div>
    </article>
  );
}
