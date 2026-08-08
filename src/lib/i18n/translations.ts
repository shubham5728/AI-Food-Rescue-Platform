export type Language = "en" | "hi" | "gu";

export interface Translations {
  // Brand & Shell
  brandName: string;
  brandTagline: string;
  navDashboard: string;
  navGpsDispatch?: string;
  navDonations: string;
  navRecipients: string;
  navImpact: string;
  navLogin: string;
  navSignOut: string;
  demoMode: string;
  
  // Hero & Landing
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroBadge?: string;
  heroSub?: string;
  btnGetStarted?: string;
  btnViewImpact?: string;
  btnDonate: string;
  btnFind: string;
  btnDashboard: string;
  btnDemo: string;
  aiBadge: string;
  
  // Stats & Counters
  mealsDonated: string;
  foodSaved: string;
  peopleServed: string;
  mealsAtRisk: string;
  unitKg: string;

  // Features (3 Key AI decisions)
  featuresHeading: string;
  featuresSub: string;
  feat1Title: string;
  feat1Body: string;
  feat2Title: string;
  feat2Body: string;
  feat3Title: string;
  feat3Body: string;

  // Guarantee / Trust section
  trustHeading: string;
  trustSub: string;
  trustPoint1: string;
  trustPoint2: string;
  trustPoint3: string;
  donorPreviewTitle: string;
  riskHigh: string;
  riskBody: string;
  matchBest: string;
  matchBody: string;
  priorityCritical: string;
  priorityBody: string;

  // CTA
  ctaTitle: string;
  ctaSub: string;

  // Dashboard Page
  dashTitle: string;
  dashSub: string;
  tabOverview: string;
  tabDonations: string;
  tabRecipients: string;
  tabImpact: string;
  riskScore: string;
  priorityScore: string;
  matchScore: string;
  statusClaimed: string;
  statusPending: string;
  statusDelivered: string;
  statusExpired: string;
  actionClaim: string;
  actionDetails: string;
  filterAll: string;
  filterUrgent: string;

  // Donations Page
  donationsTitle: string;
  donationsSub: string;
  btnNewDonation: string;
  quantity: string;
  expiry: string;
  location: string;
  donor: string;

  // Recipients Page
  recipientsTitle: string;
  recipientsSub: string;
  verifiedBadge: string;
  capacity: string;
  dietPreference: string;

  // Impact Page
  impactTitle: string;
  impactSub: string;
  co2Saved: string;
  rescueRate: string;
  activePartners: string;

  // Login / Auth
  loginTitle: string;
  loginSub: string;
  selectRole: string;
  roleDonor: string;
  roleRecipient: string;
  demoOrgs: string;

  // Common UI
  loading: string;
  close: string;
  save: string;
  languageSelect: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: "FoodBridge AI",
    brandTagline: "Surplus Food Rescue Platform",
    navDashboard: "Dashboard",
    navGpsDispatch: "GPS Dispatch",
    navDonations: "Donations",
    navRecipients: "Recipients",
    navImpact: "Impact",
    navLogin: "Sign In",
    navSignOut: "Sign Out",
    demoMode: "Demo Mode (In-Memory)",

    heroTitle1: "Rescue Surplus Food.",
    heroTitle2: "Feed People In Need.",
    heroSubtitle: "Smart AI instantly matches leftover food from restaurants & caterers with nearby shelters before it spoils.",
    btnDonate: "Donate Food",
    btnFind: "Find Food",
    btnDashboard: "Go to Dashboard",
    btnDemo: "Try Demo",
    aiBadge: "Automated AI Dispatch",

    mealsDonated: "Meals Donated",
    foodSaved: "Food Saved",
    peopleServed: "People Served",
    mealsAtRisk: "Meals At Risk",
    unitKg: "kg",

    featuresHeading: "Smart Rescue in 3 Steps",
    featuresSub: "Real-time AI routing ensures zero wasted food.",
    feat1Title: "1. Waste Risk Scoring",
    feat1Body: "Calculates freshness countdown & urgency score (0-100).",
    feat2Title: "2. Best Recipient Match",
    feat2Body: "Ranks nearby verified shelters by capacity & distance.",
    feat3Title: "3. Priority Dispatch Queue",
    feat3Body: "Alerts coordinators to handle urgent perishables first.",

    trustHeading: "Smart & Reliable Rules",
    trustSub: "Safety and verification come first before AI matches.",
    trustPoint1: "Verified non-profit partners only",
    trustPoint2: "Real travel time calculation",
    trustPoint3: "Auto-filters unreachable destinations",
    donorPreviewTitle: "Live Donor Preview",
    riskHigh: "Waste Risk 87/100 — High",
    riskBody: "1h 30m left • 50 meals ready for pickup",
    matchBest: "Best Match — Hope Kitchen (95%)",
    matchBody: "Vegetarian • 3.2 km away • Ready to receive",
    priorityCritical: "Dispatch Priority 96/100 — Urgent",
    priorityBody: "High priority dispatch alert triggered",

    ctaTitle: "Surplus Food is Available Now",
    ctaSub: "Connect local donors with nearby food banks in minutes.",

    dashTitle: "Rescue Dispatch Dashboard",
    dashSub: "Live monitoring of active donations and AI match rankings.",
    tabOverview: "Overview",
    tabDonations: "Live Donations",
    tabRecipients: "Shelters",
    tabImpact: "Analytics",
    riskScore: "Risk Score",
    priorityScore: "Priority",
    matchScore: "Match Score",
    statusClaimed: "Claimed",
    statusPending: "Available",
    statusDelivered: "Delivered",
    statusExpired: "Expired",
    actionClaim: "Accept Donation",
    actionDetails: "View Details",
    filterAll: "All Listings",
    filterUrgent: "High Risk Only",

    donationsTitle: "Surplus Food Listings",
    donationsSub: "Track active food rescue requests across the city.",
    btnNewDonation: "Create Surplus Listing",
    quantity: "Quantity",
    expiry: "Pickup Deadline",
    location: "Pickup Address",
    donor: "Donor Name",

    recipientsTitle: "Verified Recipient Partners",
    recipientsSub: "Local non-profits and shelters ready to accept meals.",
    verifiedBadge: "FSSAI Audit Passed",
    capacity: "Capacity",
    dietPreference: "Diet Types",

    impactTitle: "Sustainability Impact Command Center",
    impactSub: "Real-time metrics on food rescued, carbon avoided, and lives nourished.",
    co2Saved: "CO₂ Avoided",
    rescueRate: "Rescue Success Rate",
    activePartners: "Active Partners",

    loginTitle: "Sign In to FoodBridge AI",
    loginSub: "Access donor or recipient dashboard with your credentials.",
    selectRole: "Choose Role",
    roleDonor: "Food Donor (Restaurant / Catering)",
    roleRecipient: "Shelter / NGO Recipient",
    demoOrgs: "Quick Demo Accounts (Ahmedabad)",

    loading: "Loading...",
    close: "Close",
    save: "Save",
    languageSelect: "Language",
  },
  hi: {
    brandName: "फूडब्रिज एआई",
    brandTagline: "सरप्लस भोजन बचाव मंच",
    navDashboard: "डैशबोर्ड",
    navGpsDispatch: "जीपीएस डिस्पैच",
    navDonations: "दान सूची",
    navRecipients: "प्राप्तकर्ता",
    navImpact: "प्रभाव",
    navLogin: "साइन इन",
    navSignOut: "साइन आउट",
    demoMode: "डेमो मोड",

    heroTitle1: "बचा हुआ भोजन बचाएं।",
    heroTitle2: "जरूरतमंदों को खिलाएं।",
    heroSubtitle: "स्मार्ट एआई तुरंत रेस्तरां के बचे हुए भोजन को खराब होने से पहले नजदीकी आश्रमों से मिलाता है।",
    btnDonate: "भोजन दान करें",
    btnFind: "भोजन पाएं",
    btnDashboard: "डैशबोर्ड पर जाएं",
    btnDemo: "डेमो देखें",
    aiBadge: "स्वचालित एआई डिस्पैच",

    mealsDonated: "दान किए गए भोजन",
    foodSaved: "बचाया गया भोजन",
    peopleServed: "लाभान्वित लोग",
    mealsAtRisk: "खतरे में भोजन",
    unitKg: "किग्रा",

    featuresHeading: "3 चरणों में स्मार्ट बचाव",
    featuresSub: "वास्तविक समय एआई मार्ग भोजन को बर्बाद होने से रोकता है।",
    feat1Title: "1. अपशिष्ट जोखिम स्कोर",
    feat1Body: "ताजगी उलटी गिनती और तात्कालिकता की गणना करता है।",
    feat2Title: "2. सर्वश्रेष्ठ प्राप्तकर्ता मिलान",
    feat2Body: "समीपस्थ सत्यापित आश्रमों को दूरी के आधार पर रैंक करता है।",
    feat3Title: "3. प्राथमिकता डिस्पैच कतार",
    feat3Body: "तत्काल भोजन को पहले संभालने के लिए सचेत करता है।",

    trustHeading: "स्मार्ट और विश्वसनीय नियम",
    trustSub: "एआई मिलान से पहले सुरक्षा पहली प्राथमिकता है।",
    trustPoint1: "केवल सत्यापित गैर-लाभकारी भागीदार",
    trustPoint2: "वास्तविक यात्रा समय गणना",
    trustPoint3: "पहुंच से बाहर स्थानों को स्वतः फ़िल्टर करता है",
    donorPreviewTitle: "लाइव दाता पूर्वावलोकन",
    riskHigh: "अपशिष्ट जोखिम 87/100 — उच्च",
    riskBody: "1 घंटा 30 मिनट शेष • 50 भोजन तैयार",
    matchBest: "सर्वश्रेष्ठ मिलान — होप किचन (95%)",
    matchBody: "शाकाहारी • 3.2 किमी दूर • स्वीकार करने के लिए तैयार",
    priorityCritical: "डिस्पैच प्राथमिकता 96/100 — अति आवश्यक",
    priorityBody: "उच्च प्राथमिकता डिस्पैच चेतावनी",

    ctaTitle: "अतिरिक्त भोजन अभी उपलब्ध है",
    ctaSub: "स्थानीय दाताओं को मिनटों में नजदीकी फूड बैंकों से जोड़ें।",

    dashTitle: "बचाव डिस्पैच डैशबोर्ड",
    dashSub: "सक्रिय दान और एआई मैच रैंकिंग की लाइव निगरानी।",
    tabOverview: "अवलोकन",
    tabDonations: "लाइव दान",
    tabRecipients: "आश्रम",
    tabImpact: "विश्लेषण",
    riskScore: "जोखिम स्कोर",
    priorityScore: "प्राथमिकता",
    matchScore: "मैच स्कोर",
    statusClaimed: "स्वीकृत",
    statusPending: "उपलब्ध",
    statusDelivered: "डिलीवर हुआ",
    statusExpired: "समाप्त",
    actionClaim: "दान स्वीकार करें",
    actionDetails: "विवरण देखें",
    filterAll: "सभी सूचियां",
    filterUrgent: "केवल उच्च जोखिम",

    donationsTitle: "अतिरिक्त भोजन सूचियां",
    donationsSub: "शहर भर में सक्रिय भोजन बचाव अनुरोधों को ट्रैक करें।",
    btnNewDonation: "नई भोजन सूची बनाएं",
    quantity: "मात्रा",
    expiry: "पिकअप समय सीमा",
    location: "पिकअप पता",
    donor: "दाता का नाम",

    recipientsTitle: "सत्यापित प्राप्तकर्ता भागीदार",
    recipientsSub: "भोजन स्वीकार करने के लिए तैयार स्थानीय आश्रम।",
    verifiedBadge: "एफएसएसएआई ऑडिट उत्तीर्ण",
    capacity: "क्षमता",
    dietPreference: "आहार प्रकार",

    impactTitle: "सतत प्रभाव कमान केंद्र",
    impactSub: "बचाए गए भोजन और पर्यावरण सुरक्षा के वास्तविक समय आंकड़े।",
    co2Saved: "CO₂ बचाव",
    rescueRate: "बचाव सफलता दर",
    activePartners: "सक्रिय भागीदार",

    loginTitle: "फूडब्रिज एआई में साइन इन करें",
    loginSub: "अपने क्रेडेंशियल्स के साथ दाता या प्राप्तकर्ता डैशबोर्ड एक्सेस करें।",
    selectRole: "भूमिका चुनें",
    roleDonor: "भोजन दाता (रेस्तरां / कैटरिंग)",
    roleRecipient: "आश्रम / एनजीओ प्राप्तकर्ता",
    demoOrgs: "त्वरित डेमो खाते (अहमदाबाद)",

    loading: "लोड हो रहा है...",
    close: "बंद करें",
    save: "सहेजें",
    languageSelect: "भाषा",
  },
  gu: {
    brandName: "ફૂડબ્રિજ AI",
    brandTagline: "સરપ્લસ ખોરાક બચાવ પ્લેટફોર્મ",
    navDashboard: "ડેશબોર્ડ",
    navGpsDispatch: "જીપીએસ ડિસ્પેચ",
    navDonations: "દાન યાદી",
    navRecipients: "પ્રાપ્તકર્તાઓ",
    navImpact: "ઈમ્પેક્ટ",
    navLogin: "સાઇન ઇન",
    navSignOut: "સાઇન આઉટ",
    demoMode: "ડેમો મોડ",

    heroTitle1: "વધેલું ભોજન બચાવો.",
    heroTitle2: "જરૂરિયાતમંદોને જમાડો.",
    heroSubtitle: "સ્માર્ટ AI રેસ્ટોરન્ટ્સ અને કેટરર્સના વધેલા ખોરાકને બગાડ થતા પહેલા નજીકના આશ્રમો સાથે જોડે છે.",
    btnDonate: "ખોરાક દાન કરો",
    btnFind: "ખોરાક શોધો",
    btnDashboard: "ડેશબોર્ડ પર જાઓ",
    btnDemo: "ડેમો ટ્રાય કરો",
    aiBadge: "સ્વચાલિત AI ડિસ્પેચ",

    mealsDonated: "દાન કરેલ ભોજન",
    foodSaved: "બચાવેલ ખોરાક",
    peopleServed: "સેવા આપેલ લોકો",
    mealsAtRisk: "જોખમમાં ભોજન",
    unitKg: "કિલો",

    featuresHeading: "3 પગલાંમાં સ્માર્ટ રેસ્ક્યૂ",
    featuresSub: "રીઅલ-ટાઇમ AI રૂટિંગ ખોરાકનો બગાડ અટકાવે છે.",
    feat1Title: "1. વેસ્ટ રિસ્ક સ્કોરિંગ",
    feat1Body: "તાજગી અને તાકીદના સ્કોરની ગણતરી કરે છે.",
    feat2Title: "2. શ્રેષ્ઠ પ્રાપ્તકર્તા મેચ",
    feat2Body: "નજીકના ચકાસાયેલ આશ્રમોને અંતર આધારે રેન્ક કરે છે.",
    feat3Title: "3. પ્રાયોરિટી ડિસ્પેચ ક્યૂ",
    feat3Body: "તાકીદના ભોજનને પ્રથમ પહોંચાડવા ચેતવણી આપે છે.",

    trustHeading: "સ્માર્ટ અને વિશ્વસનીય નિયમો",
    trustSub: "AI મેચિંગ પહેલાં સુરક્ષા પ્રથમ પ્રાથમિકતા છે.",
    trustPoint1: "માત્ર ચકાસાયેલ એનજીઓ ભાગીદારો",
    trustPoint2: "વાસ્તવિક મુસાફરી સમય ગણતરી",
    trustPoint3: "પહોંચ બહારના સ્થાનો આપમેળે ફિલ્ટર થાય છે",
    donorPreviewTitle: "લાઇવ દાન પૂર્વાવલોકન",
    riskHigh: "વેસ્ટ રિસ્ક 87/100 — ઊંચું",
    riskBody: "1 કલાક 30 મિનિટ બાકી • 50 ભોજન તૈયાર",
    matchBest: "શ્રેષ્ઠ મેચ — હોપ કિચન (95%)",
    matchBody: "શાકાહારી • 3.2 કિમી દૂર • સ્વીકારવા તૈયાર",
    priorityCritical: "ડિસ્પેચ પ્રાયોરિટી 96/100 — તાકીદનું",
    priorityBody: "ઉચ્ચ પ્રાથમિકતા ડિસ્પેચ ચેતવણી",

    ctaTitle: "વધારાનું ભોજન અત્યારે ઉપલબ્ધ છે",
    ctaSub: "સ્થાનિક દાતાઓને મિનિટોમાં નજીકના ફૂડ બેંકો સાથે જોડો.",

    dashTitle: "રેસ્ક્યૂ ડિસ્પેચ ડેશબોર્ડ",
    dashSub: "સક્રિય દાન અને AI મેચ રેન્કિંગનું લાઇવ મોનિટરિંગ.",
    tabOverview: "ઓવરવ્યુ",
    tabDonations: "લાઇવ દાન",
    tabRecipients: "આશ્રમો",
    tabImpact: "વિશ્લેષણ",
    riskScore: "રિસ્ક સ્કોર",
    priorityScore: "પ્રાયોરિટી",
    matchScore: "મેચ સ્કોર",
    statusClaimed: "સ્વીકારેલ",
    statusPending: "ઉપલબ્ધ",
    statusDelivered: "ડિલિવર થયેલ",
    statusExpired: "મુદત પૂરી",
    actionClaim: "દાન સ્વીકારો",
    actionDetails: "વિગત જુઓ",
    filterAll: "તમામ યાદી",
    filterUrgent: "માત્ર ઊંચું જોખમ",

    donationsTitle: "વધારાના ભોજનની યાદી",
    donationsSub: "શહેરભરમાં સક્રિય ખોરાક બચાવ વિનંતીઓ ટ્રૅક કરો.",
    btnNewDonation: "નવી દાન યાદી બનાવો",
    quantity: "જથ્થો",
    expiry: "પિકઅપ સમયમર્યાદા",
    location: "પિકઅપ સરનામું",
    donor: "દાતાનું નામ",

    recipientsTitle: "ચકાસાયેલ પ્રાપ્તકર્તા ભાગીદારો",
    recipientsSub: "ભોજન સ્વીકારવા તૈયાર સ્થાનિક આશ્રમો.",
    verifiedBadge: "FSSAI ઓડિટ પાસ",
    capacity: "ક્ષમતા",
    dietPreference: "આહાર પ્રકાર",

    impactTitle: "સસ્ટેનેબિલિટી ઈમ્પેક્ટ કમાન્ડ સેન્ટર",
    impactSub: "બચાવેલ ખોરાક અને પર્યાવરણ સુરક્ષાના લાઇવ આંકડા.",
    co2Saved: "CO₂ બચત",
    rescueRate: "સફળતા દર",
    activePartners: "સક્રિય ભાગીદારો",

    loginTitle: "ફૂડબ્રિજ AI માં સાઇન ઇન કરો",
    loginSub: "તમારા એકાઉન્ટ સાથે ડેશબોર્ડ ઍક્સેસ કરો.",
    selectRole: "ભૂમિકા પસંદ કરો",
    roleDonor: "ભોજન દાતા (રેસ્ટોરન્ટ / કેટરિંગ)",
    roleRecipient: "આશ્રમ / એનજીઓ પ્રાપ્તકર્તા",
    demoOrgs: "ઝડપી ડેમો એકાઉન્ટ્સ (અમદાવાદ)",

    loading: "લોડ થઈ રહ્યું છે...",
    close: "બંધ કરો",
    save: "સાચવો",
    languageSelect: "ભાષા",
  },
};
