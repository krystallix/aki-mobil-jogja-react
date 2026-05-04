'use client';

import { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBarProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setProgress(30);
    const timeout = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <>
      <LoadingBar
        color="#6366f1"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {children}
    </>
  );
}
