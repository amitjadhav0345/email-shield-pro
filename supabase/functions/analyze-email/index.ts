import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// ENHANCED PATTERN DETECTION ENGINE
// ============================================================================

// Known phishing domains and suspicious TLDs
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.work', '.click', '.link', '.info', '.online', '.site', '.club', '.icu', '.buzz', '.tk', '.ml', '.ga', '.cf', '.gq'];
const KNOWN_PHISHING_PATTERNS = [
  /paypa[l1].*(?:verify|confirm|update)/i,
  /(?:apple|icloud).*(?:locked|suspended|verify)/i,
  /(?:microsoft|office365).*(?:expire|verify|suspended)/i,
  /(?:amazon|amaz0n).*(?:order|payment|account)/i,
  /(?:netflix|netf1ix).*(?:payment|suspended)/i,
  /(?:bank|banking).*(?:verify|suspended|confirm)/i,
  /(?:irs|tax).*(?:refund|payment|verify)/i,
  /(?:facebook|fb|instagram|meta).*(?:verify|suspended|disabled)/i,
];

// Urgency and threat indicators
const URGENCY_PATTERNS = [
  /(?:urgent|immediate(?:ly)?|asap|right\s*now|within\s*\d+\s*(?:hour|minute|day)s?)/i,
  /(?:account\s*(?:will\s*be|has\s*been)\s*(?:suspended|terminated|closed|locked))/i,
  /(?:final\s*(?:notice|warning)|last\s*chance|action\s*required)/i,
  /(?:verify\s*(?:your\s*)?(?:identity|account)\s*(?:now|immediately))/i,
  /(?:failure\s*to\s*(?:respond|act|verify)\s*will\s*result)/i,
  /(?:unauthorized\s*(?:access|activity|transaction)\s*detected)/i,
];

// Suspicious link patterns
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly|is\.gd|buff\.ly|adf\.ly|bc\.vc/i,
  /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,  // IP addresses
  /(?:login|signin|verify|secure|account|update).*(?:\.php|\.asp|\.html)/i,
  /@[^@]+\.[^@]+\/[^@]+/,  // Email-like strings in URLs
  /https?:\/\/[^\/]+--[^\/]+\./i,  // Double hyphen subdomains
];

// Credential harvesting indicators
const CREDENTIAL_PATTERNS = [
  /(?:enter|provide|confirm|verify)\s*(?:your\s*)?(?:password|pin|ssn|social\s*security)/i,
  /(?:credit\s*card|card\s*number|cvv|expiry\s*date|security\s*code)/i,
  /(?:bank\s*account|routing\s*number|swift\s*code)/i,
  /(?:otp|one[- ]?time\s*(?:password|code)|verification\s*code)/i,
  /(?:mother'?s?\s*maiden\s*name|date\s*of\s*birth|security\s*question)/i,
];

// Impersonation patterns
const IMPERSONATION_PATTERNS = [
  /(?:from|sent\s*by)\s*(?:the\s*)?(?:security\s*team|support\s*team|admin(?:istrator)?|help\s*desk)/i,
  /(?:official|authorized|verified)\s*(?:message|notice|communication)/i,
  /(?:do\s*not\s*(?:reply|respond)\s*to\s*this\s*(?:email|message))/i,
  /(?:this\s*is\s*(?:an?\s*)?(?:automated|system|official)\s*(?:message|notification))/i,
];

// Header analysis patterns
const HEADER_RED_FLAGS = [
  /received:.*\[(?:10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.)/i, // Internal IPs in received headers
  /x-originating-ip:.*\[?(?:10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.)/i,
  /reply-to:.*(?!.*from:)/i, // Reply-To different from From
  /return-path:.*(?!.*from:)/i, // Return-Path different from From
];

// Perform pre-AI heuristic analysis
function performHeuristicAnalysis(content: string, headers: string | null): {
  flags: string[];
  score: number;
  urlsFound: string[];
  domainsFound: string[];
} {
  const flags: string[] = [];
  let score = 0;
  const urlsFound: string[] = [];
  const domainsFound: string[] = [];
  
  const combinedText = `${content} ${headers || ""}`.toLowerCase();
  
  // Extract URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const urls = content.match(urlRegex) || [];
  urlsFound.push(...urls);
  
  // Extract domains from URLs
  urls.forEach(url => {
    try {
      const domain = new URL(url).hostname;
      domainsFound.push(domain);
    } catch {}
  });
  
  // Check suspicious TLDs
  domainsFound.forEach(domain => {
    SUSPICIOUS_TLDS.forEach(tld => {
      if (domain.endsWith(tld)) {
        flags.push(`Suspicious TLD detected: ${tld}`);
        score += 15;
      }
    });
  });
  
  // Check known phishing patterns
  KNOWN_PHISHING_PATTERNS.forEach((pattern, i) => {
    if (pattern.test(combinedText)) {
      flags.push(`Known phishing pattern detected (#${i + 1})`);
      score += 25;
    }
  });
  
  // Check urgency patterns
  URGENCY_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push(`High urgency/threat language detected`);
      score += 10;
    }
  });
  
  // Check suspicious URL patterns
  SUSPICIOUS_URL_PATTERNS.forEach(pattern => {
    urls.forEach(url => {
      if (pattern.test(url)) {
        flags.push(`Suspicious URL pattern: ${url.substring(0, 50)}...`);
        score += 20;
      }
    });
  });
  
  // Check credential harvesting
  CREDENTIAL_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push(`Credential harvesting attempt detected`);
      score += 30;
    }
  });
  
  // Check impersonation
  IMPERSONATION_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push(`Potential impersonation detected`);
      score += 15;
    }
  });
  
  // Header analysis
  if (headers) {
    HEADER_RED_FLAGS.forEach(pattern => {
      if (pattern.test(headers)) {
        flags.push(`Header anomaly detected`);
        score += 20;
      }
    });
    
    // Check SPF/DKIM/DMARC
    if (!/spf=pass/i.test(headers)) {
      if (/spf=fail/i.test(headers)) {
        flags.push("SPF authentication failed");
        score += 25;
      } else if (/spf=softfail/i.test(headers)) {
        flags.push("SPF softfail detected");
        score += 15;
      }
    }
    
    if (!/dkim=pass/i.test(headers)) {
      if (/dkim=fail/i.test(headers)) {
        flags.push("DKIM authentication failed");
        score += 25;
      }
    }
    
    if (/dmarc=fail/i.test(headers)) {
      flags.push("DMARC authentication failed");
      score += 30;
    }
    
    // Check for Reply-To mismatch
    const fromMatch = headers.match(/from:\s*[^<]*<([^>]+)>/i);
    const replyToMatch = headers.match(/reply-to:\s*[^<]*<([^>]+)>/i);
    if (fromMatch && replyToMatch && fromMatch[1].toLowerCase() !== replyToMatch[1].toLowerCase()) {
      const fromDomain = fromMatch[1].split('@')[1];
      const replyToDomain = replyToMatch[1].split('@')[1];
      if (fromDomain !== replyToDomain) {
        flags.push(`Reply-To domain mismatch: ${fromDomain} vs ${replyToDomain}`);
        score += 25;
      }
    }
  }
  
  // Homograph attack detection (look for mixed scripts)
  const homographPatterns = [
    /[a-z]*[а-яёА-ЯЁ]+[a-z]*/g, // Cyrillic mixed with Latin
    /[a-z]*[\u0370-\u03FF]+[a-z]*/g, // Greek mixed with Latin
  ];
  homographPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      flags.push("Possible homograph/punycode attack detected");
      score += 35;
    }
  });
  
  // Check for excessive exclamation/question marks (common in phishing)
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount > 5) {
    flags.push("Excessive exclamation marks detected");
    score += 5;
  }
  
  // Check for ALL CAPS sections
  const capsWords = content.match(/\b[A-Z]{4,}\b/g) || [];
  if (capsWords.length > 3) {
    flags.push("Excessive capitalization detected");
    score += 5;
  }
  
  return {
    flags: [...new Set(flags)], // Remove duplicates
    score: Math.min(score, 100),
    urlsFound,
    domainsFound: [...new Set(domainsFound)],
  };
}

// ============================================================================
// ENHANCED AI ANALYSIS PROMPT
// ============================================================================

const SYSTEM_PROMPT = `You are an ADVANCED Email Security Analysis Engine with expertise in phishing detection, social engineering, and email authentication protocols.

## YOUR CAPABILITIES
- Deep analysis of email content, metadata, and headers
- Detection of sophisticated phishing techniques including:
  - Spear phishing and business email compromise (BEC)
  - Clone phishing and lookalike domains
  - Homograph attacks (IDN/Punycode)
  - Display name spoofing
  - Thread hijacking
  - QR code phishing (Quishing)
  - Callback phishing (TOAD - Telephone-Oriented Attack Delivery)
  - Multi-stage attacks with delayed payloads

## ANALYSIS FRAMEWORK

### 1. SENDER ANALYSIS
- Verify sender domain reputation and age
- Check for lookalike/typosquatting domains (e.g., paypa1.com, amaz0n.com)
- Analyze display name vs actual email address mismatch
- Detect free email providers impersonating businesses
- Check for suspicious subdomains (e.g., login.paypal.com.malicious.com)

### 2. AUTHENTICATION VERIFICATION
- SPF (Sender Policy Framework) status and alignment
- DKIM (DomainKeys Identified Mail) signature validation
- DMARC (Domain-based Message Authentication) policy compliance
- ARC (Authenticated Received Chain) for forwarded emails
- Identify missing or failed authentication as critical risks

### 3. CONTENT ANALYSIS
- Urgency and fear-based manipulation tactics
- Grammar and spelling anomalies (especially in "official" communications)
- Inconsistent branding or formatting
- Requests for sensitive information (credentials, financial data, PII)
- Suspicious attachments (.exe, .scr, .js, .vbs, macro-enabled docs)
- Hidden text or invisible characters

### 4. LINK/URL ANALYSIS
- URL shorteners masking destination
- IP-based URLs instead of domains
- Mismatched anchor text and actual URLs
- Suspicious query parameters or encoded characters
- Redirect chains and open redirect abuse
- Data URIs and JavaScript links

### 5. BEHAVIORAL INDICATORS
- Unusual timing (sent outside business hours)
- Pressure to bypass normal procedures
- Requests to keep communication secret
- Unusual payment method requests
- Threats of account suspension/legal action

### 6. CONTEXTUAL RED FLAGS
- Unsolicited contact claiming prior relationship
- Too-good-to-be-true offers (lottery, inheritance, refunds)
- Requests to download/install software
- QR codes leading to credential harvesting
- Phone numbers for "verification"

## HEURISTIC PRE-ANALYSIS PROVIDED
You will receive pre-computed heuristic analysis results. Use these to enhance your assessment:
- Pattern match flags
- Preliminary risk score
- Extracted URLs and domains

## RESPONSE FORMAT
Respond ONLY with valid JSON (no markdown, no extra text):

{
  "classification": "Safe" | "Low Risk" | "Medium Risk" | "High Risk",
  "severityScore": <number 0-100>,
  "confidence": <number 0-100>,
  "threatType": "<primary threat category if any>",
  "detectedIssues": [
    {
      "type": "<issue category>",
      "severity": "low" | "medium" | "high" | "critical",
      "description": "<detailed explanation>",
      "evidence": "<specific text/pattern that triggered this>"
    }
  ],
  "checks": [
    {
      "label": "<check name>",
      "status": "pass" | "fail" | "warning" | "unknown",
      "description": "<explanation>",
      "importance": "critical" | "high" | "medium" | "low"
    }
  ],
  "senderAnalysis": {
    "domain": "<sender domain>",
    "legitimacyScore": <0-100>,
    "redFlags": ["<flag1>", "<flag2>"],
    "displayNameMatch": true | false
  },
  "urlAnalysis": [
    {
      "url": "<url>",
      "risk": "safe" | "suspicious" | "malicious",
      "reason": "<explanation>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "educationalNotes": ["<note explaining the attack technique if detected>"]
}

Be thorough, defensive, and educational in your analysis.`;

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

    // Perform heuristic pre-analysis
    console.log("Performing heuristic pre-analysis...");
    const heuristics = performHeuristicAnalysis(emailContent, emailHeader || null);
    console.log(`Heuristic analysis: ${heuristics.flags.length} flags, score: ${heuristics.score}`);

    const userMessage = `Analyze the following email for phishing, spoofing, and social engineering threats.

## HEURISTIC PRE-ANALYSIS RESULTS
- Preliminary Risk Score: ${heuristics.score}/100
- Flags Detected: ${heuristics.flags.length > 0 ? heuristics.flags.join("; ") : "None"}
- URLs Found: ${heuristics.urlsFound.length > 0 ? heuristics.urlsFound.join(", ") : "None"}
- Domains Found: ${heuristics.domainsFound.length > 0 ? heuristics.domainsFound.join(", ") : "None"}

## EMAIL CONTENT
${emailContent}

## EMAIL HEADERS
${emailHeader || "Not provided - mark authentication checks as 'unknown' and note this limitation"}

Provide comprehensive analysis in the specified JSON format. Factor in the heuristic results but perform your own deep analysis.`;

    console.log("Calling Lovable AI for enhanced email analysis...");

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
        temperature: 0.3, // Lower temperature for more consistent security analysis
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

    // Enhance result with heuristic data
    analysisResult.heuristicFlags = heuristics.flags;
    analysisResult.heuristicScore = heuristics.score;
    analysisResult.analysisTimestamp = new Date().toISOString();

    // Ensure minimum severity if heuristics detected critical issues
    if (heuristics.score >= 50 && analysisResult.severityScore < 50) {
      analysisResult.severityScore = Math.max(analysisResult.severityScore, heuristics.score);
      console.log("Adjusted severity score based on heuristics");
    }

    console.log("Analysis complete:", analysisResult.classification, "Score:", analysisResult.severityScore, "Confidence:", analysisResult.confidence);

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
