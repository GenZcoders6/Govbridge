"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { AshokaEmblemLogo, MySchemeLogo, GovBridgeLogo, DigitalIndiaLogo, IndiaGovInHeroLogo, UsefulLinkLogo } from "@/components/GovLogos";

// ── 10 Scheduled Indian Languages Dictionary ──
const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "Hindi", label: "हिंदी" },
  { code: "mr", name: "Marathi", label: "मराठी" },
  { code: "kn", name: "Kannada", label: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", label: "தமிழ்" },
  { code: "te", name: "Telugu", label: "తెలుగు" },
  { code: "bn", name: "Bengali", label: "বাংলা" },
  { code: "gu", name: "Gujarati", label: "ગુજરાતી" },
  { code: "ml", name: "Malayalam", label: "മലയാളം" },
  { code: "pa", name: "Punjabi", label: "ਪੰਜਾਬੀ" },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    govTitle: "GOVERNMENT OF INDIA",
    portalSubtitle: "National Unified Portal (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "National Portal of India",
    heroTagline: "Where Government Information & Instant Services Converge",
    searchPlaceholder: "Search for schemes, services, PAN, Voter ID, Aadhaar...",
    searchBtn: "Search",
    trending: "Trending Searches :",
    eligibleSchemes: "Eligible API Schemes",
    viewSchemes: "View Eligible Schemes",
    pollTitle: "Transforming Governance Through Citizen Voice",
    pollBadge: "MyGov.in Citizen Engagement",
    servicesTitle: "Official Departmental Services & Schemes Directory",
    rolesTitle: "Select Portal Role Entry",
    dpiQuote: "India's Digital Public Infrastructure has demonstrated how technology can expand opportunity, improve governance, boost financial inclusion and deliver services for hundreds of millions of people.",
  },
  hi: {
    govTitle: "भारत सरकार",
    portalSubtitle: "राष्ट्रीय एकीकृत ई-गवर्नेंस पोर्टल (माईस्कीम + माईगोव + इंडिया.गोव.इन)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "भारत का राष्ट्रीय पोर्टल",
    heroTagline: "जहां सरकारी सूचना और त्वरित सेवाएं मिलती हैं",
    searchPlaceholder: "योजनाएं, सेवाएं, पैन, वोटर आईडी, आधार खोजें...",
    searchBtn: "खोजें",
    trending: "लोकप्रिय खोजें :",
    eligibleSchemes: "पात्र एपीआई योजनाएं",
    viewSchemes: "पात्र योजनाएं देखें",
    pollTitle: "नागरिक विचारों के माध्यम से शासन का रूपांतरण",
    pollBadge: "माईगोव.इन नागरिक सहभागिता",
    servicesTitle: "आधिकारिक विभागीय सेवाएं एवं योजनाएं",
    rolesTitle: "पोर्टल भूमिका का चयन करें",
    dpiQuote: "भारत के डिजिटल सार्वजनिक बुनियादी ढांचे ने यह साबित किया है कि प्रौद्योगिकी अवसरों का विस्तार कैसे कर सकती है।",
  },
  mr: {
    govTitle: "महाराष्ट्र शासन / भारत सरकार",
    portalSubtitle: "राष्ट्रीय एकत्रित ई-गव्हर्नन्स पोर्टल (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "भारताचे राष्ट्रीय पोर्टल",
    heroTagline: "जिथे सरकारी माहिती आणि त्वरित सेवा एकत्र येतात",
    searchPlaceholder: "योजना, सेवा, पॅन, मतदार कार्ड, आधार शोधा...",
    searchBtn: "शोधा",
    trending: "प्रचलित शोध :",
    eligibleSchemes: "पात्र API योजना",
    viewSchemes: "पात्र योजना पहा",
    pollTitle: "नागरिकांच्या आवाजातून प्रशासनाचे परिवर्तन",
    pollBadge: "MyGov.in नागरिक सहभाग",
    servicesTitle: "अधिकृत विभागीय सेवा आणि योजना",
    rolesTitle: "पोर्टल भूमिका निवडा",
    dpiQuote: "भारताच्या डिजिटल पायाभूत सुविधांनी तंत्रज्ञानाद्वारे संधींचा विस्तार कसा करायचा हे दाखवून दिले आहे.",
  },
  kn: {
    govTitle: "ಭಾರತ ಸರ್ಕಾರ",
    portalSubtitle: "ರಾಷ್ಟ್ರೀಯ ಏಕೀಕೃತ ಇ-ಆಡಳಿತ ಪೋರ್ಟಲ್ (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "ಭಾರತದ ರಾಷ್ಟ್ರೀಯ ಪೋರ್ಟಲ್",
    heroTagline: "ಸರ್ಕಾರಿ ಮಾಹಿತಿ ಮತ್ತು ಸೇವೆಗಳು ಒಂದಾಗುವ ಸ್ಥಳ",
    searchPlaceholder: "ಯೋಜನೆಗಳು, ಸೇವೆಗಳು, PAN, ಮತದಾರರ ಚೀಟಿ ಶೋಧಿಸಿ...",
    searchBtn: "ಹುಡುಕಿ",
    trending: "ಜನಪ್ರಿಯ ಹುಡುಕಾಟಗಳು :",
    eligibleSchemes: "ಅರ್ಹ API ಯೋಜನೆಗಳು",
    viewSchemes: "ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    pollTitle: "ನಾಗರಿಕ ಧ್ವನಿಯ ಮೂಲಕ ಆಡಳಿತದ ರೂಪಾಂತರ",
    pollBadge: "MyGov.in ನಾಗರಿಕ ಭಾಗವಹಿಸುವಿಕೆ",
    servicesTitle: "ಅಧಿಕೃತ ಇಲಾಖಾ ಸೇವೆಗಳು ಮತ್ತು ಯೋಜನೆಗಳು",
    rolesTitle: "ಪೋರ್ಟಲ್ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    dpiQuote: "ಭಾರತದ ಡಿಜಿಟಲ್ ಮೂಲಸೌಕರ್ಯವು ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳ ವ್ಯಾಪ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಿದೆ.",
  },
  ta: {
    govTitle: "இந்திய அரசு",
    portalSubtitle: "தேசிய ஒருங்கிணைந்த மின்-ஆளுமை வலைத்தளம் (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "இந்தியாவின் தேசிய தளம்",
    heroTagline: "அரசு தகவல்களும் சேவைகளும் இணையுமிடம்",
    searchPlaceholder: "திட்டங்கள், சேவைகள், PAN, வாக்காளர் அடையாள அட்டை தேடவும்...",
    searchBtn: "தேடு",
    trending: "பிரபலமான தேடல்கள் :",
    eligibleSchemes: "தகுதியான API திட்டங்கள்",
    viewSchemes: "திட்டங்களைப் பார்க்கவும்",
    pollTitle: "குடிமக்களின் குரல் மூலம் ஆட்சியை மாற்றுதல்",
    pollBadge: "MyGov.in குடிமக்கள் பங்களிப்பு",
    servicesTitle: "அதிகாரப்பூர்வ துறை சேவைகள் & திட்டங்கள்",
    rolesTitle: "நுழைவுப் பங்கைத் தேர்ந்தெடுக்கவும்",
    dpiQuote: "இந்தியாவின் டிஜிட்டல் பொது உள்கட்டமைப்பு குடிமக்களுக்கான சேவைகளை மேம்படுத்தியுள்ளது.",
  },
  te: {
    govTitle: "భారత ప్రభుత్వం",
    portalSubtitle: "జాతీయ ఏకీకృత ఇ-గవర్నెన్స్ పోర్టల్ (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "భారత జాతీయ పోర్టల్",
    heroTagline: "ప్రభుత్వ సమాచారం మరియు సేవలు అనుసంధానమయ్యే చోటు",
    searchPlaceholder: "పథకాలు, సేవలు, PAN, ఓటరు కార్డ్ శోధించండి...",
    searchBtn: "శోధించండి",
    trending: "ప్రసిద్ధ శోధనలు :",
    eligibleSchemes: "అర్హత కలిగిన API పథకాలు",
    viewSchemes: "పథకాలను చూడండి",
    pollTitle: "పౌరుల వాయిస్ ద్వారా పరిపాలన మార్పు",
    pollBadge: "MyGov.in పౌర భాగస్వామ్యం",
    servicesTitle: "అధికారిక శాఖల సేవలు మరియు పథకాలు",
    rolesTitle: "పోర్టల్ పాత్రను ఎంచుకోండి",
    dpiQuote: "భారతదేశ డిజిటల్ మౌలిక సదుపాయాలు సాంకేతికత ద్వారా సేవలందించడంలో విజయం సాధించాయి.",
  },
  bn: {
    govTitle: "ভারত সরকার",
    portalSubtitle: "জাতীয় সমন্বিত ই-গভর্নেন্স পোর্টাল (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "ভারতের জাতীয় পোর্টাল",
    heroTagline: "যেখানে সরকারি তথ্য ও পরিষেবা একত্রিত হয়",
    searchPlaceholder: "প্রকল্প, পরিষেবা, প্যান, ভোটার কার্ড খুঁজুন...",
    searchBtn: "অনুসন্ধান",
    trending: "জনপ্রিয় অনুসন্ধান :",
    eligibleSchemes: "যোগ্য API প্রকল্পসমূহ",
    viewSchemes: "যোগ্য প্রকল্প দেখুন",
    pollTitle: "নাগরিকের মতামতের মাধ্যমে শাসনের রূপান্তর",
    pollBadge: "MyGov.in নাগরিক অংশগ্রহণ",
    servicesTitle: "সরকারি বিভাগীয় পরিষেবা ও প্রকল্প",
    rolesTitle: "পোর্টাল ভূমিকা নির্বাচন করুন",
    dpiQuote: "ভারতের ডিজিটাল পরিকাঠামো প্রযুক্তিকে সাধারণ মানুষের সেবায় নিয়োজিত করেছে।",
  },
  gu: {
    govTitle: "ભારત સરકાર",
    portalSubtitle: "રાષ્ટ્રીય એકીકૃત ઈ-ગવર્નન્સ પોર્ટલ (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "ભારતનું રાષ્ટ્રીય પોર્ટલ",
    heroTagline: "જ્યાં સરકારી માહિતી અને સેવાઓ એકત્રિત થાય છે",
    searchPlaceholder: "યોજનાઓ, સેવાઓ, પન, મતદાર કાર્ડ શોધો...",
    searchBtn: "શોધો",
    trending: "ટ્રેન્ડિંગ શોધો :",
    eligibleSchemes: "પાત્ર API યોજનાઓ",
    viewSchemes: "પાત્ર યોજનાઓ જુઓ",
    pollTitle: "નાગરિકોના અવાજ દ્વારા શાસનનું રૂપાંતરણ",
    pollBadge: "MyGov.in નાગરિક ભાગીદારી",
    servicesTitle: "અધિકૃત વિભાગીય સેવાઓ અને યોજનાઓ",
    rolesTitle: "પોઇન્ટ રોલ પસંદ કરો",
    dpiQuote: "ભારતના ડિજિટલ ઈન્ફ્રાસ્ટ્રક્ચરે ટેકનોલોજી દ્વારા શાસનને સક્ષમ બનાવ્યું છે.",
  },
  ml: {
    govTitle: "ഇന്ത്യൻ സർക്കാർ",
    portalSubtitle: "ദേശീയ സംയോജിത ഇ-ഗവേണൻസ് പോർട്ടൽ (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "ഇന്ത്യയുടെ ദേശീയ പോർട്ടൽ",
    heroTagline: "സർക്കാർ വിവരങ്ങളും സേവനങ്ങളും സംയോജിക്കുന്ന ഇടം",
    searchPlaceholder: "പദ്ധതികൾ, സേവനങ്ങൾ, PAN, വോട്ടർ ഐഡി തിരയുക...",
    searchBtn: "തിരയുക",
    trending: "പ്രധാന തിരച്ചിലുകൾ :",
    eligibleSchemes: "അർഹതയുള്ള API പദ്ധതികൾ",
    viewSchemes: "പദ്ധതികൾ കാണുക",
    pollTitle: "പൗര ശബ്ദത്തിലൂടെ ഭരണ നിർവഹണ മാറ്റം",
    pollBadge: "MyGov.in പൗര പങ്കാളിത്തം",
    servicesTitle: "ഔദ്യോഗിക വകുപ്പ് സേവനങ്ങളും പദ്ധതികളും",
    rolesTitle: "പോർട്ടൽ റോൾ തിരഞ്ഞെടുക്കുക",
    dpiQuote: "ഇന്ത്യയുടെ ഡിജിറ്റൽ ഇൻഫ്രാസ്ട്രക്ചർ സാങ്കേതികവിദ്യയുടെ സാധ്യതകൾ തെളിയിച്ചു.",
  },
  pa: {
    govTitle: "ਭਾਰਤ ਸਰਕਾਰ",
    portalSubtitle: "ਰਾਸ਼ਟਰੀ ਏਕੀਕ੍ਰਿਤ ਈ-ਗਵਰਨੈਂਸ ਪੋਰਟਲ (MyScheme + MyGov + India.gov.in)",
    heroTitle: "GovBridge.gov.in",
    heroSubtitle: "ਭਾਰਤ ਦਾ ਰਾਸ਼ਟਰੀ ਪੋਰਟਲ",
    heroTagline: "ਜਿੱਥੇ ਸਰਕਾਰੀ ਜਾਣਕਾਰੀ ਅਤੇ ਸੇਵਾਵਾਂ ਮਿਲਦੀਆਂ ਹਨ",
    searchPlaceholder: "ਸਕੀਮਾਂ, ਸੇਵਾਵਾਂ, PAN, ਵੋਟਰ ਆਈਡੀ ਖੋਜੋ...",
    searchBtn: "ਖੋਜੋ",
    trending: "ਰੁਝਾਨ ਵਾਲੀਆਂ ਖੋਜਾਂ :",
    eligibleSchemes: "ਯੋਗ API ਸਕੀਮਾਂ",
    viewSchemes: "ਯੋਗ ਸਕੀਮਾਂ ਵੇਖੋ",
    pollTitle: "ਨਾਗਰਿਕਾਂ ਦੀ ਆਵਾਜ਼ ਰਾਹੀਂ ਸ਼ਾਸਨ ਦਾ ਬਦਲਾਅ",
    pollBadge: "MyGov.in ਨਾਗਰਿਕ ਭਾਗੀਦਾਰੀ",
    servicesTitle: "ਅਧਿਕਾਰਤ ਵਿਭਾਗੀ ਸੇਵਾਵਾਂ ਅਤੇ ਸਕੀਮਾਂ",
    rolesTitle: "ਪੋਰਟਲ ਭੂਮਿਕਾ ਚੁਣੋ",
    dpiQuote: "ਭਾਰਤ ਦੇ ਡਿਜੀਟਲ ਢਾਂਚੇ ਨੇ ਤਕਨਾਲੋਜੀ ਰਾਹੀਂ ਜਨਤਕ ਸੇਵਾਵਾਂ ਨੂੰ ਮਜ਼ਬੂਤ ਕੀਤਾ ਹੈ।",
  },
};

const HERO_BACKGROUNDS = [
  { url: "/hero_bg_india_gate.jpg", title: "India Gate", location: "New Delhi (National Capital)" },
  { url: "/hero_bg_red_fort.jpg", title: "Lal Qila (Red Fort)", location: "Delhi (Historic Monument)" },
  { url: "/hero_bg_vidhana_soudha.jpg", title: "Vidhana Soudha", location: "Bengaluru (Karnataka State Secretariat)" },
];

const STATS_COUNTERS = [
  { icon: "🪪", count: "13,989+", label: "Online Services" },
  { icon: "🏛️", count: "750+", label: "Central Schemes" },
  { icon: "👥", count: "32+", label: "Citizen Consultations" },
  { icon: "🎓", count: "1,207+", label: "Academic Credentials" },
  { icon: "🚌", count: "4,003+", label: "Transit Passes Issued" },
  { icon: "🗳️", count: "18", label: "Civic Registries" },
];

const CITIZEN_PERSONAS = [
  {
    id: "citizen",
    title: "General Citizen",
    icon: "👤",
    desc: "Aadhaar E-KYC, PAN & Electoral Voter Registration",
    primaryAction: "/services/aadhaar-kyc",
    badge: "Essential Identity",
    color: "#dc2626",
    services: [
      { name: "UIDAI Aadhaar E-KYC", sla: "Instant (0s)", href: "/services/aadhaar-kyc" },
      { name: "Income & PAN Validity", sla: "5 Mins", href: "/services/pan-verification" },
      { name: "ECI Voter ID Validation", sla: "Instant Sync", href: "/services/voter-id" },
    ],
  },
  {
    id: "student",
    title: "Student & Youth",
    icon: "🎓",
    desc: "Concession Bus Pass, Marksheet Verification & Skill Missions",
    primaryAction: "/services/bus-pass",
    badge: "Student Benefit",
    color: "#1d4ed8",
    services: [
      { name: "Student Bus Concession Pass", sla: "24 Hours SLA", href: "/services/bus-pass" },
      { name: "Degree & Marksheet Verify", sla: "12 Hours SLA", href: "/services/education-degree" },
      { name: "NSDC Skill Stipend Allowance", sla: "48 Hours SLA", href: "/services/skill-employment" },
    ],
  },
  {
    id: "farmer",
    title: "Farmers & Workers",
    icon: "🌾",
    desc: "DBT Direct Benefit Transfer, PM-Kisan & Skill Stipend",
    primaryAction: "/services/skill-employment",
    badge: "DBT Allowance",
    color: "#15803d",
    services: [
      { name: "Skill Mission Stipend DBT", sla: "Direct Transfer", href: "/services/skill-employment" },
      { name: "Municipal Property Tax NOC", sla: "72 Hours SLA", href: "/services/property-noc" },
      { name: "UIDAI Demographic Verification", sla: "Instant", href: "/services/aadhaar-kyc" },
    ],
  },
  {
    id: "senior",
    title: "Senior Citizens",
    icon: "👴",
    desc: "PMSBY ₹20/yr Insurance, Pension & Utility Clearance",
    primaryAction: "/services/property-noc",
    badge: "Welfare & Pension",
    color: "#7c3aed",
    services: [
      { name: "PMSBY Accident Insurance (₹20)", sla: "Instant Coverage", href: "/services/aadhaar-kyc" },
      { name: "Municipal No-Dues NOC Clearance", sla: "72 Hours SLA", href: "/services/property-noc" },
      { name: "Income Tax PAN Threshold", sla: "5 Mins", href: "/services/pan-verification" },
    ],
  },
];

const SCHEME_CATEGORIES = [
  { id: "all", label: "All Categories", icon: "🏛️" },
  { id: "education", label: "Education & Learning", icon: "🎓" },
  { id: "skill", label: "Skill & Employment", icon: "⚡" },
  { id: "revenue", label: "Taxation & Revenue", icon: "₹" },
  { id: "transport", label: "Public Transport", icon: "🚌" },
  { id: "civic", label: "Identity & Citizenship", icon: "🪪" },
  { id: "urban", label: "Municipal & Property", icon: "🏙️" },
];

const PUBLIC_SERVICES = [
  {
    id: "aadhaar-kyc",
    category: "civic",
    icon: "🪪",
    title: "UIDAI Aadhaar E-KYC Service",
    dept: "Unique Identification Authority of India (UIDAI)",
    sla: "Instant (0s)",
    desc: "Biometric & OTP demographic identity verification across central registries.",
    href: "/services/aadhaar-kyc",
    badge: "Essential Identity",
    state: "Central Govt",
  },
  {
    id: "pan-verification",
    category: "revenue",
    icon: "₹",
    title: "PAN Card & Income Verification",
    dept: "Income Tax Department / CBDT",
    sla: "5 Mins SLA",
    desc: "Verify PAN validity and tax-assessed income threshold for welfare eligibility.",
    href: "/services/pan-verification",
    badge: "Financial Status",
    state: "Central Govt",
  },
  {
    id: "voter-id",
    category: "civic",
    icon: "🗳️",
    title: "Electoral Roll & Voter ID Validation",
    dept: "Election Commission of India (ECI)",
    sla: "Instant Sync",
    desc: "Verify EPIC voter identity status and assembly constituency details.",
    href: "/services/voter-id",
    badge: "Civic Registry",
    state: "Central Govt",
  },
  {
    id: "bus-pass",
    category: "transport",
    icon: "🚌",
    title: "Student & Citizen Concession Bus Pass",
    dept: "State Road Transport Corporation (MSRTC)",
    sla: "24 Hours SLA",
    desc: "Subsidized monthly transit pass with automated student bonafide check.",
    href: "/services/bus-pass",
    badge: "Public Transport",
    state: "Maharashtra State",
  },
  {
    id: "education-degree",
    category: "education",
    icon: "🎓",
    title: "University Degree & Marksheet Verification",
    dept: "Higher & Technical Education Board",
    sla: "12 Hours SLA",
    desc: "Cross-verify university degrees, diploma certificates, and marksheets.",
    href: "/services/education-degree",
    badge: "Academic Credential",
    state: "State Higher Edu",
  },
  {
    id: "skill-employment",
    category: "skill",
    icon: "⚡",
    title: "Unified Skill Benefit & Stipend Allowance",
    dept: "Department of Skill & Employment",
    sla: "48 Hours SLA",
    desc: "Integrated application for NSDC skill certification and monthly DBT stipend.",
    href: "/services/skill-employment",
    badge: "DBT Allowance",
    state: "Skill Mission",
  },
  {
    id: "property-noc",
    category: "urban",
    icon: "🏙️",
    title: "Municipal Property Tax & Utility NOC",
    dept: "Urban Local Body / Municipal Corporation",
    sla: "72 Hours SLA",
    desc: "Digital no-dues clearance for property taxes, water charges, and civic utility.",
    href: "/services/property-noc",
    badge: "Civic Clearance",
    state: "Municipal Board",
  },
];

const CAROUSEL_SLIDES = [
  {
    title: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    desc: "Accident Insurance Scheme offering ₹2 Lakh coverage for just ₹20 per annum. Instant e-KYC enrollment via GovBridge.",
    tag: "CENTRAL WELFARE SCHEME",
    bg: "#ffffff",
    accent: "#15803d",
  },
  {
    title: "GovBridge Integrated on UMANG Mobile App",
    desc: "Access 1,200+ Central and State Government services with unified DigiLocker single sign-on authentication.",
    tag: "DIGITAL INDIA INITIATIVE",
    bg: "#ffffff",
    accent: "#1d4ed8",
  },
  {
    title: "DPDP Act 2023 Compliant Consent Manager",
    desc: "Every cross-departmental data access request requires explicit citizen OTP authorization and SHA-256 audit log.",
    tag: "PRIVACY & SECURITY",
    bg: "#ffffff",
    accent: "#7c3aed",
  },
];

const PORTAL_ROLES = [
  {
    role: "Citizen Portal",
    badge: "CITIZEN",
    color: "#166534",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    desc: "Apply for departmental services, track 4-stage visual progress, and download official sanction certificates.",
    email: "citizen@govbridge.demo",
    password: "citizen123",
    icon: "👤",
  },
  {
    role: "Department Officer Portal",
    badge: "OFFICER",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    desc: "Review citizen applications, audit cross-department verification checks, and issue officer sanctions.",
    email: "officer@govbridge.demo",
    password: "officer123",
    icon: "🛡️",
  },
  {
    role: "Integration Admin Hub",
    badge: "ADMIN",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fca5a5",
    desc: "Monitor 11-step DAG workflow orchestration engine, connector adapters, API Gateway, and chaos testing.",
    email: "admin@govbridge.demo",
    password: "admin123",
    icon: "⚙️",
  },
  {
    role: "Compliance Audit Center",
    badge: "AUDITOR",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    desc: "Verify cryptographic SHA-256 tamper-proof ledger entries, consent logs, and data access trails.",
    email: "auditor@govbridge.demo",
    password: "auditor123",
    icon: "⚖️",
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  // Accessibility & i18n State
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [langCode, setLangCode] = useState("en");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPersona, setSelectedPersona] = useState("citizen");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animated Hero Background Index
  const [heroBgIndex, setHeroBgIndex] = useState(0);

  // Auto rotate hero background images every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // MyGov Poll State
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState([480, 920, 690, 340]);

  const t = TRANSLATIONS[langCode] || TRANSLATIONS["en"];

  const handleVote = (idx: number) => {
    if (pollVoted !== null) return;
    const next = [...pollVotes];
    next[idx] += 1;
    setPollVotes(next);
    setPollVoted(idx);
  };

  const totalVotes = pollVotes.reduce((a, b) => a + b, 0);

  const handleRoleQuickLogin = async (email: string, pass: string) => {
    try {
      setAuth(
        {
          id: "usr-demo",
          email,
          full_name: email.includes("citizen") ? "Sunil Patil" : email.includes("officer") ? "Officer Reviewer" : "System Administrator",
          role: email.includes("citizen") ? "CITIZEN" : email.includes("officer") ? "DEPARTMENT_OFFICER" : email.includes("auditor") ? "AUDITOR" : "INTEGRATION_ADMIN",
          is_active: true,
          department_id: null,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        "demo-jwt-token"
      );
      router.push("/dashboard");
    } catch {
      router.push("/login");
    }
  };

  const filteredServices = PUBLIC_SERVICES.filter((s) => {
    const matchesCategory = selectedCategory === "all" ? true : s.category === selectedCategory;
    const matchesSearch = searchQuery === "" || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.desc.toLowerCase().includes(searchQuery.toLowerCase()) || s.dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const baseFontSize = fontSizeOffset === 1 ? "17px" : fontSizeOffset === -1 ? "13px" : "15px";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: highContrast ? "#000000" : "#f8fafc",
        color: highContrast ? "#ffffff" : "#1e293b",
        fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
        fontSize: baseFontSize,
      }}
    >
      {/* ── 1. Official Tricolour Top Accent Band ── */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)" }} />

      {/* ── 2. DYNAMIC ANIMATED HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          minHeight: "560px",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 28px 50px",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Layers Crossfade */}
        {HERO_BACKGROUNDS.map((bg, idx) => (
          <div
            key={bg.url}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.76) 0%, rgba(30, 27, 75, 0.9) 100%), url('${bg.url}')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              opacity: heroBgIndex === idx ? 1 : 0,
              transition: "opacity 1.2s ease-in-out, transform 8s ease-out",
              transform: heroBgIndex === idx ? "scale(1.04)" : "scale(1)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Top Header Bar inside Animated Hero */}
        <div style={{ maxWidth: 1250, width: "100%", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.85)", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AshokaEmblemLogo height={36} darkBackground={true} />
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <GovBridgeLogo height={32} darkBackground={true} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href="#main-content" style={{ color: "#ffffff", textDecoration: "none", fontWeight: 600 }}>
              Skip to main content
            </a>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <span style={{ cursor: "pointer", fontSize: 14 }}>📅</span>
            <span style={{ cursor: "pointer", fontSize: 14 }}>♿</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13 }}>A/अ</span>
              <select
                value={langCode}
                onChange={(e) => setLangCode(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 4,
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "2px 8px",
                  cursor: "pointer",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: "#0f172a", color: "#fff" }}>
                    {l.label} ({l.name})
                  </option>
                ))}
              </select>
            </div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
            <span style={{ fontSize: 16 }}>🇮🇳</span>

            {/* Auth Button */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                style={{
                  padding: "6px 14px",
                  background: "#16a34a",
                  color: "#ffffff",
                  borderRadius: 6,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Dashboard ({user?.full_name?.split(" ")[0] || "User"})
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: "6px 16px",
                  background: "#dc2626",
                  color: "#ffffff",
                  borderRadius: 6,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Sign In →
              </Link>
            )}
          </div>
        </div>

        {/* Center Hero Content */}
        <div style={{ maxWidth: 950, width: "100%", margin: "20px auto 10px", textAlign: "center", position: "relative", zIndex: 10 }}>
          {/* Official india.gov.in National Portal Emblem & Logo Stack */}
          <div style={{ marginBottom: 16 }}>
            <IndiaGovInHeroLogo mainTitle={t.heroTitle} subtitle={t.heroSubtitle} />
          </div>

          <p style={{ fontSize: 15, color: "rgba(255, 255, 255, 0.9)", margin: "0 auto 24px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            {t.heroTagline}
          </p>

          {/* Central Search Bar */}
          <div style={{ maxWidth: 840, margin: "0 auto 20px" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const el = document.getElementById("services");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                display: "flex",
                background: "#ffffff",
                borderRadius: 12,
                padding: 4,
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
                alignItems: "center",
              }}
            >
              <span style={{ paddingLeft: 16, fontSize: 16, color: "#64748b" }}>🔍</span>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "14px 14px",
                  fontSize: 15,
                  color: "#0f172a",
                  background: "transparent",
                }}
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  border: "none",
                  borderLeft: "1px solid #e2e8f0",
                  outline: "none",
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                  background: "#f8fafc",
                  cursor: "pointer",
                  borderRadius: 0,
                  marginRight: 4,
                }}
              >
                {SCHEME_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                style={{
                  padding: "12px 32px",
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                }}
              >
                {t.searchBtn}
              </button>
            </form>
          </div>

          {/* Trending Searches Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap", fontSize: 13, marginBottom: 16 }}>
            <span style={{ color: "#ffffff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{t.trending}</span>
            {[
              { label: "Apply Aadhaar", query: "Aadhaar" },
              { label: "DigiLocker", query: "DigiLocker" },
              { label: "New Voter Registration", query: "Voter" },
              { label: "Tatkaal Passport Service", query: "Passport" },
              { label: "Apply for Driving Licence", query: "Bus" },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => {
                  setSearchQuery(pill.query);
                  const el = document.getElementById("services");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.14)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  color: "#ffffff",
                  padding: "5px 14px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 3. CENTERED OVERLAPPING LEADERSHIP QUOTE BRIDGE CARD (Connecting Hero & Content) ── */}
      <div style={{ position: "relative", zIndex: 30, maxWidth: 960, margin: "-45px auto 10px", padding: "0 20px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: "20px 28px",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0,0,0,0.06)",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: 20,
            borderLeft: "8px solid #dc2626",
            border: "1px solid #e2e8f0",
            borderLeftWidth: 8,
            borderLeftColor: "#dc2626",
          }}
        >
          {/* Main Body Quote Text */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 800, lineHeight: 1.5 }}>
              <span style={{ fontSize: 22, marginRight: 4, color: "#dc2626", lineHeight: 0 }}>“</span>
              {t.dpiQuote}
              <span style={{ fontSize: 22, marginLeft: 4, color: "#dc2626", lineHeight: 0 }}>”</span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              DIGITAL PUBLIC INFRASTRUCTURE (DPI) NATIONAL GOVERNANCE VISION · SHRI NARENDRA MODI, HON&apos;BLE PRIME MINISTER OF INDIA
            </div>
          </div>

          {/* Right Side PM Modi Official Portrait Avatar Badge */}
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                border: "3px solid #FF9933",
                overflow: "hidden",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              {/* PM Modi Official Uploaded Photo */}
              <img
                src="/pm_modi_official.png"
                alt="Shri Narendra Modi, Prime Minister of India"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ fontSize: 9, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
              PM NARENDRA MODI
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Stats Counter Strip ── */}
      <section id="main-content" style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", paddingTop: 50, paddingBottom: 20, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1250, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, textAlign: "center" }}>
          {STATS_COUNTERS.map((st) => (
            <div key={st.label} style={{ padding: "8px 12px", borderRight: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1e293b" }}>{st.count}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 2 }}>
                {st.icon} {st.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. CITIZEN PERSONA INTERACTIVE GATEWAY SWITCHER ── */}
      <section style={{ background: "#f8fafc", padding: "36px 24px 32px" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 30, fontSize: 11, fontWeight: 800, color: "#b91c1c" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} />
              LIVE DAG BUS: 1,420,892 Interoperable API Transactions Processed Today
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>
              🔒 DPDP Act 2023 Cryptographic Consent Verification Enabled
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "stretch" }}>
            {/* Left Box: Persona Selector Tabs */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                borderRadius: 16,
                padding: "28px 32px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "#f0fdf4",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    marginBottom: 14,
                  }}
                >
                  ⚡ SELECT YOUR CITIZEN GATEWAY
                </span>

                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1e293b", marginBottom: 10 }}>
                  Tailored Governance Services for Every Citizen
                </h2>

                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
                  Select your profile to automatically filter relevant central schemes, identity verifications, and benefit allowances.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {CITIZEN_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPersona(p.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: selectedPersona === p.id ? `2px solid ${p.color}` : "1px solid #cbd5e1",
                        background: selectedPersona === p.id ? "#f8fafc" : "#ffffff",
                        color: "#1e293b",
                        textAlign: "left",
                        cursor: "pointer",
                        boxShadow: selectedPersona === p.id ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800 }}>
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <span>{p.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/services"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  background: "#dc2626",
                  color: "#ffffff",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Browse All National Services →
              </Link>
            </div>

            {/* Right Gateway Active Widget */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #cbd5e1",
                borderRadius: 16,
                padding: "28px 30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, padding: "3px 10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 20 }}>
                    {CITIZEN_PERSONAS.find((p) => p.id === selectedPersona)?.badge}
                  </span>
                  <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                    Live API Gateway Active
                  </span>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", marginBottom: 6 }}>
                  {CITIZEN_PERSONAS.find((p) => p.id === selectedPersona)?.icon} {CITIZEN_PERSONAS.find((p) => p.id === selectedPersona)?.title} Direct Gateway
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
                  {CITIZEN_PERSONAS.find((p) => p.id === selectedPersona)?.desc}
                </p>

                <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>
                  RECOMMENDED INSTANT API SERVICES:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {CITIZEN_PERSONAS.find((p) => p.id === selectedPersona)?.services.map((srv) => (
                    <Link
                      key={srv.name}
                      href={srv.href}
                      style={{
                        padding: "12px 14px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{srv.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: 4 }}>
                        {srv.sla}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#1e40af",
                  fontWeight: 700,
                }}
              >
                <span>🛡️ UIDAI + CBDT + ECI + MSRTC Connectors Live</span>
                <span style={{ fontWeight: 900 }}>100% SLA Sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. MyScheme Interactive Eligibility Wizard Box Section ── */}
      <section id="myscheme" style={{ padding: "40px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div
            style={{
              background: "#f8fafc",
              border: "1.5px solid #bbf7d0",
              borderRadius: 16,
              padding: "28px 32px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔍</span> MyScheme Interactive Eligibility Wizard
              </div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                Showing <strong>{filteredServices.length} Eligible Services</strong>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  SCHEME CATEGORY
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    color: "#0f172a",
                    fontSize: 13,
                  }}
                >
                  {SCHEME_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  GENDER ELIGIBILITY
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    color: "#0f172a",
                    fontSize: 13,
                  }}
                >
                  <option value="all">All Citizens</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="transgender">Transgender</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  STATE / UNION TERRITORY
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    color: "#0f172a",
                    fontSize: 13,
                  }}
                >
                  <option value="all">All States &amp; Central</option>
                  <option value="MH">Maharashtra</option>
                  <option value="DL">Delhi NCR</option>
                  <option value="KA">Karnataka</option>
                  <option value="UP">Uttar Pradesh</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <a
                href="#services"
                style={{
                  padding: "10px 24px",
                  background: "#15803d",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 6,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(21, 128, 61, 0.25)",
                }}
              >
                View Eligible Schemes ({filteredServices.length}) →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. MyGov Citizen Consultation & Poll ── */}
      <section id="mygov-poll" style={{ padding: "50px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "4px 14px",
                background: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                borderRadius: 20,
                textTransform: "uppercase",
              }}
            >
              💡 {t.pollBadge}
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1e293b", marginTop: 8 }}>
              {t.pollTitle}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            {/* Interactive Poll */}
            <div style={{ padding: 24, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "#15803d", fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
                ACTIVE MYGOV CITIZEN POLL · {totalVotes} VOTES
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 16 }}>
                Which e-Governance feature is most critical for your daily service turnaround?
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Real-time Aadhaar E-KYC Identity Verification",
                  "Single Window Cross-Department Verification",
                  "Automated Direct Benefit Transfer (DBT) Stipend",
                  "24h Student & Senior Citizen Bus Pass Concession",
                ].map((opt, idx) => {
                  const pct = Math.round((pollVotes[idx] / totalVotes) * 100);
                  const isSelected = pollVoted === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleVote(idx)}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: isSelected ? "#e0f2fe" : "#ffffff",
                        border: `1px solid ${isSelected ? "#0284c7" : "#e2e8f0"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                        <span>{opt}</span>
                        <span style={{ color: "#0284c7", fontWeight: 800 }}>{pct}%</span>
                      </div>
                      <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: isSelected ? "#0284c7" : "#15803d", transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {pollVoted !== null && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#15803d", fontWeight: 700, textAlign: "center" }}>
                  ✓ Thank you for submitting your vote to MyGov consultations!
                </div>
              )}
            </div>

            {/* Featured Initiative Slide & Spotlight */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 22, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", background: "#f0fdf4", color: "#15803d", borderRadius: 4, display: "inline-block", marginBottom: 8 }}>
                  {CAROUSEL_SLIDES[currentSlide].tag}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>
                  {CAROUSEL_SLIDES[currentSlide].title}
                </div>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: 0 }}>
                  {CAROUSEL_SLIDES[currentSlide].desc}
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        height: 5,
                        width: currentSlide === idx ? 20 : 8,
                        borderRadius: 3,
                        background: currentSlide === idx ? "#15803d" : "#cbd5e1",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ padding: 20, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#15803d", marginBottom: 4 }}>
                  💬 Submit Governance Idea / Feedback
                </div>
                <p style={{ fontSize: 12, color: "#334155", marginBottom: 12 }}>
                  Share your ideas directly with state ministries for service improvements.
                </p>
                <Link href="/login" style={{ fontSize: 12, color: "#ffffff", background: "#15803d", padding: "6px 14px", borderRadius: 6, textDecoration: "none", fontWeight: 700, display: "inline-block" }}>
                  Submit Idea via MyGov Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Official Services Directory ── */}
      <section id="services" style={{ padding: "50px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 14px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 20, textTransform: "uppercase" }}>
              🏛️ India.gov.in National Services Directory
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1e293b", marginTop: 8 }}>
              {t.servicesTitle}
            </h2>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 30 }}>
            {SCHEME_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: selectedCategory === cat.id ? "#15803d" : "#ffffff",
                  color: selectedCategory === cat.id ? "#ffffff" : "#475569",
                  border: `1px solid ${selectedCategory === cat.id ? "#15803d" : "#cbd5e1"}`,
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filteredServices.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: 22,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                      {s.sla}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>{s.title}</h3>
                  <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 700, marginBottom: 10 }}>{s.dept}</div>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>{s.desc}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{s.state}</span>
                  <button
                    onClick={async () => {
                      if (!user) {
                        try {
                          const res = await authApi.login("citizen@govbridge.demo", "citizen123");
                          setAuth(res.data.user, res.data.access_token);
                        } catch {
                          setAuth({ id: "1", email: "citizen@govbridge.demo", role: "CITIZEN", full_name: "Sunil Patil", is_active: true, department_id: null, last_login: null, created_at: new Date().toISOString() }, "token");
                        }
                      }
                      router.push(s.href);
                    }}
                    style={{
                      padding: "8px 18px",
                      background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                      color: "#ffffff",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Portal Roles Selection ── */}
      <section id="portals" style={{ padding: "50px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 14px", background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe", borderRadius: 20, textTransform: "uppercase" }}>
              🔐 Role-Based Access Control
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1e293b", marginTop: 8 }}>
              {t.rolesTitle}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {PORTAL_ROLES.map((r) => (
              <div
                key={r.role}
                style={{
                  padding: 22,
                  background: r.bg,
                  border: `1.5px solid ${r.border}`,
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 26 }}>{r.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: "#ffffff", color: r.color, border: `1px solid ${r.border}` }}>
                      {r.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 6 }}>{r.role}</h3>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>{r.desc}</p>
                </div>

                <button
                  onClick={() => handleRoleQuickLogin(r.email, r.password)}
                  style={{
                    padding: "9px 14px",
                    background: r.color,
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Sign In as {r.badge} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Dark Slate Navy Footer (Exact `myScheme` Screenshot Match `#282c3f`) ── */}
      <footer style={{ background: "#282c3f", color: "#ffffff", paddingTop: 48, paddingBottom: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: -20, left: 0, right: 0, height: 20, background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z' fill='%23282c3f'%3E%3C/path%3E%3C/svg%3E\") repeat-x", backgroundSize: "1200px 20px" }} />

        <div style={{ maxWidth: 1250, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 1.1fr", gap: 32, marginBottom: 36 }}>
            <div>
              {/* Official Website Brand Logos */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <MySchemeLogo height={38} darkBackground={true} />
                <GovBridgeLogo height={38} darkBackground={true} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#4ade80", marginBottom: 10 }}>
                ©2026 myScheme · GovBridge
              </div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 16 }}>
                <strong>Powered by Digital India Corporation (DIC)</strong><br />
                Ministry of Electronics &amp; IT (MeitY)<br />
                Government of India®
              </div>
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 6,
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Connect on Social Media
              </Link>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>Quick Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                <Link href="/contact" style={{ color: "#cbd5e1", textDecoration: "none" }}>› About Us</Link>
                <Link href="/contact" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Contact Us</Link>
                <Link href="/accessibility" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Accessibility Statement</Link>
                <Link href="/privacy" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Privacy Policy (DPDP)</Link>
                <Link href="/terms" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Terms &amp; Conditions</Link>
                <Link href="/dashboard" style={{ color: "#cbd5e1", textDecoration: "none" }}>› Dashboard</Link>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>Useful Links</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { name: "Digital India", image: "/useful_digital_india.png", url: "https://digitalindia.gov.in" },
                  { name: "DigiLocker", image: "/useful_digilocker.png", url: "https://digilocker.gov.in" },
                  { name: "UMANG", image: "/useful_umang.png", url: "https://web.umang.gov.in" },
                  { name: "india.gov.in", image: "/useful_india_gov.png", url: "https://india.gov.in" },
                  { name: "myGov", image: "/useful_mygov.png", url: "https://mygov.in" },
                  { name: "data.gov.in", image: "/useful_data_gov.png", url: "https://data.gov.in" },
                  { name: "IGOD Portal", image: "/useful_igod.png", url: "https://igod.gov.in" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    title={`Open ${item.name} Official Portal`}
                    style={{
                      background: "#ffffff",
                      borderRadius: 10,
                      padding: "4px 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: 44,
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", marginBottom: 14 }}>Get in touch</div>
              <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6 }}>
                4th Floor, NeGD, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi - 110003, India<br /><br />
                <strong>Support Email:</strong> support-myscheme[at]digitalindia[dot]gov[dot]in<br />
                <strong>Helpline:</strong> (011) 24303714 (9:00 AM to 5:30 PM)
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
            <div>Last Updated On: 27/09/2026 | v-3.1.27</div>
            <div>*Compliant with WCAG 2.1 AA &amp; Digital Personal Data Protection (DPDP) Act 2023</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
