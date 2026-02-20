
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ClipboardCheck, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
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
    const date = new Date(existingReview.reviewedAt).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <Card className="border-t-[6px] border-t-[#064E3B] mt-12 shadow-sm bg-white overflow-hidden">
        <CardHeader className="pb-2 bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#064E3B]">
            <ClipboardCheck className="h-4 w-4" />
            Supervisor Review Record
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant={isValidated ? "default" : "destructive"} className={isValidated ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"}>
            {isValidated ? (
               <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
               <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <AlertTitle className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold uppercase tracking-tight">Review Outcome:</span> 
              <Badge variant={isValidated ? "default" : "destructive"} className={isValidated ? "bg-emerald-600 hover:bg-emerald-700 px-3" : "px-3"}>
                {existingReview.decision}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm space-y-3">
               <p className="font-medium text-slate-600">Archived on {date}</p>
               
               {existingReview.overrideStatus && (
                 <div className="bg-white/60 p-2 rounded border border-current/10 inline-block">
                    <p className="font-bold text-xs uppercase tracking-tight">
                      System Override: <span className="text-red-700">{existingReview.overrideStatus}</span>
                    </p>
                 </div>
               )}
               
               {existingReview.note && (
                 <div className="mt-4 pt-4 border-t border-current/10">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Supervisor Notes</p>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{existingReview.note}"
                    </p>
                 </div>
               )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-[6px] border-t-[#064E3B] mt-12 shadow-md bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      <CardHeader className="pb-4 bg-slate-50/50 border-b">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#064E3B]">
          <ClipboardCheck className="h-4 w-4" />
          Supervisor Validation Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-8 px-8">
        {!isRejecting ? (
          <div className="flex flex-col md:flex-row gap-6">
            <Button 
                onClick={handleValidate} 
                disabled={isSubmitting}
                className="flex-[2] h-14 bg-[#064E3B] hover:bg-[#032F24] text-white text-lg font-bold shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
              Validate Analysis
            </Button>
            
            <Button 
                variant="outline"
                onClick={() => setIsRejecting(true)}
                disabled={isSubmitting}
                className="flex-1 h-14 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-semibold"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Flag / Override
            </Button>
          </div>
        ) : (
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-inner">
             <div className="flex items-center justify-between mb-6">
                 <div className="space-y-1">
                    <h3 className="font-bold text-[#991b1b] uppercase text-xs tracking-widest">Override Protocol</h3>
                    <p className="text-sm text-slate-500">Provide justification for rejecting automated findings.</p>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => setIsRejecting(false)} disabled={isSubmitting} className="hover:bg-slate-200 font-bold text-xs uppercase">
                    Cancel
                 </Button>
             </div>
             
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmitRejection)} className="space-y-6">
                 <FormField
                   control={form.control}
                   name="overrideStatus"
                   render={({ field }) => (
                     <FormItem className="space-y-3">
                       <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600">Corrected Risk Status</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger className="h-12 bg-white">
                             <SelectValue placeholder="Determine safety status" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="SAFE">SAFE — No clinical risk flags</SelectItem>
                           <SelectItem value="RISK">RISK — Significant protocol risk</SelectItem>
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
                     <FormItem className="space-y-3">
                       <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Justification</FormLabel>
                       <FormControl>
                         <Textarea 
                           placeholder="Document your clinical reasoning for this override..." 
                           className="resize-none min-h-[120px] bg-white p-4" 
                           {...field} 
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 
                 <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} variant="destructive" className="w-full h-12 font-bold uppercase tracking-widest">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Clinical Review
                    </Button>
                 </div>
               </form>
             </Form>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-3 border border-slate-100 italic">
            <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-normal font-medium">
                Validation confirms the accuracy of AI-detected scores and risk flags. 
                All reviews are logged for audit and quality assurance purposes.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
