// ─────────────────────────────────────────────────────────────
// dqindiaArticles.ts
// Official Reference article database for Dataquest (dqindia.com).
// Populated directly from DQ (2).csv
// ─────────────────────────────────────────────────────────────

export interface DQArticle {
  title: string;
  url: string;
  snippet: string;
}

export const dqArticlesDb: Record<string, DQArticle[]> = {
  "governmentofindia": [
    {
      "title": "Digital India at 11: Key Achievements, Challenges, and Future Priorities",
      "url": "https://www.dqindia.com/government-policy/digital-india-11-years-achievements-challenges-road-ahead-12128556",
      "snippet": "11-year review of Digital India covering UPI, BharatNet, DigiLocker and next phase AI and semiconductor push."
    },
    {
      "title": "Cabinet approves Semicon 2.0 with Rs. 1.27 lakh crore push for India's chip design and manufacturing",
      "url": "https://www.dqindia.com/semiconductors/cabinet-approves-semicon-20-government-delivers-on-commitment-for-long-term-policy-support-to-semiconductors-in-india-12166952",
      "snippet": "Semicon 2.0 six-pillar strategy covering design, materials, fabs, ATMP, R&D and talent with Rs 1.27 lakh crore outlay."
    }
  ],
  "meity": [
    {
      "title": "India approves 12 chip manufacturing projects with Rs 1.64 lakh crore investment pipeline",
      "url": "https://www.dqindia.com/semiconductors/india-approves-12-chip-manufacturing-projects-with-rs-164-lakh-crore-investment-pipeline-12114989",
      "snippet": "ISM approves 12 projects including fab and 9 packaging units with Rs 1.64 lakh crore pipeline."
    },
    {
      "title": "MEITY celebrates 5 years of Digital Bharat and Aatma Nirbhar Bharat",
      "url": "https://www.dqindia.com/meity-celebrates-5-years-digital-bharat-aatma-nirbhar-bharat/",
      "snippet": "MeitY 5-year celebration highlighting Aadhaar, UPI, DigiLocker, GeM and push for Made in India apps."
    },
    {
      "title": "2.5 lakh gram panchayats to get full internet coverage under Bharat Net by 2018",
      "url": "https://www.dqindia.com/2-5-lakh-gram-panchayats-to-get-full-internet-coverage-under-bharat-net-by-2018/",
      "snippet": "Government announces BharatNet Phase 1 to connect 2.5 lakh gram panchayats via optical fibre for less-cash economy."
    }
  ],
  "indiasemiconductormission": [
    {
      "title": "India approves 12 chip manufacturing projects with Rs 1.64 lakh crore investment pipeline",
      "url": "https://www.dqindia.com/semiconductors/india-approves-12-chip-manufacturing-projects-with-rs-164-lakh-crore-investment-pipeline-12114989",
      "snippet": "ISM approves 12 projects including fab and 9 packaging units with Rs 1.64 lakh crore pipeline."
    },
    {
      "title": "SEMI forecasts record semiconductor equipment spending as India deepens chip ambitions",
      "url": "https://www.dqindia.com/government-policy/ai-drives-record-global-semiconductor-equipment-spending-india-ism-2-0-12170968",
      "snippet": "SEMI projects $165.9B equipment spend in 2026 as ISM 2.0 boosts India's equipment, materials and supply chain role."
    }
  ],
  "alltimeit": [
    {
      "title": "All Time IT to launch cloud services with HP",
      "url": "https://www.dqindia.com/all-time-it-to-launch-cloud-services-with-hp/",
      "snippet": "AllTimeIT launches EFFICLOUD pay-per-use cloud on HP CloudSystem Matrix for SMB and enterprise IaaS/PaaS/SaaS."
    }
  ],
  "hp": [
    {
      "title": "All Time IT to launch cloud services with HP",
      "url": "https://www.dqindia.com/all-time-it-to-launch-cloud-services-with-hp/",
      "snippet": "AllTimeIT launches EFFICLOUD pay-per-use cloud on HP CloudSystem Matrix for SMB and enterprise IaaS/PaaS/SaaS."
    }
  ],
  "bfsi": [
    {
      "title": "BFSI takes a digital leap",
      "url": "https://www.dqindia.com/bfsi-takes-a-digital-leap/",
      "snippet": "Analysis of BFSI IT spend, core banking refresh and shift to mobile and self-service digital banking."
    }
  ],
  "cognizant": [
    {
      "title": "BFSI takes a digital leap",
      "url": "https://www.dqindia.com/bfsi-takes-a-digital-leap/",
      "snippet": "Analysis of BFSI IT spend, core banking refresh and shift to mobile and self-service digital banking."
    }
  ],
  "gartner": [
    {
      "title": "BFSI takes a digital leap",
      "url": "https://www.dqindia.com/bfsi-takes-a-digital-leap/",
      "snippet": "Analysis of BFSI IT spend, core banking refresh and shift to mobile and self-service digital banking."
    }
  ],
  "wipro": [
    {
      "title": "Wipro, ServiceNow Deepen Alliance to Drive Enterprise Adoption of Agentic AI",
      "url": "https://www.dqindia.com/news/wipro-expands-servicenow-partnership-to-scale-agentic-ai-across-enterprise-functions-11885937",
      "snippet": "Wipro integrates Wipro Intelligence with ServiceNow AI Platform to deploy agentic AI across IT, HR, procurement."
    },
    {
      "title": "Infosys, TCS, and Wipro Experience Decline in Attrition in Q1 FY24, Here's Why",
      "url": "https://www.dqindia.com/infosys-tcs-and-wipro-experience-decline-in-attrition-in-q1-fy24-heres-why/",
      "snippet": "Q1 FY24 analysis shows attrition down to 14-17% across top IT firms as hiring slows and utilization focus increases."
    },
    {
      "title": "A Promising Quarter",
      "url": "https://www.dqindia.com/a-promising-quarter/",
      "snippet": "Oct-Dec 2004 quarter review of TCS 54% profit growth, Infosys 52%, Wipro 71% and outsourcing trends."
    },
    {
      "title": "Wipro rolls out 90% variable pay for Q4 FY25, surpassing TCS and Infosys",
      "url": "https://www.dqindia.com/news/wipro-rolls-out-90-variable-pay-for-q4-fy25-surpassing-tcs-and-infosys-9350240",
      "snippet": "Wipro disburses 90% variable pay for Q4 FY25 vs Infosys 65% and TCS differentiated 20-100% linked to performance."
    }
  ],
  "servicenow": [
    {
      "title": "Wipro, ServiceNow Deepen Alliance to Drive Enterprise Adoption of Agentic AI",
      "url": "https://www.dqindia.com/news/wipro-expands-servicenow-partnership-to-scale-agentic-ai-across-enterprise-functions-11885937",
      "snippet": "Wipro integrates Wipro Intelligence with ServiceNow AI Platform to deploy agentic AI across IT, HR, procurement."
    }
  ],
  "cloudera": [
    {
      "title": "Cloudera Launches Enterprise Data Cloud Platform",
      "url": "https://www.dqindia.com/cloudera-launches-enterprise-data-cloud-platform/",
      "snippet": "Cloudera launches CDP with Data Warehouse, ML and Data Hub services for hybrid cloud analytics governance."
    }
  ],
  "micron": [
    {
      "title": "Micron celebrates opening of India's first semiconductor assembly and test facility",
      "url": "https://www.dqindia.com/esdm/micron-celebrates-opening-of-indias-first-semiconductor-assembly-and-test-facility-11167495",
      "snippet": "Micron opens Sanand ATMP facility with 500k sq ft cleanroom and $2.75B investment for AI-driven memory demand."
    }
  ],
  "zoho": [
    {
      "title": "Why Enterprise AI won't be Plug-and-Play",
      "url": "https://www.dqindia.com/interview/why-enterprise-ai-wont-be-plug-and-play-10063647",
      "snippet": "Zoho AI Research Director explains why enterprise AI needs plumbing, data unification and privacy-first LLMs."
    }
  ],
  "xebia": [
    {
      "title": "Xebia is driving enterprise-scale digital transformation: Varun Jain",
      "url": "https://www.dqindia.com/interview/xebia-is-driving-enterprise-scale-digital-transformation-varun-jain-8827073",
      "snippet": "Interview on Xebia's cloud-native and GenAI focus for BFSI with 30% scalability gains via cloud migration."
    }
  ],
  "infosys": [
    {
      "title": "Infosys Partners with Google Cloud to Develop Data Native Intelligent Enterprise",
      "url": "https://www.dqindia.com/infosys-partners-google-cloud-develop-data-native-intelligent-enterprise/",
      "snippet": "Infosys and GCP launch Data Native Intelligent Enterprise and Digital Brain with AI-driven analytics workbench."
    },
    {
      "title": "Infosys, TCS, and Wipro Experience Decline in Attrition in Q1 FY24, Here's Why",
      "url": "https://www.dqindia.com/infosys-tcs-and-wipro-experience-decline-in-attrition-in-q1-fy24-heres-why/",
      "snippet": "Q1 FY24 analysis shows attrition down to 14-17% across top IT firms as hiring slows and utilization focus increases."
    },
    {
      "title": "A Promising Quarter",
      "url": "https://www.dqindia.com/a-promising-quarter/",
      "snippet": "Oct-Dec 2004 quarter review of TCS 54% profit growth, Infosys 52%, Wipro 71% and outsourcing trends."
    },
    {
      "title": "Wipro rolls out 90% variable pay for Q4 FY25, surpassing TCS and Infosys",
      "url": "https://www.dqindia.com/news/wipro-rolls-out-90-variable-pay-for-q4-fy25-surpassing-tcs-and-infosys-9350240",
      "snippet": "Wipro disburses 90% variable pay for Q4 FY25 vs Infosys 65% and TCS differentiated 20-100% linked to performance."
    },
    {
      "title": "Salil Parekh, Harish Mehta, Tejas Networks & NPCI win at the 30th Dataquest ICT Awards",
      "url": "https://www.dqindia.com/salil-parekh-harish-mehta-tejas-networks-npci-win-at-the-30th-dataquest-ict-awards/",
      "snippet": "DQ ICT Awards 30th edition coverage recognizing Infosys CEO, Tejas BharatNet role and NPCI Digital India contribution."
    }
  ],
  "googlecloud": [
    {
      "title": "Infosys Partners with Google Cloud to Develop Data Native Intelligent Enterprise",
      "url": "https://www.dqindia.com/infosys-partners-google-cloud-develop-data-native-intelligent-enterprise/",
      "snippet": "Infosys and GCP launch Data Native Intelligent Enterprise and Digital Brain with AI-driven analytics workbench."
    }
  ],
  "hpe": [
    {
      "title": "HPE accelerates AI innovation with enterprise-grade solution",
      "url": "https://www.dqindia.com/hpe-accelerates-ai-innovation-enterprise-grade-solution/",
      "snippet": "HPE launches ML Ops container solution to standardize ML lifecycle and accelerate AI deployment."
    },
    {
      "title": "Hewlett Packard enterprise and Microsoft announce plans to deliver integrated hybrid IT infrastructure",
      "url": "https://www.dqindia.com/hewlett-packard-enterprise-and-microsoft-announce-plans-to-deliver-integrated-hybrid-it-infrastructure/",
      "snippet": "HPE and Azure partnership for hybrid cloud with Hyper-Converged 250 and Azure as preferred public cloud."
    },
    {
      "title": "Hewlett Packard Enterprise expands Helion Cloud Portfolio",
      "url": "https://www.dqindia.com/hewlett-packard-enterprise-expands-helion-cloud-portfolio/",
      "snippet": "HPE Helion Cloud Suite and CloudSystem 10 for hybrid cloud management across traditional and cloud-native apps."
    }
  ],
  "snowflake": [
    {
      "title": "Snowflake and Anthropic Push AI Agents Into Enterprise Workflows",
      "url": "https://www.dqindia.com/data-and-ai/snowflake-anthropic-enterprise-ai-adoption-governed-ai-cortex-ai-11902200",
      "snippet": "Claude models via Snowflake Cortex AI for governed enterprise AI agents in cybersecurity and finance."
    }
  ],
  "anthropic": [
    {
      "title": "Snowflake and Anthropic Push AI Agents Into Enterprise Workflows",
      "url": "https://www.dqindia.com/data-and-ai/snowflake-anthropic-enterprise-ai-adoption-governed-ai-cortex-ai-11902200",
      "snippet": "Claude models via Snowflake Cortex AI for governed enterprise AI agents in cybersecurity and finance."
    }
  ],
  "bharatnet": [
    {
      "title": "2.5 lakh gram panchayats to get full internet coverage under Bharat Net by 2018",
      "url": "https://www.dqindia.com/2-5-lakh-gram-panchayats-to-get-full-internet-coverage-under-bharat-net-by-2018/",
      "snippet": "Government announces BharatNet Phase 1 to connect 2.5 lakh gram panchayats via optical fibre for less-cash economy."
    }
  ],
  "microsoft": [
    {
      "title": "Hewlett Packard enterprise and Microsoft announce plans to deliver integrated hybrid IT infrastructure",
      "url": "https://www.dqindia.com/hewlett-packard-enterprise-and-microsoft-announce-plans-to-deliver-integrated-hybrid-it-infrastructure/",
      "snippet": "HPE and Azure partnership for hybrid cloud with Hyper-Converged 250 and Azure as preferred public cloud."
    }
  ],
  "semi": [
    {
      "title": "SEMI forecasts record semiconductor equipment spending as India deepens chip ambitions",
      "url": "https://www.dqindia.com/government-policy/ai-drives-record-global-semiconductor-equipment-spending-india-ism-2-0-12170968",
      "snippet": "SEMI projects $165.9B equipment spend in 2026 as ISM 2.0 boosts India's equipment, materials and supply chain role."
    }
  ],
  "indiasemiconductorecosystem": [
    {
      "title": "India emerges as global hub for semiconductor design and R&D",
      "url": "https://www.dqindia.com/esdm/india-emerges-as-global-hub-for-semiconductor-design-and-rd-11224456",
      "snippet": "India hosts 7% of global semiconductor GCCs and 20% of chip design workforce with 24 DLI projects approved."
    }
  ],
  "oracle": [
    {
      "title": "Oracle Swells its Enterprise Cloud Portfolio",
      "url": "https://www.dqindia.com/oracle-swells-its-enterprise-cloud-portfolio/",
      "snippet": "Oracle adds 24+ services including Database Cloud Exadata, Big Data Cloud and Integration Cloud to Oracle Cloud Platform."
    }
  ],
  "tcs": [
    {
      "title": "Infosys, TCS, and Wipro Experience Decline in Attrition in Q1 FY24, Here's Why",
      "url": "https://www.dqindia.com/infosys-tcs-and-wipro-experience-decline-in-attrition-in-q1-fy24-heres-why/",
      "snippet": "Q1 FY24 analysis shows attrition down to 14-17% across top IT firms as hiring slows and utilization focus increases."
    },
    {
      "title": "A Promising Quarter",
      "url": "https://www.dqindia.com/a-promising-quarter/",
      "snippet": "Oct-Dec 2004 quarter review of TCS 54% profit growth, Infosys 52%, Wipro 71% and outsourcing trends."
    },
    {
      "title": "Wipro rolls out 90% variable pay for Q4 FY25, surpassing TCS and Infosys",
      "url": "https://www.dqindia.com/news/wipro-rolls-out-90-variable-pay-for-q4-fy25-surpassing-tcs-and-infosys-9350240",
      "snippet": "Wipro disburses 90% variable pay for Q4 FY25 vs Infosys 65% and TCS differentiated 20-100% linked to performance."
    }
  ],
  "hcltech": [
    {
      "title": "Infosys, TCS, and Wipro Experience Decline in Attrition in Q1 FY24, Here's Why",
      "url": "https://www.dqindia.com/infosys-tcs-and-wipro-experience-decline-in-attrition-in-q1-fy24-heres-why/",
      "snippet": "Q1 FY24 analysis shows attrition down to 14-17% across top IT firms as hiring slows and utilization focus increases."
    }
  ],
  "infor": [
    {
      "title": "Infor launches Industry-Specific AI agents and cloud migration offer",
      "url": "https://www.dqindia.com/news/infor-launches-industry-specific-ai-agents-and-cloud-migration-offer-10572265",
      "snippet": "Infor launches Industry AI Agents on Bedrock with Agentic Orchestrator and fixed-fee Infor Leap migration."
    }
  ],
  "aws": [
    {
      "title": "Infor launches Industry-Specific AI agents and cloud migration offer",
      "url": "https://www.dqindia.com/news/infor-launches-industry-specific-ai-agents-and-cloud-migration-offer-10572265",
      "snippet": "Infor launches Industry AI Agents on Bedrock with Agentic Orchestrator and fixed-fee Infor Leap migration."
    }
  ],
  "npci": [
    {
      "title": "NPCI pilots APBS and UPI tools to digitize the Microfinance Industry",
      "url": "https://www.dqindia.com/npci-pilots-apbs-and-upi-tools-to-digitize-the-microfinance-industry/",
      "snippet": "NPCI pilot digitizes MFI disbursal via APBS and repayment via UPI USSD for 80M annual transactions."
    },
    {
      "title": "UPI's 52% Surge: What Fintechs Can Learn from India's Digital Payments Revolution",
      "url": "https://www.dqindia.com/business-technologies/upis-52-surge-what-fintechs-can-learn-from-indias-digital-payments-revolution-8738763",
      "snippet": "UPI 78.97B transactions in H1 2024 up 52% YoY analysis and lessons for fintech on scalability and inclusion."
    },
    {
      "title": "Salil Parekh, Harish Mehta, Tejas Networks & NPCI win at the 30th Dataquest ICT Awards",
      "url": "https://www.dqindia.com/salil-parekh-harish-mehta-tejas-networks-npci-win-at-the-30th-dataquest-ict-awards/",
      "snippet": "DQ ICT Awards 30th edition coverage recognizing Infosys CEO, Tejas BharatNet role and NPCI Digital India contribution."
    }
  ],
  "rbl": [
    {
      "title": "NPCI pilots APBS and UPI tools to digitize the Microfinance Industry",
      "url": "https://www.dqindia.com/npci-pilots-apbs-and-upi-tools-to-digitize-the-microfinance-industry/",
      "snippet": "NPCI pilot digitizes MFI disbursal via APBS and repayment via UPI USSD for 80M annual transactions."
    }
  ],
  "hdfc": [
    {
      "title": "NPCI pilots APBS and UPI tools to digitize the Microfinance Industry",
      "url": "https://www.dqindia.com/npci-pilots-apbs-and-upi-tools-to-digitize-the-microfinance-industry/",
      "snippet": "NPCI pilot digitizes MFI disbursal via APBS and repayment via UPI USSD for 80M annual transactions."
    }
  ],
  "tothenew": [
    {
      "title": "TO THE NEW drives digital transformation in the BFSI sector",
      "url": "https://www.dqindia.com/new-drives-digital-transformation-bfsi-sector/",
      "snippet": "TO THE NEW enables digital transformation for 20+ BFSI clients globally using analytics and marketing tech."
    }
  ],
  "delltechnologies": [
    {
      "title": "DQ Top 20 Rank 13 - Dell Technologies India Empowering Innovation and Growth in India and Beyond",
      "url": "https://www.dqindia.com/dq-top-20-rank-13-dell-technologies-india-empowering-innovation-and-growth-in-india-and-beyond/",
      "snippet": "Dell DQ Top20 profile covering multi-cloud, Edge, 5G, AI/ML focus and $26.1B Q1 FY23 record revenue."
    }
  ],
  "patni": [
    {
      "title": "A Promising Quarter",
      "url": "https://www.dqindia.com/a-promising-quarter/",
      "snippet": "Oct-Dec 2004 quarter review of TCS 54% profit growth, Infosys 52%, Wipro 71% and outsourcing trends."
    }
  ],
  "ibm": [
    {
      "title": "IBM and SAP speed up cloud ERP migration with new hyperscaler option",
      "url": "https://www.dqindia.com/news/ibm-and-sap-speed-up-cloud-erp-migration-with-new-hyperscaler-option-9455238",
      "snippet": "IBM Power Virtual Server added as hyperscaler for SAP Cloud ERP Private enabling 90-day S/4HANA migrations."
    }
  ],
  "sap": [
    {
      "title": "IBM and SAP speed up cloud ERP migration with new hyperscaler option",
      "url": "https://www.dqindia.com/news/ibm-and-sap-speed-up-cloud-erp-migration-with-new-hyperscaler-option-9455238",
      "snippet": "IBM Power Virtual Server added as hyperscaler for SAP Cloud ERP Private enabling 90-day S/4HANA migrations."
    }
  ],
  "upi": [
    {
      "title": "UPI's 52% Surge: What Fintechs Can Learn from India's Digital Payments Revolution",
      "url": "https://www.dqindia.com/business-technologies/upis-52-surge-what-fintechs-can-learn-from-indias-digital-payments-revolution-8738763",
      "snippet": "UPI 78.97B transactions in H1 2024 up 52% YoY analysis and lessons for fintech on scalability and inclusion."
    }
  ],
  "fintech": [
    {
      "title": "UPI's 52% Surge: What Fintechs Can Learn from India's Digital Payments Revolution",
      "url": "https://www.dqindia.com/business-technologies/upis-52-surge-what-fintechs-can-learn-from-indias-digital-payments-revolution-8738763",
      "snippet": "UPI 78.97B transactions in H1 2024 up 52% YoY analysis and lessons for fintech on scalability and inclusion."
    }
  ],
  "tejasnetworks": [
    {
      "title": "Salil Parekh, Harish Mehta, Tejas Networks & NPCI win at the 30th Dataquest ICT Awards",
      "url": "https://www.dqindia.com/salil-parekh-harish-mehta-tejas-networks-npci-win-at-the-30th-dataquest-ict-awards/",
      "snippet": "DQ ICT Awards 30th edition coverage recognizing Infosys CEO, Tejas BharatNet role and NPCI Digital India contribution."
    }
  ]
};

export function getDQArticlesForCompany(company: string): DQArticle[] {
  if (!company) return [];
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (dqArticlesDb[clean]) {
    return dqArticlesDb[clean];
  }
  
  for (const [key, articles] of Object.entries(dqArticlesDb)) {
    if (clean.includes(key) || key.includes(clean)) {
      return articles;
    }
  }
  
  return [];
}
