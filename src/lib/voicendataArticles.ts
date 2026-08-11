// ─────────────────────────────────────────────────────────────
// voicendataArticles.ts
// Official Reference article database for Voice&Data (voicendata.com).
// Populated directly from VoiceAndData.csv
// ─────────────────────────────────────────────────────────────

export interface VnDArticle {
  title: string;
  url: string;
  snippet: string;
}

export const vndArticlesDb: Record<string, VnDArticle[]> = {
  "jio": [
    {
      "title": "Jio leads India's 5G user growth, widens gap over Airtel",
      "url": "https://www.voicendata.com/5g/jio-leads-indias-5g-user-growth-widens-gap-over-airtel-10913705",
      "snippet": "Jio added 144M 5G users vs Airtel 102M in 2 years, leads in FWA and UBR subscriber growth."
    },
    {
      "title": "Jio's 5G dominated Maha Kumbh Mela 2025, says Ookla",
      "url": "https://www.voicendata.com/news/jios-5g-dominated-maha-kumbh-mela-2025-says-ookla-8840077",
      "snippet": "Ookla reports Jio 5G 83.9% availability vs Airtel 42.4% at Kumbh Mela with 201 Mbps median speed."
    },
    {
      "title": "With over 1 lakh 5G BTS deployed, India has the fastest 5G rollout",
      "url": "https://www.voicendata.com/with-over-1-lakh-5g-bts-deployed-india-has-the-fastest-5g-rollout/",
      "snippet": "DoT data shows 1,02,215 5G BTS as of March 2023, Maharashtra leads, Jio 17,687 vs Airtel 3,293 in Nov 2022."
    },
    {
      "title": "India adds 52,776 5G BTS in 2024, slow growth for 5G rollout",
      "url": "https://www.voicendata.com/news/india-adds-52776-5g-bts-in-2024-slow-growth-for-5g-rollout-8624145",
      "snippet": "Total 5G BTS 464,990 by Dec 2024, Jio SA leads, Airtel NSA cost-effective, Vi to lead 2026."
    },
    {
      "title": "Airtel and Jio dominate national 5G metrics, Vi makes regional gains",
      "url": "https://www.voicendata.com/research/airtel-and-jio-dominate-national-5g-metrics-vi-makes-regional-gains-9337991",
      "snippet": "Opensignal: Airtel leads 5G video/gaming speed, Jio leads availability, Vi now in 4 circles and on par in Mumbai."
    },
    {
      "title": "Satellite Internet: A high-stakes race for India's remote connections",
      "url": "https://www.voicendata.com/space/satellite-internet-a-high-stakes-race-for-indias-remote-connections-10229046",
      "snippet": "Three-way race: Starlink consumer LEO, JioSpaceFiber MEO+GEO B2B, OneWeb enterprise via Hughes for BharatNet backhaul."
    },
    {
      "title": "M2M Connections Emerge as Telecom Growth Anchor for Airtel, Jio and Vi",
      "url": "https://www.voicendata.com/internet-of-things/m2m-growth-helps-indian-telcos-navigate-consumer-subscriber-swings-12147706",
      "snippet": "M2M grows Jan-May 2026: Airtel 70M to 80M, Jio 20.6M to 25.1M, Vi 18.8M to 21M offsetting consumer churn."
    },
    {
      "title": "India's vision for a digital and equitable future: TRAI chairman speaks",
      "url": "https://www.voicendata.com/news/starlink-reportedly-receives-gmpcs-license-from-dot-in-india-at-last/",
      "snippet": "TRAI chairman notes 2.14 lakh GPs on BharatNet fibre, 5000 via satellite, digital inclusion vision."
    }
  ],
  "airtel": [
    {
      "title": "Jio leads India's 5G user growth, widens gap over Airtel",
      "url": "https://www.voicendata.com/5g/jio-leads-indias-5g-user-growth-widens-gap-over-airtel-10913705",
      "snippet": "Jio added 144M 5G users vs Airtel 102M in 2 years, leads in FWA and UBR subscriber growth."
    },
    {
      "title": "With over 1 lakh 5G BTS deployed, India has the fastest 5G rollout",
      "url": "https://www.voicendata.com/with-over-1-lakh-5g-bts-deployed-india-has-the-fastest-5g-rollout/",
      "snippet": "DoT data shows 1,02,215 5G BTS as of March 2023, Maharashtra leads, Jio 17,687 vs Airtel 3,293 in Nov 2022."
    },
    {
      "title": "India adds 52,776 5G BTS in 2024, slow growth for 5G rollout",
      "url": "https://www.voicendata.com/news/india-adds-52776-5g-bts-in-2024-slow-growth-for-5g-rollout-8624145",
      "snippet": "Total 5G BTS 464,990 by Dec 2024, Jio SA leads, Airtel NSA cost-effective, Vi to lead 2026."
    },
    {
      "title": "Airtel and Jio dominate national 5G metrics, Vi makes regional gains",
      "url": "https://www.voicendata.com/research/airtel-and-jio-dominate-national-5g-metrics-vi-makes-regional-gains-9337991",
      "snippet": "Opensignal: Airtel leads 5G video/gaming speed, Jio leads availability, Vi now in 4 circles and on par in Mumbai."
    },
    {
      "title": "Airtel deploys India's first private 5G network at Bosch facility",
      "url": "https://www.voicendata.com/airtel-deploys-indias-first-private-5g-network-at-bosch-facility/",
      "snippet": "Airtel trial at Bosch Bengaluru using DoT trial spectrum for AOI quality inspection and automated operations."
    },
    {
      "title": "M2M Connections Emerge as Telecom Growth Anchor for Airtel, Jio and Vi",
      "url": "https://www.voicendata.com/internet-of-things/m2m-growth-helps-indian-telcos-navigate-consumer-subscriber-swings-12147706",
      "snippet": "M2M grows Jan-May 2026: Airtel 70M to 80M, Jio 20.6M to 25.1M, Vi 18.8M to 21M offsetting consumer churn."
    },
    {
      "title": "India's vision for a digital and equitable future: TRAI chairman speaks",
      "url": "https://www.voicendata.com/news/starlink-reportedly-receives-gmpcs-license-from-dot-in-india-at-last/",
      "snippet": "TRAI chairman notes 2.14 lakh GPs on BharatNet fibre, 5000 via satellite, digital inclusion vision."
    }
  ],
  "ookla": [
    {
      "title": "Jio's 5G dominated Maha Kumbh Mela 2025, says Ookla",
      "url": "https://www.voicendata.com/news/jios-5g-dominated-maha-kumbh-mela-2025-says-ookla-8840077",
      "snippet": "Ookla reports Jio 5G 83.9% availability vs Airtel 42.4% at Kumbh Mela with 201 Mbps median speed."
    }
  ],
  "dot": [
    {
      "title": "With over 1 lakh 5G BTS deployed, India has the fastest 5G rollout",
      "url": "https://www.voicendata.com/with-over-1-lakh-5g-bts-deployed-india-has-the-fastest-5g-rollout/",
      "snippet": "DoT data shows 1,02,215 5G BTS as of March 2023, Maharashtra leads, Jio 17,687 vs Airtel 3,293 in Nov 2022."
    },
    {
      "title": "TRAI rejects lower satcom spectrum fees for BSNL",
      "url": "https://www.voicendata.com/news/trai-rejects-lower-satcom-spectrum-fees-for-bsnl-10914604",
      "snippet": "TRAI says BSNL must pay 4% AGR like others for satcom, overturns DoT proposal of 1% to ensure level playing field."
    },
    {
      "title": "TRAI outlines spectrum charges and conditions for Satcom services",
      "url": "https://www.voicendata.com/news/trai-outlines-spectrum-charges-and-conditions-for-satcom-services-9052398",
      "snippet": "TRAI proposes Rs 3500 per MHz annual fee plus 4% AGR for satcom, 5-year validity with 2-year extension."
    },
    {
      "title": "TRAI issues revised guidelines for M2M SIM ownership and critical IoT services",
      "url": "https://www.voicendata.com/news/trai-issues-revised-guidelines-for-m2m-sim-ownership-and-critical-iot-services-8992008",
      "snippet": "TRAI technology-agnostic framework for critical IoT, MTCTE for M2M modules, SIM transfer on merger."
    },
    {
      "title": "Government Takes Steps for Proliferation and Innovation in M2M",
      "url": "https://www.voicendata.com/government-takes-steps-proliferation-innovation-m2m/",
      "snippet": "Govt registers M2M SPs, new UL M2M licenses, 13-digit numbering, eSIM OTA for M2M ecosystem."
    },
    {
      "title": "Bharat Net Phase 1 is Finally Over; Big Step in Digital India Journey",
      "url": "https://www.voicendata.com/bharat-net-phase-1-finally-big-step-digital-india-journey/",
      "snippet": "Phase 1 completes 1.1 lakh villages on 2.55 lakh km fiber, Phase 2 target 1.5 lakh GPs by Dec 2018."
    },
    {
      "title": "Starlink reportedly receives GMPCS license from DoT in India at Last",
      "url": "https://www.voicendata.com/news/oneweb-agrees-to-satellite-launch-program-with-new-space-india/",
      "snippet": "Starlink gets GMPCS license after OneWeb and Jio Satellite, third to offer satcom broadband."
    },
    {
      "title": "TRAI consultation signals shift in satellite spectrum policy",
      "url": "https://www.voicendata.com/news/trai-consultation-signals-shift-in-satellite-spectrum-policy-XXXXX",
      "snippet": "TRAI proposes network-level authorization and lower growth-oriented pricing for nascent satcom."
    }
  ],
  "vi": [
    {
      "title": "India adds 52,776 5G BTS in 2024, slow growth for 5G rollout",
      "url": "https://www.voicendata.com/news/india-adds-52776-5g-bts-in-2024-slow-growth-for-5g-rollout-8624145",
      "snippet": "Total 5G BTS 464,990 by Dec 2024, Jio SA leads, Airtel NSA cost-effective, Vi to lead 2026."
    },
    {
      "title": "Vi expands 5G rollout to 23 additional cities across India",
      "url": "https://www.voicendata.com/5g/vi-expands-5g-rollout-to-23-additional-cities-across-india-9450737",
      "snippet": "Vi launches 5G in 23 cities including Ahmedabad, Jaipur, Kolkata, unlimited 5G on Rs 299 plans."
    },
    {
      "title": "Airtel and Jio dominate national 5G metrics, Vi makes regional gains",
      "url": "https://www.voicendata.com/research/airtel-and-jio-dominate-national-5g-metrics-vi-makes-regional-gains-9337991",
      "snippet": "Opensignal: Airtel leads 5G video/gaming speed, Jio leads availability, Vi now in 4 circles and on par in Mumbai."
    },
    {
      "title": "M2M Connections Emerge as Telecom Growth Anchor for Airtel, Jio and Vi",
      "url": "https://www.voicendata.com/internet-of-things/m2m-growth-helps-indian-telcos-navigate-consumer-subscriber-swings-12147706",
      "snippet": "M2M grows Jan-May 2026: Airtel 70M to 80M, Jio 20.6M to 25.1M, Vi 18.8M to 21M offsetting consumer churn."
    },
    {
      "title": "India's vision for a digital and equitable future: TRAI chairman speaks",
      "url": "https://www.voicendata.com/news/starlink-reportedly-receives-gmpcs-license-from-dot-in-india-at-last/",
      "snippet": "TRAI chairman notes 2.14 lakh GPs on BharatNet fibre, 5000 via satellite, digital inclusion vision."
    }
  ],
  "trai": [
    {
      "title": "Spectrum sharing as a solution",
      "url": "https://www.voicendata.com/spectrum-sharing-solution/",
      "snippet": "TRAI allows spectrum sharing in 800-2500 MHz bands with 0.5% additional SUC to improve efficiency."
    },
    {
      "title": "TRAI rejects lower satcom spectrum fees for BSNL",
      "url": "https://www.voicendata.com/news/trai-rejects-lower-satcom-spectrum-fees-for-bsnl-10914604",
      "snippet": "TRAI says BSNL must pay 4% AGR like others for satcom, overturns DoT proposal of 1% to ensure level playing field."
    },
    {
      "title": "TRAI outlines spectrum charges and conditions for Satcom services",
      "url": "https://www.voicendata.com/news/trai-outlines-spectrum-charges-and-conditions-for-satcom-services-9052398",
      "snippet": "TRAI proposes Rs 3500 per MHz annual fee plus 4% AGR for satcom, 5-year validity with 2-year extension."
    },
    {
      "title": "TRAI rejects COAI's recommendations on satcom spectrum allocation",
      "url": "https://www.voicendata.com/news/trai-rejects-coais-recommendations-on-satcom-spectrum-allocation-9337574",
      "snippet": "TRAI sticks to 4% AGR administrative allocation for satcom despite COAI objections from Jio and Airtel."
    },
    {
      "title": "M2M Connections Emerge as Telecom Growth Anchor for Airtel, Jio and Vi",
      "url": "https://www.voicendata.com/internet-of-things/m2m-growth-helps-indian-telcos-navigate-consumer-subscriber-swings-12147706",
      "snippet": "M2M grows Jan-May 2026: Airtel 70M to 80M, Jio 20.6M to 25.1M, Vi 18.8M to 21M offsetting consumer churn."
    },
    {
      "title": "TRAI consultation signals shift in satellite spectrum policy",
      "url": "https://www.voicendata.com/news/trai-consultation-signals-shift-in-satellite-spectrum-policy-XXXXX",
      "snippet": "TRAI proposes network-level authorization and lower growth-oriented pricing for nascent satcom."
    }
  ],
  "bsnl": [
    {
      "title": "TRAI rejects lower satcom spectrum fees for BSNL",
      "url": "https://www.voicendata.com/news/trai-rejects-lower-satcom-spectrum-fees-for-bsnl-10914604",
      "snippet": "TRAI says BSNL must pay 4% AGR like others for satcom, overturns DoT proposal of 1% to ensure level playing field."
    },
    {
      "title": "High-speed internet via optical fibre to reach 6 lakh villages within three years",
      "url": "https://www.voicendata.com/broadband/high-speed-internet-via-optical-fibre-to-reach-6-lakh-villages-within-three-years-9498309",
      "snippet": "BharatNet Phase 3 Rs 1.39 lakh crore to connect 2.5 lakh GPs and 6 lakh villages, 12 packages awarded."
    },
    {
      "title": "India's BTS count surges to 29.43 lakh in November 2024",
      "url": "https://www.voicendata.com/news/indias-bts-count-surges-to-2943-lakh-in-november-2024-7659259",
      "snippet": "Total BTS 6.49L in 2014 to 29.43L in Nov 2024, 4.6L 5G BTS, BharatNet revised cost Rs 1,39,579 cr."
    },
    {
      "title": "India's vision for a digital and equitable future: TRAI chairman speaks",
      "url": "https://www.voicendata.com/news/starlink-reportedly-receives-gmpcs-license-from-dot-in-india-at-last/",
      "snippet": "TRAI chairman notes 2.14 lakh GPs on BharatNet fibre, 5000 via satellite, digital inclusion vision."
    }
  ],
  "coai": [
    {
      "title": "TRAI rejects COAI's recommendations on satcom spectrum allocation",
      "url": "https://www.voicendata.com/news/trai-rejects-coais-recommendations-on-satcom-spectrum-allocation-9337574",
      "snippet": "TRAI sticks to 4% AGR administrative allocation for satcom despite COAI objections from Jio and Airtel."
    }
  ],
  "oneweb": [
    {
      "title": "Universal connectivity should be the birth right for all in wireless world of the future: Sunil Mittal, OneWeb",
      "url": "https://www.voicendata.com/universal-connectivity-should-be-the-birth-right-for-all-in-wireless-world-of-the-future-sunil-mittal-oneweb/",
      "snippet": "Sunil Mittal outlines OneWeb LEO 462 satellites, 1.1 Tbps capacity, collaboration with ISRO and SpaceX."
    },
    {
      "title": "Satellite Internet: A high-stakes race for India's remote connections",
      "url": "https://www.voicendata.com/space/satellite-internet-a-high-stakes-race-for-indias-remote-connections-10229046",
      "snippet": "Three-way race: Starlink consumer LEO, JioSpaceFiber MEO+GEO B2B, OneWeb enterprise via Hughes for BharatNet backhaul."
    },
    {
      "title": "OneWeb agrees to satellite launch program with New Space India",
      "url": "https://www.voicendata.com/news/trai-consultation-signals-shift-in-satellite-spectrum-policy/",
      "snippet": "OneWeb 428 satellites in orbit, 36 launched via ISRO NSIL from Sriharikota."
    }
  ],
  "sunilmittal": [
    {
      "title": "Universal connectivity should be the birth right for all in wireless world of the future: Sunil Mittal, OneWeb",
      "url": "https://www.voicendata.com/universal-connectivity-should-be-the-birth-right-for-all-in-wireless-world-of-the-future-sunil-mittal-oneweb/",
      "snippet": "Sunil Mittal outlines OneWeb LEO 462 satellites, 1.1 Tbps capacity, collaboration with ISRO and SpaceX."
    }
  ],
  "starlink": [
    {
      "title": "Satellite Internet: A high-stakes race for India's remote connections",
      "url": "https://www.voicendata.com/space/satellite-internet-a-high-stakes-race-for-indias-remote-connections-10229046",
      "snippet": "Three-way race: Starlink consumer LEO, JioSpaceFiber MEO+GEO B2B, OneWeb enterprise via Hughes for BharatNet backhaul."
    },
    {
      "title": "Starlink reportedly receives GMPCS license from DoT in India at Last",
      "url": "https://www.voicendata.com/news/oneweb-agrees-to-satellite-launch-program-with-new-space-india/",
      "snippet": "Starlink gets GMPCS license after OneWeb and Jio Satellite, third to offer satcom broadband."
    }
  ],
  "vibusiness": [
    {
      "title": "Vi Business launches Hybrid SD-WAN for improved Enterprise Networking",
      "url": "https://www.voicendata.com/vi-business-launches-hybrid-sd-wan-for-improved-enterprise-networking/",
      "snippet": "Vi Business Hybrid SD-WAN with ILL/MPLS/4G/5G integration, real-time analytics, Nokia Fortinet partnership."
    }
  ],
  "nokia": [
    {
      "title": "Vi Business launches Hybrid SD-WAN for improved Enterprise Networking",
      "url": "https://www.voicendata.com/vi-business-launches-hybrid-sd-wan-for-improved-enterprise-networking/",
      "snippet": "Vi Business Hybrid SD-WAN with ILL/MPLS/4G/5G integration, real-time analytics, Nokia Fortinet partnership."
    },
    {
      "title": "Vi expands 5G rollout with AI-powered SON and Nokia Ericsson partnership",
      "url": "https://www.voicendata.com/5g/vi-expands-5g-rollout-to-23-additional-cities-across-india-9450737",
      "snippet": "Vi deploys AI Self-Organising Networks for energy efficiency and seamless 4G-5G integration."
    }
  ],
  "fortinet": [
    {
      "title": "Vi Business launches Hybrid SD-WAN for improved Enterprise Networking",
      "url": "https://www.voicendata.com/vi-business-launches-hybrid-sd-wan-for-improved-enterprise-networking/",
      "snippet": "Vi Business Hybrid SD-WAN with ILL/MPLS/4G/5G integration, real-time analytics, Nokia Fortinet partnership."
    }
  ],
  "vvdn": [
    {
      "title": "VVDN launches end to end private 5G solution for enterprises for SI, OEMs, Telcos",
      "url": "https://www.voicendata.com/vvdn-launches-end-to-end-private-5g-solution-for-si-oems-telcos/",
      "snippet": "VVDN end-to-end private 5G with ORAN radios, CU/DU, 5G core for warehouses, campuses, airports."
    }
  ],
  "infosys": [
    {
      "title": "Infosys Rolls Out Private 5G-as-a-Service to Accelerate Business Value",
      "url": "https://www.voicendata.com/infosys-rolls-out-private-5g-as-a-service-to-accelerate-business-value/",
      "snippet": "Infosys Private 5G-as-a-Service with MEC for remote vehicles, drones, HD video analytics, pay-as-you-go model."
    }
  ],
  "hpe": [
    {
      "title": "Infosys Rolls Out Private 5G-as-a-Service to Accelerate Business Value",
      "url": "https://www.voicendata.com/infosys-rolls-out-private-5g-as-a-service-to-accelerate-business-value/",
      "snippet": "Infosys Private 5G-as-a-Service with MEC for remote vehicles, drones, HD video analytics, pay-as-you-go model."
    }
  ],
  "bosch": [
    {
      "title": "Airtel deploys India's first private 5G network at Bosch facility",
      "url": "https://www.voicendata.com/airtel-deploys-indias-first-private-5g-network-at-bosch-facility/",
      "snippet": "Airtel trial at Bosch Bengaluru using DoT trial spectrum for AOI quality inspection and automated operations."
    }
  ],
  "m2m": [
    {
      "title": "TRAI issues revised guidelines for M2M SIM ownership and critical IoT services",
      "url": "https://www.voicendata.com/news/trai-issues-revised-guidelines-for-m2m-sim-ownership-and-critical-iot-services-8992008",
      "snippet": "TRAI technology-agnostic framework for critical IoT, MTCTE for M2M modules, SIM transfer on merger."
    }
  ],
  "bif": [
    {
      "title": "Government Takes Steps for Proliferation and Innovation in M2M",
      "url": "https://www.voicendata.com/government-takes-steps-proliferation-innovation-m2m/",
      "snippet": "Govt registers M2M SPs, new UL M2M licenses, 13-digit numbering, eSIM OTA for M2M ecosystem."
    }
  ],
  "bharatnet": [
    {
      "title": "Bharat Net Phase 1 is Finally Over; Big Step in Digital India Journey",
      "url": "https://www.voicendata.com/bharat-net-phase-1-finally-big-step-digital-india-journey/",
      "snippet": "Phase 1 completes 1.1 lakh villages on 2.55 lakh km fiber, Phase 2 target 1.5 lakh GPs by Dec 2018."
    },
    {
      "title": "Through HFCL, Jharkhand becomes India's first State to Provide Fiber Optic Connectivity to all Gram Panchayats under BharatNet Program",
      "url": "https://www.voicendata.com/hfcl-jharkhand-becomes-indias-first-state-provide-fiber-optic-connectivity-gram-panchayats-bharatnet-program/",
      "snippet": "HFCL lays 7,765 km OFC connecting 1,789 GPs in Jharkhand, first state-led BharatNet completion."
    },
    {
      "title": "High-speed internet via optical fibre to reach 6 lakh villages within three years",
      "url": "https://www.voicendata.com/broadband/high-speed-internet-via-optical-fibre-to-reach-6-lakh-villages-within-three-years-9498309",
      "snippet": "BharatNet Phase 3 Rs 1.39 lakh crore to connect 2.5 lakh GPs and 6 lakh villages, 12 packages awarded."
    }
  ],
  "hfcl": [
    {
      "title": "Through HFCL, Jharkhand becomes India's first State to Provide Fiber Optic Connectivity to all Gram Panchayats under BharatNet Program",
      "url": "https://www.voicendata.com/hfcl-jharkhand-becomes-indias-first-state-provide-fiber-optic-connectivity-gram-panchayats-bharatnet-program/",
      "snippet": "HFCL lays 7,765 km OFC connecting 1,789 GPs in Jharkhand, first state-led BharatNet completion."
    }
  ],
  "bbnl": [
    {
      "title": "India's BTS count surges to 29.43 lakh in November 2024",
      "url": "https://www.voicendata.com/news/indias-bts-count-surges-to-2943-lakh-in-november-2024-7659259",
      "snippet": "Total BTS 6.49L in 2014 to 29.43L in Nov 2024, 4.6L 5G BTS, BharatNet revised cost Rs 1,39,579 cr."
    }
  ],
  "stl": [
    {
      "title": "STL to deliver T-Fiber's digital infrastructure to 6 million rural citizens of Telangana",
      "url": "https://www.voicendata.com/stl-deliver-t-fiber-based-digital-infrastructure-6-million-rural-citizens-telangana/",
      "snippet": "STL Rs 1800 cr T-Fiber project to deploy 64,000 km OFC with IP MPLS and GPON across 3000 GPs."
    },
    {
      "title": "Inside STL's vision for the future of fibre and AI networks",
      "url": "https://www.voicendata.com/news/indias-vision-for-a-digital-and-equitable-future-trai-chairman-speaks/",
      "snippet": "STL CTO on multi-core fibre, hollow-core fibre, fibre sensing AI and BharatNet role for data centres."
    }
  ],
  "t-fiber": [
    {
      "title": "STL to deliver T-Fiber's digital infrastructure to 6 million rural citizens of Telangana",
      "url": "https://www.voicendata.com/stl-deliver-t-fiber-based-digital-infrastructure-6-million-rural-citizens-telangana/",
      "snippet": "STL Rs 1800 cr T-Fiber project to deploy 64,000 km OFC with IP MPLS and GPON across 3000 GPs."
    }
  ],
  "isro": [
    {
      "title": "OneWeb agrees to satellite launch program with New Space India",
      "url": "https://www.voicendata.com/news/trai-consultation-signals-shift-in-satellite-spectrum-policy/",
      "snippet": "OneWeb 428 satellites in orbit, 36 launched via ISRO NSIL from Sriharikota."
    }
  ],
  "ericsson": [
    {
      "title": "Vi expands 5G rollout with AI-powered SON and Nokia Ericsson partnership",
      "url": "https://www.voicendata.com/5g/vi-expands-5g-rollout-to-23-additional-cities-across-india-9450737",
      "snippet": "Vi deploys AI Self-Organising Networks for energy efficiency and seamless 4G-5G integration."
    }
  ]
};

export function getVnDArticlesForCompany(company: string): VnDArticle[] {
  if (!company) return [];
  const clean = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (vndArticlesDb[clean]) {
    return vndArticlesDb[clean];
  }
  
  for (const [key, articles] of Object.entries(vndArticlesDb)) {
    if (clean.includes(key) || key.includes(clean)) {
      return articles;
    }
  }
  
  return [];
}
