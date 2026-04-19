'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Text,
} from '@1d1s/design-system';
import { INQUIRY_FAQ_ITEMS } from '@constants/consts/inquiryData';
import { Mail } from 'lucide-react';
import React from 'react';

export default function InquiryPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white p-4">
      <section className="rounded-3 w-full bg-white p-2">
        <div className="flex flex-col gap-2 border-b border-gray-200 pb-5">
          <Text size="display1" weight="bold" className="text-gray-900">
            문의하기
          </Text>
          <Text size="body1" weight="regular" className="text-gray-600">
            궁금한 점이 있으시면 언제든지 문의해주세요.
          </Text>
        </div>

      <div className="flex w-full flex-1 flex-col">
        <div className="h-6" />

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
            문제가 발생하거나 추가됐으면 하는 기능이 있다면
            <br />
            아래 버튼을 통해 문의를 남겨주세요.
          </Text>

          <a
            href="https://forms.gle/yxgnTJdYViRmb2zR6"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-main-800 hover:bg-main-900 mb-10 flex w-full max-w-lg items-center justify-center rounded-2xl px-6 py-4 font-bold text-white transition-colors"
          >
            문의 남기기
          </a>
        </div>
      </div>
      </section>
    </div>
  );
}
