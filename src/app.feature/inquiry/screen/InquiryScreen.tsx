'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Text,
} from '@1d1s/design-system';
import { SubPageShell } from '@component/layout/SubPageShell';
import {
  DISCORD_INVITE_URL,
  INQUIRY_ABOUT_ITEMS,
  INQUIRY_FAQ_ITEMS,
} from '@constants/consts/inquiryData';
import { cn } from '@module/utils/cn';
import { ExternalLink, Mail, MessagesSquare } from 'lucide-react';
import React from 'react';

const INQUIRY_FORM_URL = 'https://forms.gle/yxgnTJdYViRmb2zR6';

/** 답변 본문에 포함된 디스코드 초대 링크를 클릭 가능한 새 탭 앵커로 렌더링. */
function renderAnswer(answer: string): React.ReactNode {
  const parts = answer.split(DISCORD_INVITE_URL);
  if (parts.length === 1) {
    return answer;
  }
  return (
    <>
      {parts[0]}
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5865F2] underline underline-offset-2"
      >
        {DISCORD_INVITE_URL}
      </a>
      {parts[1]}
    </>
  );
}

export function InquiryScreen(): React.ReactElement {
  return (
    <SubPageShell
      title="문의하기"
      description="궁금한 점이 있으시면 언제든지 문의해주세요."
    >
      <div className="flex flex-col gap-3">
        <section className="rounded-4 border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Text size="body1" weight="bold" className="text-gray-500">
              자주 묻는 질문
            </Text>
          </div>

          <Accordion
            type="single"
            collapsible
            className="divide-y divide-gray-100"
          >
            {INQUIRY_FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-0 px-5"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <Text
                    size="body1"
                    weight="medium"
                    className="text-left text-gray-800"
                  >
                    {item.question}
                  </Text>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Text size="body2" weight="regular" className="text-gray-500">
                    {item.answer}
                  </Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="rounded-4 border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Text size="body1" weight="bold" className="text-gray-500">
              1D1S에 관해
            </Text>
          </div>

          <Accordion
            type="single"
            collapsible
            className="divide-y divide-gray-100"
          >
            {INQUIRY_ABOUT_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-0 px-5"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <Text
                    size="body1"
                    weight="medium"
                    className="text-left text-gray-800"
                  >
                    {item.question}
                  </Text>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Text
                    size="body2"
                    weight="regular"
                    className="whitespace-pre-line text-gray-500"
                  >
                    {renderAnswer(item.answer)}
                  </Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="rounded-4 border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <Text size="body1" weight="bold" className="text-gray-500">
              1:1 문의
            </Text>
          </div>

          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center',
                  'bg-main-50 text-main-800 rounded-full'
                )}
                aria-hidden
              >
                <Mail className="h-5 w-5" />
              </span>
              <div className="flex flex-col gap-1">
                <Text size="body1" weight="bold" className="text-gray-900">
                  무엇을 도와드릴까요?
                </Text>
                <Text size="caption1" weight="regular" className="text-gray-500">
                  문제가 발생하거나 추가됐으면 하는 기능이 있다면 아래 버튼을
                  통해 문의를 남겨주세요.
                </Text>
              </div>
            </div>

            <a
              href={INQUIRY_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="primary" size="md" className="w-full">
                문의 남기기
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>

        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'rounded-4 flex items-center gap-3 px-5 py-4',
            'border border-[#5865F2]/20 bg-[#5865F2]/5',
            'transition-colors hover:bg-[#5865F2]/10'
          )}
        >
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center',
              'rounded-full bg-[#5865F2] text-white'
            )}
            aria-hidden
          >
            <MessagesSquare className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text size="body1" weight="bold" className="text-gray-900">
              디스코드 참여하기
            </Text>
            <Text size="caption1" weight="regular" className="text-gray-500">
              1D1S 동아리 채널에서 함께 이어가요.
            </Text>
          </div>
          <ExternalLink className="ml-auto h-4 w-4 shrink-0 text-[#5865F2]" />
        </a>
      </div>
    </SubPageShell>
  );
}
