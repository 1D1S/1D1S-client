'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { OdosLabel } from './label';

const menuItems = [
  { label: '챌린지', path: '/challenge/list' },
  { label: '일지', path: '/diary/list' },
  { label: '마이페이지', path: '/mypage' },
];

export function OdosMenu(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  // ESC로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 햄버거 버튼 */}
      <div
        className="rounded-odos-2 shadow-odos-default fixed top-4 left-4 z-50 flex h-15 w-15 cursor-pointer items-center justify-center bg-white"
        onClick={() => setIsOpen(true)}
      >
        <Image src="/images/hamburger-menu.png" alt="hamburger-menu" width={18} height={18} />
      </div>

      {/* 오버레이 배경 */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsOpen(false)} />
      )}

      {/* 드로어 메뉴 */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-75 bg-white shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-4">
          <button className="text-gray-500 hover:text-black" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="p-6">
          <ul className="space-y-4">
            {menuItems.map(({ label, path }) => (
              <li key={path}>
                <Link
                  href={path}
                  onClick={() => setIsOpen(false)}
                  className="mb-5 block text-lg text-gray-700 transition-colors duration-200 hover:text-black"
                >
                  <OdosLabel size={'display2'} weight={'bold'}>
                    {label}
                  </OdosLabel>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
