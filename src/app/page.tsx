import HomeScreen from '@feature/home/screen/home-screen';
import React, { Suspense } from 'react';

export default function MainPage(): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
