import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { InsightCardSkeleton } from "@/components/InsightCardSkeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-2/3" />
        <div className="flex gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <Separator />

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <InsightCardSkeleton />
      </div>
    </div>
  );
}
