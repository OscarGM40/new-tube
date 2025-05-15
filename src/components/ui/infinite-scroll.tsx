import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./button";

interface InfiniteScrollProps {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteScroll = ({
  isManual,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    // when the target element with the ref crosses the threshold the callback is called (O will call the cb in the first pixel, 1.0 after the last pixel)
    threshold: 0.5,
    rootMargin: "100px", // margin of the root's bounding box(es como margin en CSS, acepta varios valores como "0px 0px 0px 0px" o "100px")
    // the bounding box of an element is the smallest possible rectangle that entirely encloses it and its descendants
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting, isManual]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">You have reached the end of the list</p>
      )}
    </div>
  );
};
