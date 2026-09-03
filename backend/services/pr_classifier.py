import os
import json
import httpx
from typing import Dict, Any

def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()

async def classify_pr_content(pr_text: str, email_subject: str = "") -> Dict[str, Any]:
    """
    Uses Gemini AI to analyze raw Press Release text and email subject,
    automatically classifying the target CyberMedia publication & topic type.
    """
    api_key = get_gemini_api_key()
    
    # Simple rule-based heuristic fallback
    subject_lower = email_subject.lower()
    text_lower = pr_text[:1500].lower()

    default_publication = "DATAQUEST"
    if "voice&data" in subject_lower or "telecom" in text_lower or "5g" in text_lower or "fiber" in text_lower or "satcom" in text_lower:
        default_publication = "VOICE&DATA"
    elif "pcquest" in subject_lower or "laptop" in text_lower or "gaming" in text_lower or "gadget" in text_lower or "consumer tech" in text_lower:
        default_publication = "PCQUEST"

    default_topic = "News"
    if "interview" in subject_lower or "q&a" in text_lower or "exclusive interaction" in text_lower:
        default_topic = "Interview"
    elif "feature" in subject_lower or "in-depth" in text_lower or "analysis" in text_lower:
        default_topic = "Feature"

    if not api_key:
        print("[PRClassifier] No GEMINI_API_KEY found, using rule-based classification.")
        return {
            "publication": default_publication,
            "topicType": default_topic,
            "confidence": 0.7,
            "reasoning": "Rule-based keyword fallback (no API key configured)"
        }

    prompt = f"""You are the Master AI Editorial Classifier for CyberMedia India (Dataquest, Voice&Data, PCquest).
Analyze the following incoming Press Release and Email Subject line to determine the most appropriate publication and article format.

Target Publications:
1. DATAQUEST: Enterprise IT, AI, Cloud, Datacenter, Cybersecurity, CIOs, Software, Tech Governance, Semiconductor.
2. VOICE&DATA: Telecom, 5G, Optical Fiber, Satcom, Networking, Broadband, Mobile Infrastructure, Spectrum.
3. PCQUEST: Consumer Hardware, Laptops, PCs, Mobile Devices, Gaming, Personal Technology, Accessories.

Topic Types:
- News (Factual announcements, product launches, partnerships)
- Interview (Q&A format with executives)
- Opinion (Expert views, commentary)
- Feature (Deep dive analytical story)
- CaseStudy (Implementation success report)

Email Subject: {email_subject}
Press Release Text Snippet:
{pr_text[:2500]}

Respond ONLY with a valid JSON object matching this schema:
{{
  "publication": "DATAQUEST" | "VOICE&DATA" | "PCQUEST",
  "topicType": "News" | "Interview" | "Opinion" | "Feature" | "CaseStudy",
  "confidence": 0.95,
  "reasoning": "Brief explanation of classification decision"
}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"}
            )
            
            if res.status_code == 200:
                data = res.json()
                raw_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                
                # Clean JSON string markdown
                clean_json = raw_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_json)
                
                # Sanitize values
                pub = parsed.get("publication", "").upper()
                if pub not in ["DATAQUEST", "VOICE&DATA", "PCQUEST"]:
                    pub = default_publication
                    
                topic = parsed.get("topicType", "News")
                if topic not in ["News", "Interview", "Opinion", "Feature", "CaseStudy"]:
                    topic = default_topic

                return {
                    "publication": pub,
                    "topicType": topic,
                    "confidence": parsed.get("confidence", 0.9),
                    "reasoning": parsed.get("reasoning", "AI classified via Gemini Flash")
                }
    except Exception as e:
        print(f"[PRClassifier] Gemini AI classification failed: {e}")

    return {
        "publication": default_publication,
        "topicType": default_topic,
        "confidence": 0.75,
        "reasoning": "Fallback classification after API timeout/error"
    }
