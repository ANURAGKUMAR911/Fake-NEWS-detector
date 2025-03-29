
import { databaseService, FactCheckResult } from "./databaseService";
import { toast } from "sonner";

// This would typically be retrieved from environment variables
// For this demo, we'll use a placeholder and prompt the user for their API key
let API_KEY = "";

// Interface for Google Fact Check API response
interface GoogleFactCheckResponse {
  claims?: Array<{
    text: string;
    claimant?: string;
    claimDate?: string;
    claimReview?: Array<{
      publisher?: {
        name?: string;
        site?: string;
      };
      url?: string;
      title?: string;
      reviewDate?: string;
      textualRating?: string;
      languageCode?: string;
    }>;
  }>;
}

// Interface for fact check sources
export interface FactCheckSource {
  name: string;
  url?: string;
  date?: string;
  conclusion?: string;
}

export const setApiKey = (key: string) => {
  API_KEY = key;
  localStorage.setItem('factcheck-api-key', key);
};

export const getApiKey = () => {
  if (!API_KEY) {
    const savedKey = localStorage.getItem('factcheck-api-key');
    if (savedKey) {
      API_KEY = savedKey;
    }
  }
  return API_KEY;
};

// Determine if a string is a URL
export const isUrl = (text: string): boolean => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

// Calculate confidence score based on Google Fact Check API results
const calculateConfidence = (response: GoogleFactCheckResponse): number => {
  if (!response.claims?.length) {
    return 0;
  }

  // If we have claims with reviews, calculate a score
  const claim = response.claims[0];
  if (!claim.claimReview?.length) {
    return 0.2; // We found a claim but no reviews
  }

  // Count how many reviews we have, more reviews = higher confidence
  const numReviews = claim.claimReview.length;
  
  // Base confidence on number of reviews (0.5-0.9 range)
  return Math.min(0.5 + (numReviews * 0.1), 0.9);
};

// Parse the rating from Google Fact Check API results
const parseRating = (response: GoogleFactCheckResponse): string => {
  if (!response.claims?.length || !response.claims[0].claimReview?.length) {
    return "Unknown";
  }

  const ratings = response.claims[0].claimReview.map(review => 
    review.textualRating?.toLowerCase() || "unknown"
  );

  // Look for patterns in the ratings
  const falsePattern = /(false|fake|incorrect|wrong|misleading|untrue)/i;
  const truePattern = /(true|correct|accurate|right|valid)/i;
  const mixedPattern = /(mostly|partially|half|mixed|unverified)/i;

  // Count occurrences
  const falseCount = ratings.filter(r => falsePattern.test(r)).length;
  const trueCount = ratings.filter(r => truePattern.test(r)).length;
  const mixedCount = ratings.filter(r => mixedPattern.test(r)).length;

  // Determine the main rating based on the most common pattern
  if (falseCount >= trueCount && falseCount >= mixedCount) {
    return "False";
  } else if (trueCount >= falseCount && trueCount >= mixedCount) {
    return "True";
  } else if (mixedCount > 0) {
    return "Mixed";
  }

  // If we can't determine, return the textual rating from the first review
  return response.claims[0].claimReview[0].textualRating || "Unknown";
};

// Extract multiple fact check sources from the API response
const extractFactCheckSources = (response: GoogleFactCheckResponse): FactCheckSource[] => {
  if (!response.claims?.length || !response.claims[0].claimReview?.length) {
    return [];
  }

  // Map each claim review to a source
  return response.claims[0].claimReview.map(review => ({
    name: review.publisher?.name || "Unknown Source",
    url: review.url,
    date: review.reviewDate,
    conclusion: review.textualRating
  }));
};

// Fact check a claim using Google's Fact Check API
export const factCheck = async (query: string): Promise<FactCheckResult> => {
  if (!API_KEY) {
    throw new Error("API key not provided");
  }

  try {
    const queryIsUrl = isUrl(query);
    let endpoint = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
    let params: Record<string, string> = {
      key: API_KEY,
    };

    if (queryIsUrl) {
      params.reviewPublisherSiteFilter = query;
    } else {
      params.query = query;
    }

    const url = `${endpoint}?${new URLSearchParams(params)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Invalid API key or malformed request");
      } else if (response.status === 403) {
        throw new Error("API key unauthorized or quota exceeded");
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }
    
    const data: GoogleFactCheckResponse = await response.json();
    
    // Process the data
    const confidence = calculateConfidence(data);
    const rating = parseRating(data);
    const sources = extractFactCheckSources(data);
    
    // Create the result object
    const result: Omit<FactCheckResult, 'id' | 'timestamp'> = {
      query,
      isUrl: queryIsUrl,
      result: {
        confidence,
        rating,
        sources
      }
    };
    
    // Add more details if available
    if (data.claims && data.claims.length > 0) {
      const claim = data.claims[0];
      result.result.claim = claim.text;
      result.result.claimant = claim.claimant;
      
      // Legacy support for single source
      if (claim.claimReview && claim.claimReview.length > 0) {
        const review = claim.claimReview[0];
        result.result.ratingSource = review.publisher?.name;
        result.result.reviewDate = review.reviewDate;
        result.result.url = review.url;
      }
    }
    
    // Save to database and return
    return databaseService.saveFactCheck(result);
  } catch (error) {
    console.error('Fact check error:', error);
    toast.error(error instanceof Error ? error.message : "Error checking facts");
    
    // Return a failed result
    const failedResult: Omit<FactCheckResult, 'id' | 'timestamp'> = {
      query,
      isUrl: isUrl(query),
      result: {
        confidence: 0,
        rating: "Error",
      }
    };
    
    return databaseService.saveFactCheck(failedResult);
  }
};

// Simulate a fallback API for when Google Fact Check API fails or quota is exceeded
export const fallbackFactCheck = async (query: string): Promise<FactCheckResult> => {
  // This would be replaced with actual alternative APIs in a production app
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  const isQueryUrl = isUrl(query);
  const randomConfidence = Math.random();
  let rating = "Unknown";
  
  // Simulate different ratings
  if (randomConfidence < 0.3) {
    rating = "False";
  } else if (randomConfidence < 0.6) {
    rating = "Mixed";
  } else {
    rating = "True";
  }
  
  // Create mock sources
  const mockSources: FactCheckSource[] = [
    {
      name: "Fact Check Central",
      url: "https://example.com/factcheck1",
      date: new Date().toISOString(),
      conclusion: "This claim requires further investigation."
    },
    {
      name: "Truth Detector",
      url: "https://example.com/factcheck2",
      date: new Date().toISOString(),
      conclusion: "Our analysis shows this claim is partially accurate."
    },
    {
      name: "Fact Verification Institute",
      url: "https://example.com/factcheck3",
      date: new Date().toISOString(),
      conclusion: "Multiple sources confirm this claim needs context."
    }
  ];
  
  const result: Omit<FactCheckResult, 'id' | 'timestamp'> = {
    query,
    isUrl: isQueryUrl,
    result: {
      claim: isQueryUrl ? "Content from this URL" : query,
      confidence: randomConfidence,
      rating,
      sources: mockSources,
      ratingSource: "Fallback Verification System",
      reviewDate: new Date().toISOString().split('T')[0]
    }
  };
  
  return databaseService.saveFactCheck(result);
};
