
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { factCheck, fallbackFactCheck, isUrl, setApiKey, getApiKey } from "@/services/factCheckService";
import { Loader2, Search, LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface FactCheckFormProps {
  onResultReceived: (result: any) => void;
}

const FactCheckForm: React.FC<FactCheckFormProps> = ({ onResultReceived }) => {
  const [query, setQuery] = useState("");
  const [apiKey, setApiKeyState] = useState(getApiKey() || "");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("text");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.warning("Please enter some text or a URL to fact check");
      return;
    }
    
    if (!apiKey.trim()) {
      toast.warning("Please enter your Google Fact Check API key");
      return;
    }
    
    setApiKey(apiKey.trim());
    setLoading(true);
    
    try {
      // Use the appropriate API based on input type
      const result = await factCheck(query.trim());
      onResultReceived(result);
      
      if (result.result.confidence === 0) {
        toast.info("No fact checks found. Trying fallback method...");
        // Try fallback if no results found
        const fallbackResult = await fallbackFactCheck(query.trim());
        onResultReceived(fallbackResult);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to check facts. Trying fallback method...");
      
      try {
        // Use fallback on error
        const fallbackResult = await fallbackFactCheck(query.trim());
        onResultReceived(fallbackResult);
      } catch (fallbackError) {
        toast.error("All fact checking methods failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-factcheck-blue dark:text-blue-400">Fact Checker</CardTitle>
        <CardDescription className="dark:text-slate-300">
          Enter a claim or URL to verify its accuracy against fact checking sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1 dark:text-slate-200">
                Google Fact Check API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="Enter your API key"
                className="w-full dark:bg-slate-800 dark:border-slate-700"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored locally in your browser
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Check Claim</TabsTrigger>
                <TabsTrigger value="url">Check URL</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="mt-4">
                  <label htmlFor="claim" className="block text-sm font-medium mb-1 dark:text-slate-200">
                    Enter the claim to fact check
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="claim"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., The Earth is flat"
                      className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !query.trim() || !apiKey.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="mt-4">
                  <label htmlFor="url" className="block text-sm font-medium mb-1 dark:text-slate-200">
                    Enter the URL to fact check
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !query.trim() || !apiKey.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t dark:border-slate-700 pt-4 text-xs text-muted-foreground">
        <div>Rate limited to 100 queries/day</div>
        <div>Using Google Fact Check API</div>
      </CardFooter>
    </Card>
  );
};

export default FactCheckForm;
