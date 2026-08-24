import type { MagazineKey } from "./magazineConfig";

export interface SamplePR {
  id: string;
  title: string;
  company: string;
  /** Which magazine this sample PR belongs to */
  magazine: MagazineKey;
  content: string;
}

export const samplePRs: SamplePR[] = [
  // ──────────────────────── PCQuest ───────────────────────────
  {
    id: "deloitte-quantum",
    title: "Deloitte Quantum Centre (QCoDE) at IIT Bombay",
    company: "Deloitte India",
    magazine: "PCquest",
    content: `DELOITTE INDIA LAUNCHES QUANTUM CENTRE OF DISRUPTION FOR ENTERPRISES (QCoDE) AT IIT BOMBAY CAMPUS

MUMBAI, India – April 8, 2026 – Deloitte India today officially announced the commercial launch of its Quantum Centre of Disruption for Enterprises (QCoDE), a state-of-the-art facility located at the ASPIRE IIT-B Research Park Foundation on the campus of the Indian Institute of Technology (IIT) Bombay.

As a strategic industry-academia collaboration, QCoDE is designed to accelerate the adoption of quantum computing technologies, foster joint research, and develop practical enterprise use-cases for businesses in India. The center aligns directly with India's National Quantum Mission, helping organizations de-risk their technology investments, build a quantum-literate workforce, and transition from experimental pilots to commercial-grade, real-world deployment.

Focus areas for QCoDE include:
- Hybrid Quantum-AI Systems: Accelerating materials science and drug discovery.
- Quantum-Enhanced Logistics: Solving complex route and supply chain optimization problems for Indian shipping and retail enterprises.
- Quantum-Safe Cybersecurity: Preparing critical infrastructure and financial institutions for the post-quantum cryptography (PQC) transition.

"Quantum computing is no longer a futuristic laboratory concept; it is an active frontier that will redefine business competitiveness," said Romal Shetty, Chief Executive Officer, Deloitte South Asia. "By establishing QCoDE on the IIT Bombay campus, we are bridging the gap between cutting-edge scientific research and commercial application. This center will enable Indian enterprises to design quantum strategies today to dominate the markets of tomorrow."

Prof. Subhasis Chaudhuri, Director of IIT Bombay, added: "Collaborations like QCoDE represent the future of technological innovation in India. Combining Deloitte's global consulting network and industry expertise with the deep academic and engineering talent at IIT Bombay will create a powerful engine for quantum IP creation and talent cultivation."

The center begins operations immediately with initial proof-of-concept projects in financial portfolio optimization and logistics scheduling with select Indian conglomerate partners.`
  },
  {
    id: "infosys-ai-services",
    title: "Infosys AI Services & Investor Day Highlights",
    company: "Infosys Limited",
    magazine: "PCquest",
    content: `INFOSYS OUTLINES AI-FIRST VALUE FRAMEWORK AND SCALES AI ADOPTION ACROSS 90% OF TOP CLIENTS

BENGALURU, India – February 18, 2026 – At its annual Investor AI Day, Infosys (NSE, BSE, NYSE: INFY), a global leader in next-generation digital services and consulting, today detailed its scaled AI capabilities and introduced its new "AI-First Value Framework" to capture a projected $300 billion to $400 billion market opportunity for enterprise AI services by 2030.

Infosys revealed that its specialized AI services now account for approximately 5.5% of its quarterly revenue, generating an estimated $275 million to $280 million in Q3 alone. The company is actively executing generative AI programs across 90% of its top 200 clients, with more than 4,600 active AI projects currently underway.

To accelerate implementation, CEO Salil Parekh introduced the AI-First Value Framework, focusing on six growth vectors:
1. AI Strategy and Engineering: Setting foundational infrastructure and roadmaps.
2. Data for AI: Cleaning, structuring, and securing enterprise datasets.
3. Physical AI: Integrating AI into robotics, IoT devices, and factory automation.
4. AI Trust: Establishing safety, compliance, and hallucination guardrails.
5. Process AI: Automating complex end-to-end workflows.
6. Agentic Legacy Modernisation: Employing autonomous AI agents to refactor and upgrade legacy codebases.

"AI is shifting from experimental toolsets to core operational architecture," said Salil Parekh, CEO and MD, Infosys. "Our clients are asking for concrete business value, and our framework is designed to deliver exactly that. We have retrained over 150,000 of our employees in generative AI skills, ensuring we have the engineering depth to execute at scale."

Chairman Nandan Nilekani addressed the broader market landscape, stating: "There is no 'opportunity gap' in AI; the demand is massive. The key differentiator is 'execution risk.' The role of the software professional is evolving from writing syntax to orchestration and prompt engineering. Infosys is leading this transition by ensuring our developers work alongside AI agents, multiplying productivity."

Infosys Topaz, the company's AI-first suite, will continue to serve as the technological foundation for these client initiatives.`
  },
  {
    id: "fynd-create",
    title: "Fynd Launches AI Fashion Platform 'Fynd Create'",
    company: "Fynd",
    magazine: "PCquest",
    content: `FYND LAUNCHES 'FYND CREATE' TO REVOLUTIONIZE THE FASHION LIFECYCLE WITH UNIFIED DESIGN INTELLIGENCE

MUMBAI, India – June 9, 2026 – Fynd, the AI-native retail technology leader backed by Reliance Retail Ventures Limited, today announced the launch of Fynd Create, a unified, AI-powered platform designed to streamline the fashion product lifecycle. By integrating design intelligence, supplier sourcing, and manufacturing into a single digital ecosystem, the platform enables fashion brands to shift from slow seasonal planning to a real-time, demand-driven model.

Fynd Create addresses the fashion industry's urgent need to optimize inventory, accelerate product development cycles, and protect margins. The platform continuously decodes data from global runway movements, cultural trends, social media signals, and retail demand to suggest tailored, commercially viable designs.

Key features of Fynd Create include:
- AI-Assisted Range Planning & Design: Generates collection sketches and technical packages in minutes instead of weeks.
- Integrated Supplier Sourcing: Instantly matches designs with certified manufacturers and fabric mills.
- Concept-to-Delivery Workflows: Synchronizes design feedback, fabric sourcing, production tracking, and catalog distribution.

"Fashion is experiencing a massive compression in trend cycles, and traditional supply chains cannot keep up," said Farooq Adam, Co-founder of Fynd. "Fynd Create empowers design teams to move from concept to manufacturing sample in under a week. Leveraging our existing commerce infrastructure—which supports 2,300+ brands and 800+ vendors—we are building the operating system for next-generation, responsive retail."

The platform is commercially available starting today for fashion brands, retailers, and independent designers globally.`
  },
  {
    id: "mercury-security",
    title: "Mercury Security MP Intelligent Controllers Launch",
    company: "Mercury Security",
    magazine: "PCquest",
    content: `MERCURY SECURITY ANNOUNCES COMMERCIAL LAUNCH OF EMBEDDED APPLICATION ENVIRONMENT ON MP CONTROLLERS

AUSTIN, Texas – June 3, 2026 – Mercury Security, an HID Global brand and the global leader in open-architecture access control hardware, today announced the commercial launch of its embedded application environment. This platform allows technology partners and Original Equipment Manufacturers (OEMs) to build and execute custom applications directly on Mercury MP Series Intelligent Controllers.

By executing business logic at the edge (on the physical controller), the new environment reduces network dependency, eliminates server latency, and enhances local security system availability and redundancy.

Mercury also announced three premier integration partners who participated in the platform's preview phase:
- Commend Edge Bridge: Direct, hardware-level audio and display data transfer.
- HiveWatch: Unified physical security operations and real-time controller health monitoring.
- PassiveBolt (KeyShare Connect): Decentralized, door-level identity verification using digital credentials and mobile driving licenses.

"The commercial launch of the MP Series embedded environment transforms access control hardware into an active, programmable edge platform," said Matt Barnette, President of Mercury Security. "OEMs can now deploy custom automation, advanced analytics, and direct cloud connections right where the physical security action happens. This drastically simplifies deployment architectures and hardens cybersecurity profiles."

The developer SDK and environment are now available to all certified Mercury partners globally through a structured onboarding and security review process.`
  },
  {
    id: "krisp-appointment",
    title: "Krisp Appoints Graham Brown as Chief Growth Officer",
    company: "Krisp",
    magazine: "PCquest",
    content: `KRISP APPOINTS CONTACT CENTER VETERAN GRAHAM BROWN AS CHIEF GROWTH OFFICER FOR EUROPE AND AFRICA

SAN FRANCISCO, CA – June 1, 2026 – Krisp, the pioneer and leader in real-time Voice AI technology, today announced the appointment of Graham Brown as Chief Growth Officer (CGO) for Europe and Africa. Brown will lead the commercial expansion of Krisp's AI solutions in key international contact center hubs and Business Process Outsourcing (BPO) agencies.

Brown brings nearly 30 years of contact center and Customer Experience (CX) outsourcing experience, having held senior leadership roles at Capita, Alorica, HGS, and Teleperformance. At Krisp, he will report directly to Harry Folloder, Chief Commercial Officer, and will focus on scaling Krisp's noise-cancellation, translation, and agent-assistance solutions across multilingual and multi-shore enterprises.

"We are entering a phase of rapid Voice AI adoption in the global customer service industry," said Harry Folloder, CCO of Krisp. "Graham's deep operational expertise inside major BPO organizations is exactly what Krisp needs to help our enterprise clients deploy Voice AI successfully while navigating complex regulatory landscapes, such as GDPR and the EU AI Act."

Graham Brown commented: "I have spent decades managing customer experience centers, and noise interference remains one of the largest challenges to productivity and customer satisfaction. Krisp's technology solves this at the source. I am excited to join the team and bring these transformative AI productivity gains to BPOs and enterprises across Europe and Africa."

The appointment is effective immediately, with Brown operating from Krisp's European regional headquarters.`
  },

  // ──────────────────────── DataQuest ─────────────────────────
  {
    id: "dq-meity-digital-india",
    title: "MeitY Launches Digital India 2.0 — AI & Semiconductor Focus",
    company: "MeitY",
    magazine: "Dataquest",
    content: `MEITY ANNOUNCES DIGITAL INDIA 2.0 WITH ₹1.25 LAKH CRORE INVESTMENT IN AI, SEMICONDUCTORS, AND RURAL BROADBAND

NEW DELHI, India – March 15, 2026 – The Ministry of Electronics and Information Technology (MeitY) today unveiled the Digital India 2.0 framework, a comprehensive national technology blueprint backed by a ₹1.25 lakh crore investment over five years. The initiative builds on the foundational achievements of Digital India Phase 1, shifting focus toward artificial intelligence infrastructure, semiconductor self-reliance, and last-mile digital connectivity.

The Digital India 2.0 programme comprises three primary pillars:

1. AI for India Mission: Establishment of five sovereign AI compute clusters (each with 10,000+ GPU capacity), a National AI Data Exchange, and a Responsible AI Certification Framework for public sector deployments.

2. Semiconductor & Display Fabrication Incentives: Extension of the India Semiconductor Mission with enhanced PLI incentives, targeting 5 operational chip fabs by 2030 and 50,000 trained semiconductor engineers through IIT-industry partnerships.

3. BharatNet Phase III: Deployment of optical fibre to all remaining 1.2 lakh gram panchayats with mandatory 100 Mbps symmetric broadband by December 2027.

Union Minister for Electronics & IT, Ashwini Vaishnaw, stated: "Digital India 2.0 is not a continuation — it's a technological leap. We are shifting India from a digital consumer nation to a digital producer nation. The semiconductor mission and sovereign AI compute are the twin engines that will power this transformation."

The Ministry confirmed that MeitY will partner with NASSCOM, IIT Council, and the Invest India agency to coordinate private sector participation. Early industry partners confirmed include TCS (AI skilling), Infosys (data governance), and Tata Electronics (semiconductor packaging).

Implementation monitoring will be tracked through a new MeitY Digital Dashboard accessible to citizens and industry alike.`
  },
  {
    id: "dq-tcs-ai-contract",
    title: "TCS Bags ₹8,000 Crore AI Modernisation Contract from Indian Bank",
    company: "TCS",
    magazine: "Dataquest",
    content: `TCS WINS ₹8,000 CRORE, 7-YEAR AI-POWERED CORE BANKING MODERNISATION CONTRACT FROM LEADING PUBLIC SECTOR BANK

MUMBAI, India – April 22, 2026 – Tata Consultancy Services (TCS) (NSE: TCS) today announced the signing of a multi-year contract valued at approximately ₹8,000 crore with a leading Indian public sector bank for a comprehensive AI-powered core banking modernisation programme. This represents one of the largest IT services contracts awarded by the Indian BFSI sector in FY2026.

The engagement covers a full-stack digital transformation across the bank's retail, corporate, and agricultural lending divisions, serving a customer base of over 120 million account holders across 9,500 branches.

Scope of work includes:
- Legacy Core Migration: Transition from a 25-year-old mainframe-based core banking platform to TCS BaNCS on a hybrid cloud architecture (Azure + on-premises data centres in compliance with RBI data localisation norms).
- AI-Powered Credit Decisioning: Deployment of TCS' Mastercraft AI suite for real-time credit scoring using alternative data sources, targeting a 40% reduction in NPA detection time.
- Branch Automation & Digital Channels: Rollout of TCS' omni-channel banking platform across all branches with AI chatbot integration for Tier-3 and Tier-4 language support (12 Indian languages).
- Cybersecurity Overhaul: Zero-trust architecture implementation with 24x7 Security Operations Centre managed by TCS.

K. Krithivasan, CEO & Managing Director of TCS, commented: "This contract validates TCS BaNCS as the platform of choice for India's banking transformation. Our AI-integrated approach will help this institution dramatically improve credit access for underserved segments while reducing operational costs by an estimated 28% over the contract period."

The programme is expected to create approximately 3,500 TCS jobs, primarily in Pune, Hyderabad, and Chennai delivery centres. Go-live for Phase 1 (core migration and AI credit engine) is targeted for Q3 FY2027.`
  },

  // ──────────────────────── Voice & Data ──────────────────────
  {
    id: "vnd-jio-5g-sa",
    title: "Jio Completes 5G Standalone Rollout Across 700 Indian Cities",
    company: "Reliance Jio",
    magazine: "Voice&Data",
    content: `RELIANCE JIO COMPLETES 5G STANDALONE NETWORK DEPLOYMENT ACROSS 700 CITIES; ACTIVATES NETWORK SLICING FOR ENTERPRISE CUSTOMERS

MUMBAI, India – May 5, 2026 – Reliance Jio Infocomm Limited today announced the completion of its 5G Standalone (SA) network rollout across 700 Indian cities, making it the first Indian operator to deploy a full SA core nationwide at this scale. The milestone marks the transition from Non-Standalone (NSA) 5G infrastructure to a purpose-built 5G Standalone architecture capable of supporting network slicing, ultra-low latency applications, and massive IoT deployments.

Key technical milestones:
- Network Architecture: Full 5G SA core (based on 3GPP Release 16) deployed across all 22 telecom circles, with 700 MHz (Band 28) providing deep indoor and rural coverage, and 3.5 GHz (Band 78) delivering capacity in urban dense zones.
- Latency Achievement: Sub-10ms end-to-end latency recorded in controlled enterprise testing environments, enabling real-time industrial automation and remote surgery pilot use cases.
- Network Slicing Activation: Jio has activated the first commercial network slice for three enterprise verticals: Smart Manufacturing (with Tata Motors, Nashik plant), Smart Ports (with JNPT, Mumbai), and Healthcare (with Fortis Hospitals, NCR).
- IoT Readiness: 5G SA core supports 1 million device connections per km², targeting India's growing smart city and agricultural IoT deployments.

Akash Ambani, Chairman of Reliance Jio, stated: "Today's milestone is not just a network announcement. This is the foundation for India's industrial revolution — Industry 4.0, smart agriculture, and intelligent cities all run on 5G Standalone. Jio has built this for India, and India's enterprises are already using it."

Jio also confirmed that JioAirFiber Fixed Wireless Access services will be upgraded to leverage the 5G SA core's enhanced QoS mechanisms, targeting 500 Mbps symmetric speeds for residential FWA customers by Q4 FY2026.

TRAI Chairman P.D. Vaghela acknowledged the achievement: "The deployment of 5G SA at national scale by a private operator ahead of schedule reflects the success of India's spectrum assignment policy and the resilience of indigenous network build capabilities."

Jio's 5G network currently serves over 150 million active 5G users, with enterprise customers accessing dedicated slice contracts through Jio Business.`
  },
  {
    id: "vnd-airtel-starlink-partnership",
    title: "Airtel and Starlink Sign India Distribution Partnership for Rural Broadband",
    company: "Bharti Airtel",
    magazine: "Voice&Data",
    content: `BHARTI AIRTEL AND SPACEX STARLINK ANNOUNCE INDIA DISTRIBUTION PARTNERSHIP TO ACCELERATE RURAL BROADBAND CONNECTIVITY

NEW DELHI, India – June 10, 2026 – Bharti Airtel Limited (NSE: BHARTIARTL) and SpaceX today announced a strategic distribution partnership under which Airtel will serve as the exclusive retail distribution partner for Starlink satellite broadband services across India. The partnership positions Airtel's extensive retail footprint of 1.5 million outlets and 3,50,000 Airtel banking points as the primary last-mile delivery network for Starlink hardware kits and subscription services.

Under the agreement:
- Distribution Scope: Airtel will distribute Starlink Gen 3 hardware kits (retail price ₹29,999) and manage subscription billing through its Airtel Thanks platform, with dedicated Starlink counters at all Airtel Experience Centres (450 locations).
- Target Segments: Primary focus on households and small enterprises in Tier-3, Tier-4, and rural areas outside optical fibre and 4G/5G terrestrial coverage — estimated addressable market of 80 million households.
- BharatNet Complement: The partnership specifically targets areas designated under BharatNet Phase III where fibre deployment timelines extend beyond 2027, ensuring interim connectivity through LEO satellite.
- Technical Performance: Starlink Gen 3 delivers 250 Mbps download, 40 Mbps upload, and sub-40ms latency in Indian coverage zones, with 99.5% uptime SLA commitment.

Gopal Vittal, MD & CEO of Bharti Airtel, stated: "This partnership is about getting India connected — all of India. Terrestrial networks are the backbone, but satellite fills the gaps geography creates. With Starlink's performance and Airtel's distribution muscle, we can realistically close India's digital divide within three years."

Elon Musk confirmed via post on X: "Starlink + Airtel = internet for rural India. This is a big deal."

The partnership requires no additional spectrum licensing from the Department of Telecommunications (DoT), as Starlink operates under existing GMPCS (Global Mobile Personal Communications by Satellite) licences. TRAI is monitoring pricing to ensure compliance with interconnection and fair competition norms.

Commercial availability of Starlink through Airtel retail channels begins July 1, 2026.`
  },
];
