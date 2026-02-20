import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 h-16 flex items-center shadow-sm">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
           <Skeleton className="h-8 w-32 bg-slate-100" />
           <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
        </div>
      </div>
      
      <main className="container mx-auto py-8 space-y-8 px-4 md:px-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48 bg-slate-200/60" />
          <Skeleton className="h-4 w-64 bg-slate-100" />
        </div>
        
        {/* Summary Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
               <Skeleton className="h-8 w-8 rounded-lg bg-slate-50" />
               <div className="space-y-2">
                 <Skeleton className="h-3 w-20 bg-slate-100" />
                 <Skeleton className="h-6 w-12 bg-slate-200/60" />
               </div>
            </div>
          ))}
        </div>

        {/* Sessions List Skeleton - Abstract blocks, no table lines */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <Skeleton className="h-5 w-32 bg-slate-100" />
          </div>
          <div className="p-8 space-y-6">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                   <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-slate-100" />
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-40 bg-slate-200/40" />
                         <Skeleton className="h-3 w-20 bg-slate-100" />
                      </div>
                   </div>
                   <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
                </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  )
}
