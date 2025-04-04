
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, ExternalLink, Calendar, User } from "lucide-react";
import type { FactCheckResult as FactCheckResultType } from "@/services/databaseService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FactCheckResultProps {
  result: FactCheckResultType | null;
}

const FactCheckResult: React.FC<FactCheckResultProps> = ({ result }) => {
  if (!result) return null;

  const { rating, confidence, claim, claimant, sources, reviewDate, url } = result.result;
  
  // Define rating colors and labels
  const getRatingInfo = (rating: string | undefined) => {
    const ratingMap: Record<string, { color: string; bg: string; darkColor: string; darkBg: string; label: string }> = {
      "True": { 
        color: "text-factcheck-green", 
        bg: "bg-factcheck-green/10", 
        darkColor: "dark:text-green-400", 
        darkBg: "dark:bg-green-500/20", 
        label: "True" 
      },
      "False": { 
        color: "text-factcheck-red", 
        bg: "bg-factcheck-red/10", 
        darkColor: "dark:text-red-400", 
        darkBg: "dark:bg-red-500/20", 
        label: "False" 
      },
      "Mixed": { 
        color: "text-factcheck-yellow", 
        bg: "bg-factcheck-yellow/10", 
        darkColor: "dark:text-yellow-300", 
        darkBg: "dark:bg-yellow-500/20", 
        label: "Mixed" 
      },
      "Unknown": { 
        color: "text-factcheck-gray", 
        bg: "bg-factcheck-gray/10", 
        darkColor: "dark:text-gray-300", 
        darkBg: "dark:bg-gray-500/20", 
        label: "Unknown" 
      },
      "Error": { 
        color: "text-destructive", 
        bg: "bg-destructive/10", 
        darkColor: "dark:text-red-400", 
        darkBg: "dark:bg-red-900/20", 
        label: "Error" 
      },
    };
    
    // Default to unknown if rating is not recognized
    return ratingMap[rating || "Unknown"] || ratingMap.Unknown;
  };

  const ratingInfo = getRatingInfo(rating);
  
  // Format the date
  const formattedDate = reviewDate ? new Date(reviewDate).toLocaleDateString() : null;
  
  // Get number of sources to display
  const sourceCount = sources?.length || (result.result.ratingSource ? 1 : 0);
  
  return (
    <Card className="w-full max-w-3xl dark:border-slate-700">
      <CardHeader className={`${ratingInfo.bg} ${ratingInfo.darkBg} border-b dark:border-slate-700`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Fact Check Result</CardTitle>
          <Badge className={`${ratingInfo.color} ${ratingInfo.darkColor} ${ratingInfo.bg} ${ratingInfo.darkBg} text-sm px-3 py-1`}>
            {ratingInfo.label}
          </Badge>
        </div>
        <CardDescription className="dark:text-slate-300">
          {result.isUrl ? "URL checked" : "Claim checked"}
          {sourceCount > 0 && ` • Verified by ${sourceCount} ${sourceCount === 1 ? 'source' : 'sources'}`}
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
        
        <Separator className="dark:bg-slate-700" />
        
        <div className="space-y-3">
          {/* Handle multiple sources if available */}
          {sources && sources.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Fact checked by {sources.length} {sources.length === 1 ? 'source' : 'sources'}:</h3>
              
              {sources.map((source, index) => (
                <div key={index} className="border rounded-md p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{source.name}</span>
                    {source.date && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(source.date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {source.conclusion && (
                    <p className="text-sm mt-2 text-muted-foreground">{source.conclusion}</p>
                  )}
                  {source.url && (
                    <Button variant="outline" size="sm" className="mt-2 text-xs" asChild>
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        View Original Fact Check
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Legacy single source display for backward compatibility */}
              {result.result.ratingSource && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Fact check by:</span>
                  <span className="font-medium">{result.result.ratingSource}</span>
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FactCheckResult;
