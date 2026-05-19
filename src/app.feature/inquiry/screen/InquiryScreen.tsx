'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Text,
} from '@1d1s/design-system';
import { INQUIRY_FAQ_ITEMS } from '@constants/consts/inquiryData';
import { cn } from '@module/utils/cn';
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const INQUIRY_FORM_URL = 'https://forms.gle/yxgnTJdYViRmb2zR6';

export function InquiryScreen(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full pt-14 lg:pt-0">
      <div
        className={cn(
          'fixed top-0 right-0 left-0 z-30 flex h-14 items-center gap-3',
          'border-b border-gray-100 bg-white/95 px-4 backdrop-blur',
          'lg:hidden'
        )}
      >
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'text-gray-700 transition-colors hover:bg-gray-100'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Text
          size="body1"
          weight="extrabold"
          className="flex-1 tracking-[-0.3px] text-gray-900"
        >
          문의하기
        </Text>
      </div>

      <section className="mx-auto w-full max-w-[980px] p-4 lg:p-6">
        <div className="hidden border-b border-gray-200 pb-5 lg:block">
          <Text
            size="pageTitle"
            weight="extrabold"
            className="tracking-tight text-gray-900"
          >
            문의하기
          </Text>
          <Text
            size="body2"
            weight="regular"
            className="mt-2 block text-gray-500"
          >
            궁금한 점이 있으시면 언제든지 문의해주세요.
          </Text>
        </div>

        <div className="mt-6 flex flex-col gap-3">
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
                    <Text
                      size="body2"
                      weight="regular"
                      className="text-gray-500"
                    >
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
                  <Text
                    size="body1"
                    weight="bold"
                    className="text-gray-900"
                  >
                    무엇을 도와드릴까요?
                  </Text>
                  <Text
                    size="caption1"
                    weight="regular"
                    className="text-gray-500"
                  >
                    문제가 발생하거나 추가됐으면 하는 기능이 있다면 아래
                    버튼을 통해 문의를 남겨주세요.
                  </Text>
                </div>
              </div>

              <a
                href={INQUIRY_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="primary" size="medium" className="w-full">
                  문의 남기기
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
