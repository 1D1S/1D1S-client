import React from 'react';

export default function ChallengeDetailLoading(): React.ReactElement {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <p className="text-xl font-medium text-gray-400">불러오는 중...</p>
    </div>
  );
}
