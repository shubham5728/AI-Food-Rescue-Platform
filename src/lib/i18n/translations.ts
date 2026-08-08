export type Language = "en" | "hi" | "gu";

export interface Translations {
  // Brand & Shell
  brandName: string;
  brandTagline: string;
  navDashboard: string;
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
    matchScore: "Match",
    statusClaimed: "Claimed",
    statusPending: "Available",
    statusDelivered: "Delivered",
    statusExpired: "Expired",
    actionClaim: "Claim Food",
    actionDetails: "View Details",
    filterAll: "All Donations",
    filterUrgent: "High Urgency",

    donationsTitle: "Surplus Food Listings",
    donationsSub: "Available surplus food waiting for rescue.",
    btnNewDonation: "New Donation",
    quantity: "Quantity",
    expiry: "Expires In",
    location: "Location",
    donor: "Donor",

    recipientsTitle: "Verified Recipients",
    recipientsSub: "Community kitchens and shelters ready for food distribution.",
    verifiedBadge: "Verified Partner",
    capacity: "Daily Capacity",
    dietPreference: "Dietary Need",

    impactTitle: "Sustainability Impact",
    impactSub: "Tracking food rescued, meals served, and carbon offset.",
    co2Saved: "CO₂ Saved",
    rescueRate: "Rescue Success",
    activePartners: "Active Partners",

    loginTitle: "Sign In to FoodBridge AI",
    loginSub: "Select a demo profile to test the platform instantly.",
    selectRole: "Select Your Role",
    roleDonor: "Food Donor (Restaurant / Hotel)",
    roleRecipient: "Food Receiver (Shelter / NGO)",
    demoOrgs: "Demo Organisations",

    loading: "Loading...",
    close: "Close",
    save: "Save",
    languageSelect: "Language",
  },

  hi: {
    brandName: "फूडब्रिज AI",
    brandTagline: "अतिरिक्त भोजन बचाव प्लेटफॉर्म",
    navDashboard: "डैशबोर्ड",
    navDonations: "दान सूची",
    navRecipients: "प्राप्तकर्ता (NGO)",
    navImpact: "प्रभाव (Analytics)",
    navLogin: "साइन इन",
    navSignOut: "साइन आउट",
    demoMode: "डेमो मोड (इन-मेमोरी)",

    heroTitle1: "बचाएं अतिरिक्त भोजन।",
    heroTitle2: "भूखे लोगों तक पहुँचाएं।",
    heroSubtitle: "स्मार्ट AI तुरंत रेस्टोरेंट और कैटरर्स के बचे भोजन को खराब होने से पहले नजदीकी आश्रमों से मिलाता है।",
    btnDonate: "भोजन दान करें",
    btnFind: "भोजन खोजें",
    btnDashboard: "डैशबोर्ड पर जाएं",
    btnDemo: "डेमो देखें",
    aiBadge: "स्वचालित AI डिस्पैच",

    mealsDonated: "दान किए गए भोजन",
    foodSaved: "बचाया गया भोजन",
    peopleServed: "लाभान्वित लोग",
    mealsAtRisk: "खतरे में भोजन",
    unitKg: "किग्रा",

    featuresHeading: "3 आसान चरणों में भोजन बचाव",
    featuresSub: "रियल-टाइम AI मैचिंग से शून्य भोजन बर्बादी।",
    feat1Title: "1. बर्बादी जोखिम स्कोर",
    feat1Body: "भोजन की ताज़गी और समय सीमा (0-100) की गणना।",
    feat2Title: "2. सर्वश्रेष्ठ आश्रम मैच",
    feat2Body: "दूरी और क्षमता के आधार पर सबसे उपयुक्त आश्रम चुनता है।",
    feat3Title: "3. प्राथमिकता डिस्पैच सूची",
    feat3Body: "जल्द खराब होने वाले भोजन को सबसे पहले पिकअप के लिए भेजता है।",

    trustHeading: "सुरक्षित और विश्वसनीय नियम",
    trustSub: "AI मिलान से पहले सुरक्षा जांच और सत्यापन अनिवार्य है।",
    trustPoint1: "केवल सत्यापित NGO और आश्रम ही शामिल",
    trustPoint2: "वास्तविक यात्रा समय की गणना",
    trustPoint3: "पहुंच से बाहर स्थानों का स्वत: फ़िल्टर",
    donorPreviewTitle: "लाइव दाता पूर्वावलोकन",
    riskHigh: "बर्बादी जोखिम 87/100 — उच्च",
    riskBody: "1 घंटा 30 मिनट शेष • 50 भोजन तैयार",
    matchBest: "सर्वश्रेष्ठ मैच — होप कम्युनिटी (95%)",
    matchBody: "शाकाहारी • 3.2 किमी दूर • स्वीकार करने के लिए तैयार",
    priorityCritical: "डिस्पैच प्राथमिकता 96/100 — अति आवश्यक",
    priorityBody: "उच्च प्राथमिकता वाला पिकअप अलर्ट",

    ctaTitle: "अभी भोजन उपलब्ध है",
    ctaSub: "कुछ ही मिनटों में नजदीकी दानदाताओं और आश्रयों को जोड़ें।",

    dashTitle: "रेस्क्यू डिस्पैच डैशबोर्ड",
    dashSub: "सक्रिय भोजन दान और AI रैंकिंग की लाइव निगरानी।",
    tabOverview: "अवलोकन",
    tabDonations: "लाइव दान",
    tabRecipients: "आश्रम / NGO",
    tabImpact: "प्रभाव विश्लेषण",
    riskScore: "जोखिम स्कोर",
    priorityScore: "प्राथमिकता",
    matchScore: "मैच स्कोर",
    statusClaimed: "स्वीकृत (Claimed)",
    statusPending: "उपलब्ध",
    statusDelivered: "वितरित (Delivered)",
    statusExpired: "समाप्त (Expired)",
    actionClaim: "भोजन लें",
    actionDetails: "विवरण देखें",
    filterAll: "सभी दान",
    filterUrgent: "अति आवश्यक",

    donationsTitle: "अतिरिक्त भोजन सूची",
    donationsSub: "उपलब्ध भोजन जो वितरण के लिए तैयार है।",
    btnNewDonation: "+ नया भोजन दान",
    quantity: "मात्रा",
    expiry: "समय सीमा",
    location: "स्थान",
    donor: "दाता",

    recipientsTitle: "सत्यापित प्राप्तकर्ता (NGOs)",
    recipientsSub: "भोजन वितरण के लिए तैयार आश्रम एवं भोजन बैंक।",
    verifiedBadge: "सत्यापित पार्टनर",
    capacity: "दैनिक क्षमता",
    dietPreference: "आहार प्रकार",

    impactTitle: "पर्यावरण एवं सामाजिक प्रभाव",
    impactSub: "बचाया गया भोजन, भोजन पाए लोग और CO₂ बचत।",
    co2Saved: "CO₂ की बचत",
    rescueRate: "सफलता दर",
    activePartners: "सक्रिय पार्टनर",

    loginTitle: "फूडब्रिज AI में लॉग इन करें",
    loginSub: "तुरंत टेस्ट करने के लिए डेमो प्रोफाइल चुनें।",
    selectRole: "अपनी भूमिका चुनें",
    roleDonor: "भोजन दाता (रेस्टोरेंट / होटल)",
    roleRecipient: "भोजन प्राप्तकर्ता (आश्रम / NGO)",
    demoOrgs: "डेमो संस्थाएं",

    loading: "लोड हो रहा है...",
    close: "बंद करें",
    save: "सहेजें",
    languageSelect: "भाषा चुनें",
  },

  gu: {
    brandName: "ફૂડબ્રિજ AI",
    brandTagline: "વધારાના ખોરાક બચાવ પ્લેટફોર્મ",
    navDashboard: "ડેશબોર્ડ",
    navDonations: "દાન યાદી",
    navRecipients: "મેળવનાર (NGO)",
    navImpact: "અસર (Analytics)",
    navLogin: "સાઇન ઇન",
    navSignOut: "સાઇન આઉટ",
    demoMode: "ડેમો મોડ (ઇન-મેમરી)",

    heroTitle1: "વધેલો ખોરાક બચાવો.",
    heroTitle2: "જરૂરિયાતમંદો સુધી પહોંચાડો.",
    heroSubtitle: "સ્માર્ટ AI રેસ્ટોરન્ટ અને કેટરર્સનો વધેલો ખોરાક બગડે તે પહેલાં નજીકના આશ્રમો સાથે જોડે છે.",
    btnDonate: "ખોરાક દાન કરો",
    btnFind: "ખોરાક શોધો",
    btnDashboard: "ડેશબોર્ડ પર જાઓ",
    btnDemo: "ડેમો જુઓ",
    aiBadge: "ઓટોમેટેડ AI ડિસ્પેચ",

    mealsDonated: "દાન કરેલ ભોજન",
    foodSaved: "બચાવેલ ખોરાક",
    peopleServed: "લાભાર્થીઓ",
    mealsAtRisk: "જોખમમાં રહેલ ભોજન",
    unitKg: "કિલો",

    featuresHeading: "3 સરળ સ્ટેપમાં ખોરાક બચાવ",
    featuresSub: "રીઅલ-ટાઇમ AI મેચિંગથી ઝીરો વેસ્ટ.",
    feat1Title: "1. બગાડ જોખમ સ્કોર",
    feat1Body: "તાજગી અને સમય મર્યાદા (0-100) ની ગણતરી.",
    feat2Title: "2. શ્રેષ્ઠ આશ્રમ મેચ",
    feat2Body: "અંતર અને ક્ષમતા મુજબ યોગ્ય આશ્રમ પસંદ કરે છે.",
    feat3Title: "3. અગ્રતા ડિસ્પેચ યાદી",
    feat3Body: "ઝડપથી બગડતા ખોરાકને પહેલા પિકઅપ માટે મોકલે છે.",

    trustHeading: "સુરક્ષિત અને વિશ્વસનીય નિયમો",
    trustSub: "AI મેચિંગ પહેલા ચકાસણી અને સુરક્ષા જરૂરી છે.",
    trustPoint1: "માત્ર પ્રમાણિત NGO અને આશ્રમ",
    trustPoint2: "વાસ્તવિક પ્રવાસ સમય ગણતરી",
    trustPoint3: "પહોંચ બહારના સ્થળોનું ઓટો-ફિલ્ટર",
    donorPreviewTitle: "લાઇવ દાતા પ્રીવ્યૂ",
    riskHigh: "બગાડ જોખમ 87/100 — ઊંચું",
    riskBody: "1 કલાક 30 મિનિટ બાકી • 50 ભોજન તૈયાર",
    matchBest: "શ્રેષ્ઠ મેચ — હોપ કમ્યુનિટી (95%)",
    matchBody: "શાકાહારી • 3.2 કિમી દૂર • સ્વીકારવા તૈયાર",
    priorityCritical: "ડિસ્પેચ અગ્રતા 96/100 — તાત્કાલિક",
    priorityBody: "હાઇ પ્રાયોરિટી પિકઅપ એલર્ટ",

    ctaTitle: "હાલમાં ખોરાક ઉપલબ્ધ છે",
    ctaSub: "મિનિટોમાં સ્થાનિક દાતાઓ અને આશ્રમોને જોડો.",

    dashTitle: "રેસ્ક્યૂ ડિસ્પેચ ડેશબોર્ડ",
    dashSub: "સક્રિય દાન અને AI રેન્કિંગનું લાઈવ મોનિટરિંગ.",
    tabOverview: "ઝાંખી",
    tabDonations: "લાઈવ દાન",
    tabRecipients: "આશ્રમ / NGO",
    tabImpact: "અસર પૃથક્કરણ",
    riskScore: "જોખમ સ્કોર",
    priorityScore: "અગ્રતા",
    matchScore: "મેચ સ્કોર",
    statusClaimed: "સ્વીકારેલ (Claimed)",
    statusPending: "ઉપલબ્ધ",
    statusDelivered: "પહોંચાડેલ (Delivered)",
    statusExpired: "સમાપ્ત (Expired)",
    actionClaim: "ભોજન લો",
    actionDetails: "વિગત જુઓ",
    filterAll: "તમામ દાન",
    filterUrgent: "અતિ તાત્કાલિક",

    donationsTitle: "વધેલા ખોરાકની યાદી",
    donationsSub: "ઉપલબ્ધ ખોરાક જે વિતરણ માટે તૈયાર છે.",
    btnNewDonation: "+ નવું ખોરાક દાન",
    quantity: "જથ્થો",
    expiry: "સમય મર્યાદા",
    location: "સ્થળ",
    donor: "દાતા",

    recipientsTitle: "સત્યાપિત મેળવનાર (NGOs)",
    recipientsSub: "ભોજન વિતરણ માટે તૈયાર આશ્રમો અને ફૂડ બેંકો.",
    verifiedBadge: "સત્યાપિત પાર્ટનર",
    capacity: "દૈનિક ક્ષમતા",
    dietPreference: "ખોરાકનો પ્રકાર",

    impactTitle: "પર્યાવરણ અને સામાજિક અસર",
    impactSub: "બચાવેલ ખોરાક, જમાડેલા લોકો અને CO₂ બચત.",
    co2Saved: "CO₂ ની બચત",
    rescueRate: "સફળતા દર",
    activePartners: "સક્રિય પાર્ટનર્સ",

    loginTitle: "ફૂડબ્રિજ AI માં લોગ ઇન કરો",
    loginSub: "તરત જ ટેસ્ટ કરવા માટે ડેમો પ્રોફાઇલ પસંદ કરો.",
    selectRole: "તમારી ભૂમિકા પસંદ કરો",
    roleDonor: "ખોરાક દાતા (રેસ્ટોરન્ટ / હોટેલ)",
    roleRecipient: "ખોરાક મેળવનાર (આશ્રમ / NGO)",
    demoOrgs: "ડેમો સંસ્થાઓ",

    loading: "લોડ થઈ રહ્યું છે...",
    close: "બંધ કરો",
    save: "સાચવો",
    languageSelect: "ભાષા પસંદ કરો",
  },
};
