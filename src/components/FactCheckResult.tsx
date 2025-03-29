
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, ExternalLink, Calendar, User } from "lucide-react";
import { FactCheckResult } from "@/services/databaseService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FactCheckResultProps {
  result: FactCheckResult | null;
}

const FactCheckResult: React.FC<FactCheckResultProps> = ({ result }) => {
  if (!result) return null;

  const { rating, confidence, claim, claimant, ratingSource, reviewDate, url } = result.result;
  
  // Define rating colors and labels
  const getRatingInfo = (rating: string | undefined) => {
    const ratingMap: Record<string, { color: string; bg: string; label: string }> = {
      "True": { color: "text-factcheck-green", bg: "bg-factcheck-green/10", label: "True" },
      "False": { color: "text-factcheck-red", bg: "bg-factcheck-red/10", label: "False" },
      "Mixed": { color: "text-factcheck-yellow", bg: "bg-factcheck-yellow/10", label: "Mixed" },
      "Unknown": { color: "text-factcheck-gray", bg: "bg-factcheck-gray/10", label: "Unknown" },
      "Error": { color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
    };
    
    // Default to unknown if rating is not recognized
    return ratingMap[rating || "Unknown"] || ratingMap.Unknown;
  };

  const ratingInfo = getRatingInfo(rating);
  
  // Format the date
  const formattedDate = reviewDate ? new Date(reviewDate).toLocaleDateString() : null;
  
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className={`${ratingInfo.bg} border-b`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Fact Check Result</CardTitle>
          <Badge className={`${ratingInfo.color} ${ratingInfo.bg} text-sm px-3 py-1`}>
            {ratingInfo.label}
          </Badge>
        </div>
        <CardDescription>
          {result.isUrl ? "URL checked" : "Claim checked"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {result.isUrl ? "Source URL" : "Claim"}
          </h3>
          <p className="text-base font-medium">{claim || result.query}</p>
        </div>
        
        {claimant && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Claimed by:</span>
            <span className="font-medium">{claimant}</span>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Verification Confidence</h3>
            <span className="text-sm">{Math.round(confidence * 100)}%</span>
          </div>
          <Progress value={confidence * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            <Info className="h-3 w-3 inline mr-1" />
            Confidence based on number and quality of fact checks found
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          {ratingSource && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Fact check by:</span>
              <span className="font-medium">{ratingSource}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Reviewed on:</span>
              <span>{formattedDate}</span>
            </div>
          )}
          
          {url && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                View Original Fact Check
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FactCheckResult;
