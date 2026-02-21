'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Text,
} from '@1d1s/design-system';
import { INQUIRY_FAQ_ITEMS } from '@constants/consts/inquiry-data';
import { Copy, Mail } from 'lucide-react';
import React, { useState } from 'react';

export default function InquiryPage(): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const email = 'support@1d1s.com';

  const handleCopy = (): void => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="flex w-full flex-col items-center pt-16">
        <Text size="display1" weight="bold" className="text-gray-900">
          문의하기
        </Text>
      </div>

      {/* 모바일 뷰 기준 컨테이너 (레이아웃에서 제어됨) */}
      <div className="flex w-full flex-1 flex-col px-6">
        <div className="h-10" />

        {/* FAQ 섹션 */}
        <Text size="heading1" weight="bold" className="mb-4 text-gray-900">
          자주 묻는 질문 (FAQ)
        </Text>
        <Accordion type="single" collapsible className="w-full">
          {INQUIRY_FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <Text size="body1" weight="bold" className="text-left">
                  {item.question}
                </Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text size="body2" weight="medium" className="text-gray-600">
                  {item.answer}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="h-20" />

        {/* 1:1 문의 섹션 */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Mail size={32} />
          </div>

          <Text size="heading1" weight="bold" className="mb-2 text-gray-900">
            무엇을 도와드릴까요?
          </Text>
          <Text size="body1" weight="medium" className="mb-8 text-gray-500">
            궁금한 점이 더 있으시다면
            <br />
            아래 이메일로 언제든지 연락주세요.
          </Text>

          <div className="mb-10 flex w-full flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <Text
              size="caption1"
              weight="bold"
              className="text-left text-gray-400"
            >
              고객센터 이메일
            </Text>
            <div className="flex items-center justify-between gap-4">
              <Text
                size="body1"
                weight="bold"
                className="truncate text-gray-900"
              >
                {email}
              </Text>
              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 text-blue-600 transition-colors hover:text-blue-700"
              >
                <Copy size={16} />
                <span className="text-xs font-bold">
                  {copied ? '복사됨' : '복사'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
