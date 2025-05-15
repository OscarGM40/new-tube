"use client";

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
// una section es siempre un ClientComponent

interface CategoriesSectionProps {
  categoryId?: string;
}
export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<FilterCarousel isLoading data={[]} />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};
const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };

  return <FilterCarousel value={categoryId} data={data} onSelect={onSelect}></FilterCarousel>;
};
