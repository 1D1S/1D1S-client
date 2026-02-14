'use client';

import React, { useState } from 'react';
import {
  Text,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@1d1s/design-system';
import { Copy, Mail } from 'lucide-react';

const FAQ_ITEMS = [
  {
    id: 'item-1',
    question: '1D1S는 어떤 서비스인가요?',
    answer: '1D1S(One Day One Step)는 매일 하나의 챌린지에 도전하고 일지를 작성하며 성장하는 습관 형성 플랫폼입니다.',
  },
  {
    id: 'item-2',
    question: '챌린지는 어떻게 참여하나요?',
    answer: '챌린지 목록에서 원하는 챌린지를 선택한 후 상세 페이지 하단의 "챌린지 참여 신청" 버튼을 누르면 참여할 수 있습니다.',
  },
  {
    id: 'item-3',
    question: '일지는 언제 작성할 수 있나요?',
    answer: '참여 중인 챌린지가 있다면 언제든지 일지를 작성할 수 있습니다. 매일 기록하며 여러분의 성장을 확인해보세요!',
  },
];

export default function InquiryPage(): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const email = 'support@1d1s.com';

  const handleCopy = () => {
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
        <Text size="heading1" weight="bold" className="text-gray-900 mb-4">
          자주 묻는 질문 (FAQ)
        </Text>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-6">
            <Mail size={32} />
          </div>

          <Text size="heading1" weight="bold" className="text-gray-900 mb-2">
            무엇을 도와드릴까요?
          </Text>
          <Text size="body1" weight="medium" className="text-gray-500 mb-8">
            궁금한 점이 더 있으시다면<br />
            아래 이메일로 언제든지 연락주세요.
          </Text>

          <div className="flex w-full flex-col gap-4 rounded-2xl bg-gray-50 p-6 border border-gray-100 mb-10">
            <Text size="caption1" weight="bold" className="text-gray-400 text-left">
              고객센터 이메일
            </Text>
            <div className="flex items-center justify-between gap-4">
              <Text size="body1" weight="bold" className="text-gray-900 truncate">
                {email}
              </Text>
              <button 
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Copy size={16} />
                <span className="text-xs font-bold">{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
