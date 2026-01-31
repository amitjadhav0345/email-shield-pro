import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an Email Security Analysis Engine.

Your task is to analyze the provided email content and headers to identify potential phishing or email spoofing threats.

Perform the following checks:
1. Sender email and domain legitimacy
2. SPF, DKIM, and DMARC authentication status (if headers are provided)
3. Mismatch between sender name and sender email/domain
4. Presence of suspicious or urgent language
5. Detection of malicious or misleading links
6. Requests for sensitive information such as passwords, OTPs, or bank details
7. Grammar and formatting anomalies commonly found in phishing emails

Based on the analysis, you MUST respond with valid JSON only (no markdown, no extra text):

{
  "classification": "Safe" | "Low Risk" | "Medium Risk" | "High Risk",
  "severityScore": <number 0-100>,
  "detectedIssues": [
    {
      "type": "string describing the issue type",
      "severity": "low" | "medium" | "high",
      "description": "detailed explanation"
    }
  ],
  "checks": [
    {
      "label": "check name",
      "status": "pass" | "fail" | "warning",
      "description": "explanation of the check result"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Ensure the analysis is defensive, explanatory, and focused on user awareness.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { emailContent, emailHeader } = await req.json();

    if (!emailContent || typeof emailContent !== "string" || emailContent.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Email content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info from auth header if available
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabaseClient.auth.getClaims(token);
      if (claimsData?.claims) {
        userId = claimsData.claims.sub as string;
        userEmail = claimsData.claims.email as string;
      }
    }

    const userMessage = `Analyze the following email for phishing and spoofing threats:

EMAIL CONTENT:
${emailContent}

${emailHeader ? `EMAIL HEADERS:\n${emailHeader}` : "EMAIL HEADERS: Not provided (skip SPF/DKIM/DMARC verification checks or mark as 'warning')"}

Provide your analysis in the specified JSON format only.`;

    console.log("Calling Lovable AI for email analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty AI response");
      return new Response(
        JSON.stringify({ error: "AI returned empty response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received, parsing JSON...");

    // Parse the JSON response (handle potential markdown code blocks)
    let analysisResult;
    try {
      let jsonStr = content.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
      }
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis complete:", analysisResult.classification, "Score:", analysisResult.severityScore);

    // Save to analysis_history if user is authenticated
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        const emailSnippet = emailContent.substring(0, 100).replace(/\s+/g, " ");
        
        await adminClient.from("analysis_history").insert({
          user_id: userId,
          user_email: userEmail,
          email_snippet: emailSnippet,
          classification: analysisResult.classification,
          severity_score: analysisResult.severityScore,
          detected_issues_count: analysisResult.detectedIssues?.length || 0,
        });
        
        console.log("Analysis saved to history for user:", userId);
      } catch (saveError) {
        console.error("Failed to save analysis history:", saveError);
        // Don't fail the request if saving history fails
      }
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
