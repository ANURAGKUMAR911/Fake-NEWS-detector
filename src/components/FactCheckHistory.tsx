
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { databaseService, FactCheckResult } from "@/services/databaseService";
import { History, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface FactCheckHistoryProps {
  onSelectResult: (result: FactCheckResult) => void;
}

const FactCheckHistory: React.FC<FactCheckHistoryProps> = ({ onSelectResult }) => {
  const [history, setHistory] = React.useState<FactCheckResult[]>([]);

  React.useEffect(() => {
    setHistory(databaseService.getHistory());
  }, []);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all fact check history?")) {
      databaseService.clearHistory();
      setHistory([]);
      toast.success("History cleared");
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    databaseService.deleteFactCheck(id);
    setHistory(databaseService.getHistory());
    toast.success("Item removed from history");
  };

  // Get rating badge color
  const getRatingBadgeClass = (rating: string | undefined) => {
    switch (rating) {
      case "True":
        return "bg-factcheck-green/10 text-factcheck-green";
      case "False":
        return "bg-factcheck-red/10 text-factcheck-red";
      case "Mixed":
        return "bg-factcheck-yellow/10 text-factcheck-yellow";
      default:
        return "bg-factcheck-gray/10 text-factcheck-gray";
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-medium">
            <History className="h-5 w-5 inline mr-2" />
            Check History
          </CardTitle>
          <CardDescription>Your recent fact checking activity</CardDescription>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="h-8 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No fact checking history yet</p>
            <p className="text-sm mt-1">Your checked claims will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectResult(item)}
                className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium truncate flex-1 mr-2">
                    {item.isUrl ? "URL: " : ""}
                    {item.query.length > 60
                      ? `${item.query.substring(0, 60)}...`
                      : item.query}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge
                      className={`${getRatingBadgeClass(
                        item.result.rating
                      )} text-xs`}
                    >
                      {item.result.rating || "Unknown"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FactCheckHistory;
