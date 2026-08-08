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

  // Video Showcase
  videoBadge: string;
  videoTitle: string;
  videoSub: string;
  videoFallback: string;

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
  loginHeroTitle: string;
  loginHeroSub: string;
  demoModeActive: string;
  dbModeActive: string;
  loginPageTitle: string;
  loginPageSub: string;
  emailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  errorNoEmail: string;
  errorSignIn: string;
  successSignIn: string;
  btnSignInDash: string;
  demoSignInLabel: string;
  btnSignInShort: string;
  newOrgText: string;
  createProfileText: string;
  loginTitle: string;
  loginSub: string;
  selectRole: string;
  roleDonor: string;
  roleRecipient: string;
  demoOrgs: string;

  // Register
  registerTitle: string;
  registerSub: string;
  registerAs: string;
  donorTitle: string;
  donorDesc: string;
  recipientTitle: string;
  recipientDesc: string;
  orgName: string;
  orgType: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
  whatCanYouTake: string;
  hardConstraintsHint: string;
  minQty: string;
  maxCap: string;
  typicalQty: string;
  acceptedDiets: string;
  acceptedFood: string;
  excludedAllergens: string;
  collectionRange: string;
  noticeNeeded: string;
  weCanCollect: string;
  unverifiedNote: string;
  createProfileBtn: string;

  // Navigation (Duplicates removed)
  navGPS: string;

  // Account Menu
  signedInAs: string;
  couldNotSwitch: string;
  verified: string;
  pendingVerification: string;
  switchDonors: string;
  switchRecipients: string;
  signOut: string;

  // Phase 2: Dashboards
  orgVerifiedPartner: string;
  orgReliability: string;
  activeListingsMsg: string;
  liveDispatchMapTitle: string;
  liveGPSDispatch: string;
  liveTrackingActive: string;
  incomingDeliveryTransit: string;
  liveRescueTracking: string;
  liveGPSConnected: string;
  openLiveMap: string;
  trackIncomingLive: string;
  driverStatusDonor: string;
  driverStatusRecipient: string;
  co2Title: string;
  co2Subtitle: string;
  waterTitle: string;
  waterSubtitle: string;
  waterUnit: string;
  co2Unit: string;
  activeOffersMsg: string;
  radiusSuffix: string;
  leadTimeSuffix: string;
  bufferSuffix: string;
  yourOrg: string;
  ngoSubtitle: string;

  // Phase 3: Secondary Pages
  tabPending: string;
  donationsCountSub: string;
  impactSubtitle: string;
  impactExplanation: string;
  impactDelivered: string;
  impactAssumption: string;
  impactCurrentBaseline: string;
  impactMealsAcross: string;
  impactCompletedDonations: string;
  unverified: string;
  away: string;
  noticeSuffix: string;
  requiresDelivery: string;
  pickupRate: string;

  // Phase 4: Tracking & Shared
  trackingLoading: string;
  trackingNotFound: string;
  trackingEngine: string;
  trackingGeofenceEngine: string;
  trackingTelemetry: string;
  donorGeofence: string;
  recipientGeofence: string;
  distanceRemaining: string;
  liveDriverSpeed: string;
  foodRescueDeadline: string;
  rescueRiskAssessment: string;
  driverTelemetryConsole: string;
  startDeviceGPS: string;
  pauseDeviceGPS: string;
  startJourney: string;
  verifyDonorPickup: string;
  verifyDeliveryHandover: string;
  enterOTP: string;
  confirmFoodPickup: string;
  confirmDeliveryHandover: string;
  safeOnTime: string;
  highRisk: string;

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
    heroBadge: "Automated AI Dispatch",
    heroSub: "Surplus food is scored for waste risk the moment it is posted, matched with the verified organisation that can actually collect it in time, and tracked to delivery.",
    btnGetStarted: "Get started",
    btnViewImpact: "View impact",
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

    videoBadge: "AI Video Showcase",
    videoTitle: "FoodBridge AI — Real-Time Surplus Food Rescue",
    videoSub: "Watch how our intelligent AI algorithm matches surplus meals from restaurants & event caterers to verified shelters in real-time across Ahmedabad.",
    videoFallback: "Your browser does not support HTML5 video player.",

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
    loginHeroTitle: "Rescue surplus food before it expires.",
    loginHeroSub: "Sign in as a donor to list surplus food, or as a shelter to collect fresh meals in time.",
    demoModeActive: "Demo mode · seeded in-memory data",
    dbModeActive: "Connected to Database",
    loginPageTitle: "FoodBridge AI — Sign In",
    loginPageSub: "Enter your email & password or select a 1-click demo profile.",
    emailLabel: "Email Address / User ID",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    errorNoEmail: "Please enter your email address",
    errorSignIn: "Could not sign in. Please try again.",
    successSignIn: "✅ Signed in! Redirecting to Dashboard...",
    btnSignInDash: "Sign In to Dashboard",
    demoSignInLabel: "⚡ 1-Click Demo Sign In (Select Email ID)",
    btnSignInShort: "Sign In →",
    newOrgText: "New organisation?",
    createProfileText: "Create a profile",
    loginTitle: "Sign In to FoodBridge AI",
    loginSub: "Access donor or recipient dashboard with your credentials.",
    selectRole: "Choose Role",
    roleDonor: "Food Donor (Restaurant / Catering)",
    roleRecipient: "Shelter / NGO Recipient",
    demoOrgs: "Quick Demo Accounts (Ahmedabad)",

    registerTitle: "Create an organisation profile",
    registerSub: "Donors post surplus food. Recipients describe what they can take, and the matching engine uses those constraints literally — capacity, diet, allergens, distance and how quickly you can mobilise a collection.",
    registerAs: "I am registering as",
    donorTitle: "A donor",
    donorDesc: "Restaurant, hostel, caterer or event with surplus food",
    recipientTitle: "A recipient",
    recipientDesc: "Shelter, NGO, community kitchen, food bank or care home",
    orgName: "Organisation name",
    orgType: "Organisation type",
    contactPerson: "Contact person",
    phone: "Phone",
    email: "Email",
    address: "Address",
    latitude: "Latitude",
    longitude: "Longitude",
    whatCanYouTake: "What can you take?",
    hardConstraintsHint: "These are hard constraints. A donation that breaches any of them is filtered out before it is ever scored for you.",
    minQty: "Minimum useful quantity",
    maxCap: "Maximum capacity",
    typicalQty: "Typical quantity",
    acceptedDiets: "Diets you can accept",
    acceptedFood: "Food types you accept (leave empty for no restriction)",
    excludedAllergens: "Allergens you cannot handle",
    collectionRange: "Collection range (km)",
    noticeNeeded: "Notice needed (minutes)",
    weCanCollect: "We can collect food ourselves",
    unverifiedNote: "New organisations start unverified. Unverified recipients are never recommended by the matching engine — that filter is deliberate.",
    createProfileBtn: "Create profile",
    navGPS: "GPS Dispatch",

    signedInAs: "Now signed in as ",
    couldNotSwitch: "Could not switch organisation",
    verified: "Verified",
    pendingVerification: "Pending verification",
    switchDonors: "Switch account — donors",
    switchRecipients: "Switch account — recipients",
    signOut: "Sign out",

    orgVerifiedPartner: "Verified Partner",
    orgReliability: "Reliability",
    activeListingsMsg: "active surplus food listings currently being rescued",
    liveDispatchMapTitle: "Ahmedabad Real-Time Dispatch Map",
    liveGPSDispatch: "Live GPS Dispatch",
    liveTrackingActive: "Live Tracking Active",
    incomingDeliveryTransit: "INCOMING MEAL DELIVERY IN TRANSIT",
    liveRescueTracking: "LIVE RESCUE DISPATCH TRACKING",
    liveGPSConnected: "Live GPS Connected",
    openLiveMap: "Open Driver Live Map →",
    trackIncomingLive: "Track Incoming Driver Live →",
    driverStatusDonor: "Driver Rahul Patel is 2.4 km away · ETA: 9 min · Rescue Window: 34 min remaining (🟢 ON TIME)",
    driverStatusRecipient: "Driver Rahul Patel is transporting 50 Gujarati Thali Meals · ETA: 9 min (2.4 km away)",
    co2Title: "CO₂ Emissions Offset",
    co2Subtitle: "Stopped greenhouse gas emissions from landfill waste",
    waterTitle: "Agricultural Water Conserved",
    waterSubtitle: "Fresh water saved by rescuing prepared meals",
    waterUnit: "k Litres",
    co2Unit: "kg CO₂e",
    activeOffersMsg: "active surplus meal offers available for immediate pickup",
    radiusSuffix: "km radius",
    leadTimeSuffix: "min lead time",
    bufferSuffix: "buffer",
    yourOrg: "Your Organisation",
    ngoSubtitle: "Your Verified NGO Shelter",

    tabPending: "Pending match",
    donationsCountSub: "active surplus food listings",
    impactSubtitle: "Every figure below is derived from donations that actually reached",
    impactExplanation: "Meals donated and food saved sum the meal count and estimated mass of every donation with status Delivered. A donation that is matched but not yet collected contributes nothing.",
    impactDelivered: "Delivered",
    impactAssumption: "People served is derived at two meals per person, the working assumption for a single distribution.",
    impactCurrentBaseline: "Current baseline:",
    impactMealsAcross: "meals across",
    impactCompletedDonations: "completed donations.",
    unverified: "Unverified",
    away: "away",
    noticeSuffix: "notice",
    requiresDelivery: "Requires delivery",
    pickupRate: "pickup rate",

    trackingLoading: "Connecting to Live GPS Dispatch Engine...",
    trackingNotFound: "Delivery Record Not Found",
    trackingEngine: "FOODBRIDGE LOGISTICS ENGINE v2.4",
    trackingGeofenceEngine: "50m Geofence Auto-Detection Engine",
    trackingTelemetry: "Live Hardware Telemetry Stream",
    donorGeofence: "Donor Geofence",
    recipientGeofence: "Recipient Geofence",
    distanceRemaining: "Distance Remaining",
    liveDriverSpeed: "Live Driver Speed",
    foodRescueDeadline: "Food Rescue Deadline",
    rescueRiskAssessment: "Rescue Risk Assessment",
    driverTelemetryConsole: "DRIVER TELEMETRY CONSOLE",
    startDeviceGPS: "Start Device GPS",
    pauseDeviceGPS: "Pause Device GPS",
    startJourney: "Start Journey",
    verifyDonorPickup: "Verify Donor Pickup (OTP)",
    verifyDeliveryHandover: "Verify Handover (OTP)",
    enterOTP: "4-Digit Security OTP",
    confirmFoodPickup: "Confirm Food Pickup",
    confirmDeliveryHandover: "Confirm Delivery Handover",
    safeOnTime: "🟢 SAFE / ON TIME",
    highRisk: "🔴 HIGH RISK",

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

    heroTitle1: "बचाएं अतिरिक्त भोजन।",
    heroTitle2: "भूखे लोगों तक पहुँचाएं।",
    heroSubtitle: "स्मार्ट AI तुरंत रेस्टोरेंट और कैटरर्स के बचे भोजन को खराब होने से पहले नजदीकी आश्रमों से मिलाता है।",
    heroBadge: "स्वचालित AI डिस्पैच",
    heroSub: "पोस्ट होते ही अतिरिक्त भोजन का बर्बादी-जोखिम आंका जाता है, उसे उस सत्यापित संस्था से जोड़ा जाता है जो उसे समय पर उठा सकती है, और डिलीवरी तक ट्रैक किया जाता है।",
    btnGetStarted: "शुरू करें",
    btnViewImpact: "प्रभाव देखें",
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

    videoBadge: "एआई वीडियो शोकेस",
    videoTitle: "फूडब्रिज एआई — रीयल-टाइम सरप्लस फूड रेस्क्यू",
    videoSub: "देखें कि कैसे हमारा बुद्धिमान एआई एल्गोरिदम अहमदाबाद भर में सत्यापित आश्रयों में रेस्तरां और इवेंट कैटरर्स से बचे हुए भोजन का वास्तविक समय में मिलान करता है।",
    videoFallback: "आपका ब्राउज़र HTML5 वीडियो प्लेयर का समर्थन नहीं करता है।",

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
    activePartners: "सक्रिय Partners",
    loginHeroTitle: "बचे हुए खाने को खराब होने से पहले बचाएं।",
    loginHeroSub: "अतिरिक्त भोजन सूचीबद्ध करने के लिए दाता के रूप में साइन इन करें, या ताजा भोजन एकत्र करने के लिए आश्रय के रूप में।",
    demoModeActive: "डेमो मोड · इन-मेमोरी डेटा",
    dbModeActive: "डेटाबेस से कनेक्टेड",
    loginPageTitle: "फूडब्रिज एआई — साइन इन",
    loginPageSub: "अपना ईमेल और पासवर्ड दर्ज करें या 1-क्लिक डेमो प्रोफ़ाइल चुनें।",
    emailLabel: "ईमेल पता / यूजर आईडी",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    errorNoEmail: "कृपया अपना ईमेल पता दर्ज करें",
    errorSignIn: "साइन इन नहीं हो सका। कृपया पुनः प्रयास करें।",
    successSignIn: "✅ साइन इन हो गया! डैशबोर्ड पर ले जाया जा रहा है...",
    btnSignInDash: "डैशबोर्ड में साइन इन करें",
    demoSignInLabel: "⚡ 1-क्लिक डेमो साइन इन (ईमेल आईडी चुनें)",
    btnSignInShort: "साइन इन →",
    newOrgText: "नई संस्था?",
    createProfileText: "प्रोफ़ाइल बनाएं",
    loginTitle: "फूडब्रिज एआई में साइन इन करें",
    loginSub: "अपने क्रेडेंशियल्स के साथ दाता या प्राप्तकर्ता डैशबोर्ड एक्सेस करें।",
    selectRole: "भूमिका चुनें",
    roleDonor: "भोजन दाता (रेस्तरां / कैटरिंग)",
    roleRecipient: "आश्रम / एनजीओ प्राप्तकर्ता",
    demoOrgs: "त्वरित डेमो खाते (अहमदाबाद)",

    registerTitle: "संगठन प्रोफ़ाइल बनाएं",
    registerSub: "दाता अतिरिक्त भोजन पोस्ट करते हैं। प्राप्तकर्ता वर्णन करते हैं कि वे क्या ले सकते हैं, और मिलान इंजन उन बाधाओं का उपयोग करता है — क्षमता, आहार, एलर्जी, दूरी और आप कितनी जल्दी संग्रह कर सकते हैं।",
    registerAs: "मैं के रूप में पंजीकरण कर रहा हूँ",
    donorTitle: "एक दाता",
    donorDesc: "अतिरिक्त भोजन के साथ रेस्तरां, छात्रावास, कैटरर या कार्यक्रम",
    recipientTitle: "एक प्राप्तकर्ता",
    recipientDesc: "आश्रय, एनजीओ, सामुदायिक रसोई, फूड बैंक या केयर होम",
    orgName: "संगठन का नाम",
    orgType: "संगठन का प्रकार",
    contactPerson: "संपर्क व्यक्ति",
    phone: "फ़ोन",
    email: "ईमेल",
    address: "पता",
    latitude: "अक्षांश",
    longitude: "देशांतर",
    whatCanYouTake: "आप क्या ले सकते हैं?",
    hardConstraintsHint: "ये सख्त बाधाएं हैं। कोई भी दान जो इनमें से किसी का भी उल्लंघन करता है, वह आपके लिए स्कोर किए जाने से पहले ही फ़िल्टर कर दिया जाता है।",
    minQty: "न्यूनतम उपयोगी मात्रा",
    maxCap: "अधिकतम क्षमता",
    typicalQty: "विशिष्ट मात्रा",
    acceptedDiets: "आहार जो आप स्वीकार कर सकते हैं",
    acceptedFood: "भोजन के प्रकार जो आप स्वीकार करते हैं (कोई प्रतिबंध नहीं के लिए खाली छोड़ दें)",
    excludedAllergens: "एलर्जी जिसे आप संभाल नहीं सकते",
    collectionRange: "संग्रह सीमा (किमी)",
    noticeNeeded: "आवश्यक सूचना (मिनट)",
    weCanCollect: "हम खुद खाना इकट्ठा कर सकते हैं",
    unverifiedNote: "नए संगठन असत्यापित शुरू होते हैं। असत्यापित प्राप्तकर्ताओं को कभी भी मिलान इंजन द्वारा अनुशंसित नहीं किया जाता है — यह फ़िल्टर जानबूझकर है।",
    createProfileBtn: "प्रोफ़ाइल बनाएं",
    navGPS: "जीपीएस डिस्पैच",

    signedInAs: "के रूप में साइन इन हैं: ",
    couldNotSwitch: "संगठन नहीं बदल सका",
    verified: "सत्यापित",
    pendingVerification: "सत्यापन लंबित",
    switchDonors: "खाता बदलें — दाता",
    switchRecipients: "खाता बदलें — प्राप्तकर्ता",
    signOut: "साइन आउट करें",

    orgVerifiedPartner: "सत्यापित भागीदार",
    orgReliability: "विश्वसनीयता",
    activeListingsMsg: "सक्रिय अतिरिक्त भोजन सूची वर्तमान में बचाई जा रही है",
    liveDispatchMapTitle: "अहमदाबाद रीयल-टाइम डिस्पैच मैप",
    liveGPSDispatch: "लाइव जीपीएस डिस्पैच",
    liveTrackingActive: "लाइव ट्रैकिंग सक्रिय",
    incomingDeliveryTransit: "रास्ते में आने वाला भोजन वितरण",
    liveRescueTracking: "लाइव रेस्क्यू डिस्पैच ट्रैकिंग",
    liveGPSConnected: "लाइव जीपीएस कनेक्टेड",
    openLiveMap: "ड्राइवर का लाइव मैप खोलें →",
    trackIncomingLive: "आने वाले ड्राइवर को लाइव ट्रैक करें →",
    driverStatusDonor: "ड्राइवर राहुल पटेल 2.4 किमी दूर हैं · समय: 9 मिनट · बचाव खिड़की: 34 मिनट शेष (🟢 समय पर)",
    driverStatusRecipient: "ड्राइवर राहुल पटेल 50 गुजराती थाली भोजन ला रहे हैं · समय: 9 मिनट (2.4 किमी दूर)",
    co2Title: "CO₂ उत्सर्जन में कमी",
    co2Subtitle: "लैंडफिल कचरे से ग्रीनहाउस गैस उत्सर्जन को रोका",
    waterTitle: "कृषि जल संरक्षित",
    waterSubtitle: "तैयार भोजन को बचाकर ताजे पानी की बचत की गई",
    waterUnit: "हजार लीटर",
    co2Unit: "किग्रा CO₂e",
    activeOffersMsg: "तत्काल पिकअप के लिए उपलब्ध सक्रिय भोजन ऑफ़र",
    radiusSuffix: "किमी दायरा",
    leadTimeSuffix: "मिनट की सूचना",
    bufferSuffix: "बफर",
    yourOrg: "आपका संगठन",
    ngoSubtitle: "आपका सत्यापित एनजीओ आश्रय",

    tabPending: "मिलान लंबित",
    donationsCountSub: "सक्रिय अतिरिक्त भोजन सूची",
    impactSubtitle: "नीचे दिया गया हर आंकड़ा उन दानों से लिया गया है जो वास्तव में पहुंचे हैं",
    impactExplanation: "दान किए गए भोजन और बचाए गए भोजन को 'वितरित' स्थिति वाले प्रत्येक दान के भोजन की संख्या और अनुमानित द्रव्यमान का योग माना जाता है। एक दान जिसका मिलान हो गया है लेकिन अभी तक एकत्र नहीं किया गया है, वह कुछ भी योगदान नहीं देता है।",
    impactDelivered: "वितरित (Delivered)",
    impactAssumption: "परोसे गए लोगों की गणना प्रति व्यक्ति दो भोजन के आधार पर की जाती है, जो एकल वितरण के लिए एक कार्यकारी धारणा है।",
    impactCurrentBaseline: "वर्तमान आधार रेखा:",
    impactMealsAcross: "भोजन",
    impactCompletedDonations: "पूर्ण दानों में।",
    unverified: "असत्यापित",
    away: "दूर",
    noticeSuffix: "सूचना",
    requiresDelivery: "वितरण की आवश्यकता है",
    pickupRate: "पिकअप दर",

    trackingLoading: "लाइव जीपीएस डिस्पैच इंजन से कनेक्ट हो रहा है...",
    trackingNotFound: "डिलीवरी रिकॉर्ड नहीं मिला",
    trackingEngine: "फ़ूडब्रिज लॉजिस्टिक्स इंजन v2.4",
    trackingGeofenceEngine: "50 मीटर जियोफ़ेंस ऑटो-डिटेक्शन इंजन",
    trackingTelemetry: "लाइव हार्डवेयर टेलीमेट्री स्ट्रीम",
    donorGeofence: "दाता जियोफ़ेंस",
    recipientGeofence: "प्राप्तकर्ता जियोफ़ेंस",
    distanceRemaining: "शेष दूरी",
    liveDriverSpeed: "लाइव ड्राइवर गति",
    foodRescueDeadline: "भोजन बचाव की समय सीमा",
    rescueRiskAssessment: "बचाव जोखिम मूल्यांकन",
    driverTelemetryConsole: "ड्राइवर टेलीमेट्री कंसोल",
    startDeviceGPS: "डिवाइस GPS प्रारंभ करें",
    pauseDeviceGPS: "डिवाइस GPS रोकें",
    startJourney: "यात्रा शुरू करें",
    verifyDonorPickup: "दाता पिकअप सत्यापित करें (OTP)",
    verifyDeliveryHandover: "हैंडओवर सत्यापित करें (OTP)",
    enterOTP: "4-अंकीय सुरक्षा OTP",
    confirmFoodPickup: "खाद्य पिकअप की पुष्टि करें",
    confirmDeliveryHandover: "डिलीवरी हैंडओवर की पुष्टि करें",
    safeOnTime: "🟢 सुरक्षित / समय पर",
    highRisk: "🔴 उच्च जोखिम",

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

    heroTitle1: "વધેલો ખોરાક બચાવો.",
    heroTitle2: "જરૂરિયાતમંદો સુધી પહોંચાડો.",
    heroSubtitle: "સ્માર્ટ AI રેસ્ટોરન્ટ અને કેટરર્સનો વધેલો ખોરાક બગડે તે પહેલાં નજીકના આશ્રમો સાથે જોડે છે.",
    heroBadge: "ઓટોમેટેડ AI ડિસ્પેચ",
    heroSub: "વધારાનો ખોરાક પોસ્ટ થતાં જ તેનું બગાડ-જોખમ આંકવામાં આવે છે, જે સંસ્થા સમયસર લઈ જઈ શકે તેની સાથે જોડવામાં આવે છે, અને ડિલિવરી સુધી ટ્રેક થાય છે.",
    btnGetStarted: "શરૂ કરો",
    btnViewImpact: "અસર જુઓ",
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

    videoBadge: "AI વિડિઓ શોકેસ",
    videoTitle: "ફૂડબ્રિજ AI — રીઅલ-ટાઇમ સરપ્લસ ફૂડ રેસ્ક્યૂ",
    videoSub: "જુઓ કે કેવી રીતે અમારું બુદ્ધિશાળી AI અલ્ગોરિધમ અમદાવાદમાં પ્રમાણિત આશ્રયસ્થાનોમાં રેસ્ટોરન્ટ્સ અને ઇવેન્ટ કેટરર્સના વધારાના ભોજનને રીઅલ-ટાઇમમાં મેચ કરે છે.",
    videoFallback: "તમારું બ્રાઉઝર HTML5 વિડિઓ પ્લેયરને સપોર્ટ કરતું નથી.",

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
    activePartners: "સક્રિય Partners",
    loginHeroTitle: "વધેલો ખોરાક બગડે તે પહેલાં બચાવો.",
    loginHeroSub: "વધારાનો ખોરાક લિસ્ટ કરવા દાતા તરીકે સાઇન ઇન કરો, અથવા સમયસર તાજું ભોજન એકત્ર કરવા આશ્રય તરીકે.",
    demoModeActive: "ડેમો મોડ · ઇન-મેમરી ડેટા",
    dbModeActive: "ડેટાબેઝ સાથે જોડાયેલ છે",
    loginPageTitle: "ફૂડબ્રિજ AI — સાઇન ઇન",
    loginPageSub: "તમારું ઇમેઇલ અને પાસવર્ડ દાખલ કરો અથવા 1-ક્લિક ડેમો પ્રોફાઇલ પસંદ કરો.",
    emailLabel: "ઇમેઇલ સરનામું / યુઝર આઈડી",
    passwordLabel: "પાસવર્ડ",
    passwordPlaceholder: "પાસવર્ડ દાખલ કરો",
    errorNoEmail: "કૃપા કરીને તમારું ઇમેઇલ સરનામું દાખલ કરો",
    errorSignIn: "સાઇન ઇન થઈ શક્યું નથી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    successSignIn: "✅ સાઇન ઇન થઈ ગયું! ડેશબોર્ડ પર રીડાયરેક્ટ કરી રહ્યાં છીએ...",
    btnSignInDash: "ડેશબોર્ડમાં સાઇન ઇન કરો",
    demoSignInLabel: "⚡ 1-ક્લિક ડેમો સાઇન ઇન (ઇમેઇલ આઇડી પસંદ કરો)",
    btnSignInShort: "સાઇન ઇન →",
    newOrgText: "નવી સંસ્થા?",
    createProfileText: "પ્રોફાઇલ બનાવો",
    loginTitle: "ફૂડબ્રિજ AI માં સાઇન ઇન કરો",
    loginSub: "તમારા એકાઉન્ટ સાથે ડેશબોર્ડ ઍક્સેસ કરો.",
    selectRole: "ભૂમિકા પસંદ કરો",
    roleDonor: "ભોજન દાતા (રેસ્ટોરન્ટ / કેટરિંગ)",
    roleRecipient: "આશ્રમ / એનજીઓ પ્રાપ્તકર્તા",
    demoOrgs: "ઝડપી ડેમો એકાઉન્ટ્સ (અમદાવાદ)",

    registerTitle: "સંસ્થા પ્રોફાઇલ બનાવો",
    registerSub: "દાતા વધારાનો ખોરાક પોસ્ટ કરે છે. પ્રાપ્તકર્તા વર્ણન કરે છે કે તેઓ શું લઈ શકે છે, અને મેચિંગ એન્જિન તે મર્યાદાઓનો ઉપયોગ કરે છે — ક્ષમતા, આહાર, એલર્જી, અંતર અને તમે કેટલી ઝડપથી સંગ્રહ કરી શકો છો.",
    registerAs: "હું તરીકે નોંધણી કરી રહ્યો છું",
    donorTitle: "એક દાતા",
    donorDesc: "વધારાના ભોજન સાથે રેસ્ટોરન્ટ, છાત્રાલય, કેટરર અથવા ઇવેન્ટ",
    recipientTitle: "એક પ્રાપ્તકર્તા",
    recipientDesc: "આશ્રય, એનજીઓ, સામુદાયિક રસોડું, ફૂડ બેંક અથવા કેર હોમ",
    orgName: "સંસ્થાનું નામ",
    orgType: "સંસ્થાનો પ્રકાર",
    contactPerson: "સંપર્ક વ્યક્તિ",
    phone: "ફોન",
    email: "ઇમેઇલ",
    address: "સરનામું",
    latitude: "અક્ષાંશ",
    longitude: "રેખાંશ",
    whatCanYouTake: "તમે શું લઈ શકો છો?",
    hardConstraintsHint: "આ કડક મર્યાદાઓ છે. કોઈપણ દાન જે આમાંથી કોઈનું ઉલ્લંઘન કરે છે તે તમારા માટે સ્કોર થતાં પહેલાં જ ફિલ્ટર થઈ જાય છે.",
    minQty: "ન્યૂનતમ ઉપયોગી જથ્થો",
    maxCap: "મહત્તમ ક્ષમતા",
    typicalQty: "સામાન્ય જથ્થો",
    acceptedDiets: "આહાર જે તમે સ્વીકારી શકો છો",
    acceptedFood: "ખોરાકના પ્રકારો જે તમે સ્વીકારો છો (કોઈ પ્રતિબંધ ન હોય તો ખાલી છોડો)",
    excludedAllergens: "એલર્જી જે તમે સંભાળી શકતા નથી",
    collectionRange: "સંગ્રહ શ્રેણી (કિમી)",
    noticeNeeded: "જરૂરી સૂચના (મિનિટ)",
    weCanCollect: "અમે જાતે ખોરાક એકત્ર કરી શકીએ છીએ",
    unverifiedNote: "નવી સંસ્થાઓ ચકાસ્યા વગર શરૂ થાય છે. અચકાસાયેલ પ્રાપ્તકર્તાઓને મેચિંગ એન્જિન દ્વારા ક્યારેય ભલામણ કરવામાં આવતી નથી.",
    createProfileBtn: "પ્રોફાઇલ બનાવો",
    navGPS: "જીપીએસ ડિસ્પેચ",

    signedInAs: "તરીકે સાઇન ઇન છો: ",
    couldNotSwitch: "સંસ્થા બદલી શક્યા નથી",
    verified: "ચકાસાયેલ",
    pendingVerification: "ચકાસણી બાકી છે",
    switchDonors: "એકાઉન્ટ બદલો — દાતા",
    switchRecipients: "એકાઉન્ટ બદલો — પ્રાપ્તકર્તા",
    signOut: "સાઇન આઉટ",

    orgVerifiedPartner: "ચકાસાયેલ ભાગીદાર",
    orgReliability: "વિશ્વસનીયતા",
    activeListingsMsg: "સક્રિય ખોરાક લિસ્ટિંગ હાલમાં બચાવવામાં આવી રહ્યા છે",
    liveDispatchMapTitle: "અમદાવાદ રીઅલ-ટાઇમ ડિસ્પેચ નકશો",
    liveGPSDispatch: "લાઇવ જીપીએસ ડિસ્પેચ",
    liveTrackingActive: "લાઇવ ટ્રેકિંગ સક્રિય",
    incomingDeliveryTransit: "માર્ગમાં આવતું ભોજન વિતરણ",
    liveRescueTracking: "લાઇવ રેસ્ક્યૂ ડિસ્પેચ ટ્રેકિંગ",
    liveGPSConnected: "લાઇવ જીપીએસ કનેક્ટેડ",
    openLiveMap: "ડ્રાઇવરનો લાઇવ નકશો ખોલો →",
    trackIncomingLive: "આવતા ડ્રાઇવરને લાઇવ ટ્રૅક કરો →",
    driverStatusDonor: "ડ્રાઇવર રાહુલ પટેલ 2.4 કિમી દૂર છે · સમય: 9 મિનિટ · બચાવ વિન્ડો: 34 મિનિટ બાકી (🟢 સમયસર)",
    driverStatusRecipient: "ડ્રાઇવર રાહુલ પટેલ 50 ગુજરાતી થાળી ભોજન લાવી રહ્યા છે · સમય: 9 મિનિટ (2.4 કિમી દૂર)",
    co2Title: "CO₂ ઉત્સર્જન ઘટાડો",
    co2Subtitle: "લેન્ડફિલ કચરામાંથી ગ્રીનહાઉસ ગેસ ઉત્સર્જન અટકાવ્યું",
    waterTitle: "કૃષિ જળ સંરક્ષિત",
    waterSubtitle: "તૈયાર ભોજન બચાવીને તાજા પાણીની બચત",
    waterUnit: "હજાર લિટર",
    co2Unit: "કિગ્રા CO₂e",
    activeOffersMsg: "તાત્કાલિક પિકઅપ માટે ઉપલબ્ધ સક્રિય ભોજન ઑફર્સ",
    radiusSuffix: "કિમી ત્રિજ્યા",
    leadTimeSuffix: "મિનિટની સૂચના",
    bufferSuffix: "બફર",
    yourOrg: "તમારી સંસ્થા",
    ngoSubtitle: "તમારો ચકાસાયેલ NGO આશ્રય",

    tabPending: "મેચિંગ બાકી",
    donationsCountSub: "સક્રિય ખોરાક લિસ્ટિંગ",
    impactSubtitle: "નીચેનો દરેક આંકડો એવા દાનમાંથી લેવામાં આવ્યો છે જે ખરેખર પહોંચ્યા છે",
    impactExplanation: "દાન કરેલ ભોજન અને બચાવેલ ખોરાક 'વિતરિત' સ્થિતિ ધરાવતા દરેક દાનના ભોજનની ગણતરી અને અંદાજિત વજનનો સરવાળો છે. એક દાન જે મેળ ખાતું હોય પરંતુ હજુ સુધી એકત્રિત કરવામાં આવ્યું ન હોય તે કંઈપણ ફાળો આપતું નથી.",
    impactDelivered: "વિતરિત (Delivered)",
    impactAssumption: "પીરસવામાં આવતા લોકોની ગણતરી વ્યક્તિ દીઠ બે ભોજનના આધારે કરવામાં આવે છે, જે સિંગલ વિતરણ માટે કામ કરવાની ધારણા છે.",
    impactCurrentBaseline: "વર્તમાન આધારરેખા:",
    impactMealsAcross: "ભોજન",
    impactCompletedDonations: "પૂર્ણ થયેલા દાનમાં.",
    unverified: "ચકાસાયેલ નથી",
    away: "દૂર",
    noticeSuffix: "સૂચના",
    requiresDelivery: "વિતરણ જરૂરી છે",
    pickupRate: "પિકઅપ દર",

    trackingLoading: "લાઇવ જીપીએસ ડિસ્પેચ એન્જિન સાથે કનેક્ટ થઈ રહ્યું છે...",
    trackingNotFound: "ડિલિવરી રેકોર્ડ મળ્યો નથી",
    trackingEngine: "ફૂડબ્રિજ લોજિસ્ટિક્સ એન્જિન v2.4",
    trackingGeofenceEngine: "50 મીટર જિયોફેન્સ ઓટો-ડિટેક્શન એન્જિન",
    trackingTelemetry: "લાઇવ હાર્ડવેર ટેલિમેટ્રી સ્ટ્રીમ",
    donorGeofence: "દાતા જિયોફેન્સ",
    recipientGeofence: "પ્રાપ્તકર્તા જિયોફેન્સ",
    distanceRemaining: "બાકીનું અંતર",
    liveDriverSpeed: "લાઇવ ડ્રાઇવરની ગતિ",
    foodRescueDeadline: "ખોરાક બચાવની સમયમર્યાદા",
    rescueRiskAssessment: "બચાવ જોખમ મૂલ્યાંકન",
    driverTelemetryConsole: "ડ્રાઇવર ટેલિમેટ્રી કન્સોલ",
    startDeviceGPS: "ઉપકરણ GPS પ્રારંભ કરો",
    pauseDeviceGPS: "ઉપકરણ GPS રોકો",
    startJourney: "મુસાફરી શરૂ કરો",
    verifyDonorPickup: "દાતા પિકઅપ ચકાસો (OTP)",
    verifyDeliveryHandover: "હેન્ડઓવર ચકાસો (OTP)",
    enterOTP: "4-અંકનો સુરક્ષા OTP",
    confirmFoodPickup: "ખોરાક પિકઅપની પુષ્ટિ કરો",
    confirmDeliveryHandover: "ડિલિવરી હેન્ડઓવરની પુષ્ટિ કરો",
    safeOnTime: "🟢 સુરક્ષિત / સમયસર",
    highRisk: "🔴 ઉચ્ચ જોખમ",

    loading: "લોડ થઈ રહ્યું છે...",
    close: "બંધ કરો",
    save: "સાચવો",
    languageSelect: "ભાષા",
  },
};
