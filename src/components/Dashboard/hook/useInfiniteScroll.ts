import { useEffect, useRef } from "react";

export const useInfiniteScroll = (
  hasNextPage: boolean,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  rootRef: React.RefObject<HTMLDivElement>| null
) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerRef.current || !rootRef?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      {
        root: rootRef.current, // 🔥 important
        threshold: 0.1,
      }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootRef]);

  return observerRef;
};