import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function InsightCardSkeleton() {
  return (
    <Card className="w-full border-l-4 border-l-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <Separator />

        {/* Quality Scores Section */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>

        <Separator />

        {/* Risk Banner Placeholder */}
        <Skeleton className="h-16 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
