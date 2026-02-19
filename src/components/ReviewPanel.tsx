
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types corresponding to Prisma enums/models
type ReviewDecision = "VALIDATED" | "REJECTED";
type RiskStatus = "SAFE" | "RISK";

interface ReviewPanelProps {
  sessionId: string;
  existingReview?: {
    decision: ReviewDecision;
    overrideStatus: RiskStatus | null;
    note: string | null;
    reviewedAt: Date | string;
  } | null;
}

const formSchema = z.object({
  overrideStatus: z.enum(["SAFE", "RISK"], {
    message: "Please select an override status.",
  }),
  note: z.string().min(10, {
    message: "Note must be at least 10 characters.",
  }),
});

export function ReviewPanel({ sessionId, existingReview }: ReviewPanelProps) {
  const router = useRouter();
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  });

  const handleValidate = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "VALIDATED" }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      toast.success("Review submitted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Submission failed — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitRejection = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "REJECTED",
          overrideStatus: values.overrideStatus,
          note: values.note,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      toast.success("Review submitted successfully");
      router.refresh();
      setIsRejecting(false); // Reset/hide form
    } catch (error) {
      toast.error("Submission failed — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReview) {
    const isValidated = existingReview.decision === "VALIDATED";
    const date = new Date(existingReview.reviewedAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <Card className="border-t-4 border-t-[#2D6A4F] mt-8 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-[#2D6A4F]">
            <ClipboardCheck className="h-5 w-5" />
            Supervisor Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <Alert variant={isValidated ? "default" : "destructive"} className={isValidated ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            {isValidated ? (
               <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
               <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle className="flex items-center gap-2 mb-2">
              Review Status: 
              <Badge variant={isValidated ? "default" : "destructive"} className={isValidated ? "bg-green-600 hover:bg-green-700" : ""}>
                {existingReview.decision}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm">
               <p className="mb-2">Reviewed on {date}</p>
               
               {existingReview.overrideStatus && (
                 <p className="font-medium mb-1">
                   Risk status overridden to: {existingReview.overrideStatus}
                 </p>
               )}
               
               {existingReview.note && (
                 <p className="text-muted-foreground italic text-sm mt-2 border-l-2 pl-3 border-slate-300">
                   "{existingReview.note}"
                 </p>
               )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-4 border-t-[#2D6A4F] mt-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-[#2D6A4F]">
          <ClipboardCheck className="h-5 w-5" />
          Supervisor Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Separator />
        
        {!isRejecting ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
                onClick={handleValidate} 
                disabled={isSubmitting}
                className="flex-1 bg-green-700 hover:bg-green-800 text-white"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Validate AI Findings
            </Button>
            
            <Button 
                variant="outline"
                onClick={() => setIsRejecting(true)}
                disabled={isSubmitting}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reject / Override
            </Button>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-gray-900">Reject Analysis Findings</h3>
                 <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)} disabled={isSubmitting}>
                    Cancel
                 </Button>
             </div>
             
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmitRejection)} className="space-y-4">
                 <FormField
                   control={form.control}
                   name="overrideStatus"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Override Risk Status</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select new status" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="SAFE">SAFE - No risk detected</SelectItem>
                           <SelectItem value="RISK">RISK - Protocol risk present</SelectItem>
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 
                 <FormField
                   control={form.control}
                   name="note"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Supervisor Note</FormLabel>
                       <FormControl>
                         <Textarea 
                           placeholder="Explain why you are rejecting the AI findings..." 
                           className="resize-none min-h-[100px]" 
                           {...field} 
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 
                 <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting} variant="destructive">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                 </div>
               </form>
             </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
