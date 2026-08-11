// ─────────────────────────────────────────────────────────────
// pcquestArticles.ts
// Official Reference article database for PCQuest (pcquest.com).
// Populated directly from PCQ (2).csv
// ─────────────────────────────────────────────────────────────

export interface PCQArticle {
  title: string;
  url: string;
  snippet: string;
}

export const pcquestArticlesDb: Record<string, PCQArticle[]> = {
  "smartphones": [
    {
      "title": "Choose the Best Smartphone: List of 30+ Mobiles",
      "url": "https://www.pcquest.com/choose-the-best-smartphone-list-of-30-mobiles/",
      "snippet": "Buying guide covering processor, RAM, display, camera, battery for 30+ mobiles from budget to flagship."
    },
    {
      "title": "June 2026 smartphone launches in India are changing what buyers can expect",
      "url": "https://www.pcquest.com/smartphones/june-2026-smartphone-launches-in-india-are-changing-what-buyers-can-expect/",
      "snippet": "June 2026 cycle unusually competitive with flagships and budget launches arriving together."
    }
  ],
  "infinix": [
    {
      "title": "Infinix GT 30 Pro: What makes the latest Infinix phone, a gaming phone?",
      "url": "https://www.pcquest.com/smartphones/infinix-gt-30-pro-what-makes-the-latest-infinix-phone-a-gaming-phone-9308720",
      "snippet": "144Hz AMOLED, 520Hz shoulder triggers, RGB LEDs, Dimensity 8350 Ultimate, 120fps BGMI support."
    }
  ],
  "oneplus": [
    {
      "title": "OnePlus Turbo: Is this OnePlus' first true gaming phone?",
      "url": "https://www.pcquest.com/smartphones/oneplus-turbo-is-this-oneplus-first-true-gaming-phone-10947059",
      "snippet": "Leak reveals 9000mAh silicon-carbon battery, Snapdragon 8s Gen 4, 165Hz BOE OLED for gaming."
    }
  ],
  "motorola": [
    {
      "title": "Motorola Signature long term review: Slim flagship that still holds up",
      "url": "https://www.pcquest.com/reviews/motorola-signature-long-term-review-11833097",
      "snippet": "3-month review: 7mm slim, 6.8-inch 165Hz LTPO, Snapdragon 8 Gen 5, 50W wireless, heating and camera quirks."
    }
  ],
  "pcquest": [
    {
      "title": "Best smartphones of 2025: Is your phone on the premium list?",
      "url": "https://www.pcquest.com/smartphones/best-smartphones-of-2025-is-your-phone-on-the-premium-list/",
      "snippet": "Premium list including iPhone 17 with 120Hz LTPO OLED and larger battery for workplace and content creation."
    }
  ],
  "gaming-infinix": [
    {
      "title": "Infinix GT 30 Pro gaming features deep dive",
      "url": "https://www.pcquest.com/smartphones/infinix-gt-30-pro-what-makes-the-latest-infinix-phone-a-gaming-phone-9308720",
      "snippet": "XBoost Gaming Engine and AI VC cooling for consistent peak performance during long sessions."
    }
  ],
  "gaming-oneplus": [
    {
      "title": "OnePlus Turbo massive battery and 165Hz display for gaming",
      "url": "https://www.pcquest.com/smartphones/oneplus-turbo-is-this-oneplus-first-true-gaming-phone-10947059",
      "snippet": "9,000mAh battery with 100W charging and Fengchi gaming kernel positions Turbo vs ROG Phone 8."
    }
  ],
  "gaminglaptops": [
    {
      "title": "5 Best Gaming Laptops Under Rs 60,000",
      "url": "https://www.pcquest.com/computers-laptops/5-best-gaming-laptops-under-60000/",
      "snippet": "Infinix GT Book, Lenovo LOQ, Acer ALG with RTX 3050, 144Hz panels for budget gaming."
    },
    {
      "title": "Best gaming laptop under 60000 in India",
      "url": "https://www.pcquest.com/computers-laptops/best-gaming-laptop-under-60000-in-india-8948058",
      "snippet": "GTBook punches above price with RTX 3050 and 16-inch WUXGA, Victus synonymous with value gaming."
    }
  ],
  "gaming-ubisoft": [
    {
      "title": "Assassin's Creed Black Flag Resynced Gameplay Leaks - PS5 Pro Footage Surfaces",
      "url": "https://www.pcquest.com/gaming/assassins-creed-black-flag-resynced-gameplay-leaks-ps5-pro-footage-surfaces/",
      "snippet": "Resynced version releasing July 9 2026 for PS5, Xbox Series X/S, PC, 4-hour leak acknowledged."
    }
  ],
  "gaming-industry": [
    {
      "title": "Impact of cloud gaming on the Industry",
      "url": "https://www.pcquest.com/gaming/impact-of-cloud-gaming-on-the-industry/",
      "snippet": "Mobile gaming advancements, hyper-casual growth and cloud enabling rapid user base growth."
    }
  ],
  "cybersecurity": [
    {
      "title": "Internal Audit and its Larger Role In Enhancing Cybersecurity",
      "url": "https://www.pcquest.com/internal-audit-larger-role-enhancing-cybersecurity/",
      "snippet": "Three lines of defence model, IIA report on internal audit as trusted cyber-adviser post WannaCry."
    },
    {
      "title": "How AI Is Revolutionizing Cybersecurity (And Why You Should Care)",
      "url": "https://www.pcquest.com/security-products/how-ai-is-revolutionizing-cybersecurity-7318445",
      "snippet": "AI for real-time network traffic analysis, anomaly detection for zero-day, Darktrace ransomware case."
    },
    {
      "title": "Beneath the Code: Where Real Cybersecurity Begins",
      "url": "https://www.pcquest.com/security/beneath-the-code-where-real-cybersecurity-begins/",
      "snippet": "Cybersecurity moves below surface - starts when power hits the board, hardware root of trust."
    },
    {
      "title": "AI is rewriting cybersecurity but trust must lead the code",
      "url": "https://www.pcquest.com/security/ai-is-rewriting-cybersecurity-but-trust-must-lead-the-code/",
      "snippet": "AI in cybersecurity market $22.4B in 2023 to $60B in 2028, proactive threat ID and response."
    },
    {
      "title": "Cybersecurity in the digital supply chain: A war without borders",
      "url": "https://www.pcquest.com/security/cybersecurity-in-the-digital-supply-chain-a-war-without-borders/",
      "snippet": "Convergence of AI, ML, data science and predictive analytics for supply chain security."
    },
    {
      "title": "Cybersecurity Trends: Evolving Threats & Defense Strategies",
      "url": "https://www.pcquest.com/security/cybersecurity-trends-evolving-threats-defense-strategies/",
      "snippet": "IBM Watson for Cybersecurity AI-based threat intelligence and emerging defense strategies."
    }
  ],
  "ai": [
    {
      "title": "How AI Is Revolutionizing Cybersecurity (And Why You Should Care)",
      "url": "https://www.pcquest.com/security-products/how-ai-is-revolutionizing-cybersecurity-7318445",
      "snippet": "AI for real-time network traffic analysis, anomaly detection for zero-day, Darktrace ransomware case."
    },
    {
      "title": "AI - From Tools to Intelligent Partners",
      "url": "https://www.pcquest.com/artificial-intelligence/ai-from-tools-to-intelligent-partners-8845657",
      "snippet": "AI-powered wheelchairs, prosthetics, sign language translation turning assistive tools into partners."
    },
    {
      "title": "How AI is reshaping enterprise hiring",
      "url": "https://www.pcquest.com/artificial-intelligence/how-ai-is-reshaping-enterprise-hiring-9527763",
      "snippet": "LLMs and agentic AI automating JD creation, multilingual sourcing, bias mitigation at Cohyre.ai."
    },
    {
      "title": "What Samsung's Galaxy AI Isn't Telling You",
      "url": "https://www.pcquest.com/artificial-intelligence/what-samsungs-galaxy-ai-isnt-telling-you-10947790",
      "snippet": "Galaxy AI hybrid NPU + Gemini, 400M devices, Now Brief Energy Score, 2026 paywall for cloud features."
    },
    {
      "title": "India's AI engines are powerful but the data roads are broken",
      "url": "https://www.pcquest.com/artificial-intelligence/indias-ai-engines-are-powerful-but-the-data-roads-are-broken-12148222",
      "snippet": "Confluent 2026 Report: 79% Indian IT leaders say weak real-time data infra slowing AI scale."
    },
    {
      "title": "Building responsible and resilient AI ecosystems",
      "url": "https://www.pcquest.com/artificial-intelligence/building-responsible-and-resilient-ai-ecosystems-9086977",
      "snippet": "Prof Aindril De on data governance, legacy integration, human-AI synergy and bias audits."
    },
    {
      "title": "What's Coming in 2025: The Future of AI and ML",
      "url": "https://www.pcquest.com/artificial-intelligence/whats-coming-in-2025-the-future-of-ai-and-ml/",
      "snippet": "AI integration of diverse data types, hyper-personalized healthcare and climate modeling future."
    }
  ],
  "reviews": [
    {
      "title": "ASUS Vivobook 14 (X1407AA LY028WS) Review: A Copilot+ PC Built for Actual Work",
      "url": "https://www.pcquest.com/reviews/asus-vivobook-14-x1407aa-ly028ws-review-11899379",
      "snippet": "Copilot+ with Intel Core Ultra 5 325, 16GB DDR5, 10-hour battery, 60Hz limitation noted."
    },
    {
      "title": "Motorola Signature long term review",
      "url": "https://www.pcquest.com/reviews/motorola-signature-long-term-review-11833097",
      "snippet": "Slim flagship 30,37,534 AnTuTu, UFS 4.X storage, 90W wired 50W wireless charging, 5200mAh battery."
    },
    {
      "title": "Noise Master Buds 2 review clean sound with a few daily use quirks",
      "url": "https://www.pcquest.com/reviews/noise-master-buds-2-review-clean-sound-with-a-few-daily-use-quirks-11785174",
      "snippet": "Bose-tuned, LHDC 5.0, 51 dB ANC, 10mm drivers at Rs 8,999, fit and transparency need polish."
    },
    {
      "title": "Philips 8100 Series 43-inch 4K LED Smart TV review: big features, budget price",
      "url": "https://www.pcquest.com/reviews/philips-8100-series-43-inch-4k-led-smart-tv-review-10978141",
      "snippet": "Dolby Vision Atmos Google TV at Rs 22,499, 30W speakers, ALLM for casual gaming."
    },
    {
      "title": "Tempt Cameo Bluetooth Speaker Review: Style Meets Everyday Sound",
      "url": "https://www.pcquest.com/reviews/reviews/tempt-cameo-bluetooth-speaker-review-style-meets-everyday-sound-10607671",
      "snippet": "230g portable, Bluetooth 5.3 TWS, 3.5-4 hours at moderate volume for Rs 1,099."
    },
    {
      "title": "QCY H3 Pro Review: Budget Price, Premium Punch",
      "url": "https://www.pcquest.com/reviews/qcy-h3-pro-review-budget-price-premium-punch/",
      "snippet": "LDAC support and ANC at budget price, comfortable for long use in 2025."
    }
  ],
  "enterprise": [
    {
      "title": "How AI is reshaping enterprise hiring",
      "url": "https://www.pcquest.com/artificial-intelligence/how-ai-is-reshaping-enterprise-hiring-9527763",
      "snippet": "LLMs and agentic AI automating JD creation, multilingual sourcing, bias mitigation at Cohyre.ai."
    }
  ],
  "samsung": [
    {
      "title": "What Samsung's Galaxy AI Isn't Telling You",
      "url": "https://www.pcquest.com/artificial-intelligence/what-samsungs-galaxy-ai-isnt-telling-you-10947790",
      "snippet": "Galaxy AI hybrid NPU + Gemini, 400M devices, Now Brief Energy Score, 2026 paywall for cloud features."
    }
  ],
  "data": [
    {
      "title": "India's AI engines are powerful but the data roads are broken",
      "url": "https://www.pcquest.com/artificial-intelligence/indias-ai-engines-are-powerful-but-the-data-roads-are-broken-12148222",
      "snippet": "Confluent 2026 Report: 79% Indian IT leaders say weak real-time data infra slowing AI scale."
    }
  ]
};

export function getLocalArticlesForCompany(company: string): PCQArticle[] {
  if (!company) return [];
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (pcquestArticlesDb[clean]) {
    return pcquestArticlesDb[clean];
  }
  
  for (const [key, articles] of Object.entries(pcquestArticlesDb)) {
    if (clean.includes(key) || key.includes(clean)) {
      return articles;
    }
  }
  
  return [];
}
