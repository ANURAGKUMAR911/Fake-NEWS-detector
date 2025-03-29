
import React, { useState } from "react";
import FactCheckForm from "@/components/FactCheckForm";
import FactCheckResult from "@/components/FactCheckResult";
import FactCheckHistory from "@/components/FactCheckHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { FactCheckResult as FactCheckResultType } from "@/services/databaseService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Search, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const [currentResult, setCurrentResult] = useState<FactCheckResultType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("check");

  const handleResultReceived = (result: FactCheckResultType) => {
    setCurrentResult(result);
  };

  const handleSelectFromHistory = (result: FactCheckResultType) => {
    setCurrentResult(result);
    setActiveTab("check");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-factcheck-blue-dark dark:bg-slate-800 text-white py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-center">Fake News Detector</h1>
            <p className="text-center mt-2 text-factcheck-blue-light dark:text-blue-300">
              Verify claims and combat misinformation
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
          <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <AlertTitle className="text-amber-700 dark:text-amber-300">Important</AlertTitle>
          <AlertDescription className="text-amber-600 dark:text-amber-400">
            You need a Google Fact Check API key to use this application. Enter your API key in the form below.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="check" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Fact Check
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="check" className="space-y-6">
              <div className="flex flex-col items-center space-y-8">
                <FactCheckForm onResultReceived={handleResultReceived} />
                
                {currentResult && (
                  <>
                    <Separator className="w-full max-w-3xl" />
                    <FactCheckResult result={currentResult} />
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex justify-center">
                <FactCheckHistory onSelectResult={handleSelectFromHistory} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="bg-factcheck-blue dark:bg-slate-800 py-4 text-white mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Fake News Detector &copy; {new Date().getFullYear()}</p>
          <p className="text-factcheck-blue-light dark:text-blue-300 mt-1">
            Powered by Google Fact Check API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
