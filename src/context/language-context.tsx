import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ta" | "hi";

interface Translations {
    [key: string]: {
        en: string;
        ta: string;
        hi: string;
    }
}

const translations: Translations = {
    "home": { en: "Home", ta: "முகப்பு", hi: "होम" },
    "categories": { en: "Categories", ta: "வகைகள்", hi: "श्रेणियां" },
    "market_price": { en: "Market Price", ta: "சந்தை விலை", hi: "बाजार मूल्य" },
    "verification": { en: "Verification", ta: "சரிபார்ப்பு", hi: "सत्यापन" },
    "price_compare": { en: "Price Compare", ta: "விலை ஒப்பீடு", hi: "मूल्य तुलना" },
    "dashboard": { en: "Dashboard", ta: "கட்டுப்பாட்டகம்", hi: "डैशबोर्ड" },
    "about": { en: "About", ta: "எங்களை பற்றி", hi: "हमारे बारे में" },
    "get_started": { en: "Get Started", ta: "தொடங்குங்கள்", hi: "शुरू करें" },
    "logout": { en: "Logout", ta: "வெளியேறு", hi: "लॉग आउट" },
    "orders": { en: "Orders", ta: "ஆர்டர்கள்", hi: "आदेश" },
    "language": { en: "Language", ta: "மொழி", hi: "भाषा" },
    
    // Dashboard Specific
    "search_placeholder": { 
        en: "Search for a product... (e.g. Tomato, Rice)", 
        ta: "பொருளை தேடுக... (எ.கா: தக்காளி, அரிசி)", 
        hi: "उत्पाद खोजें... (जैसे टमाटर, चावल)" 
    },
    "current_market_price": { en: "Current Market Price", ta: "தற்போதைய சந்தை விலை", hi: "वर्तमान बाजार मूल्य" },
    "reference": { en: "Reference", ta: "குறிப்பு", hi: "संदर्भ" },
    "best_match": { en: "Best Match", ta: "சிறந்த பொருத்தம்", hi: "सर्वश्रेष्ठ मैच" },
    "nearest": { en: "Nearest", ta: "அருகில்", hi: "निकटतम" },
    "low_to_high": { en: "Low to High", ta: "குறைவு முதல் அதிகம்", hi: "कम से ज्यादा" },
    "high_to_low": { en: "High to Low", ta: "அதிகம் முதல் குறைவு", hi: "ज्यादा से कम" },
    "farmers_selling": { en: "farmers selling", ta: "விவசாயிகள் விற்கிறார்கள்", hi: "किसान बेच रहे हैं" },
    "km_away": { en: "km away", ta: "கி.மீ தூரம்", hi: "किमी दूर" },
    "vs_market": { en: "vs market", ta: "சந்தையுடன்", hi: "बाजार के मुकाबले" },
    "live_farmer_map": { en: "Live Farmer Map", ta: "நேரடி விவசாயி வரைபடம்", hi: "लाइव किसान नक्शा" },
    "map_subtitle": { 
        en: "See exactly where your produce is coming from", 
        ta: "உங்கள் விளைபொருள் எங்கிருந்து வருகிறது என்பதைச் சரியாகப் பார்க்கவும்", 
        hi: "देखें कि आपकी उपज कहाँ से आ रही है" 
    },
    "pre_book": { en: "Pre-Book", ta: "முன்பதிவு", hi: "प्री-बुक" },
    
    // Farmer View
    "farmer_view_sub": { en: "See how your prices compare to other farmers across all products. Your listings are highlighted in green.", ta: "உங்கள் விலைகள் மற்ற விவசாயிகளுடன் எவ்வாறு ஒப்பிடப்படுகின்றன என்பதைப் பாருங்கள். உங்கள் பட்டியல்கள் பச்சை நிறத்தில் சிறப்பிக்கப்பட்டுள்ளன.", hi: "देखें कि आपकी कीमतें अन्य किसानों की तुलना में कैसी हैं। आपकी लिस्टिंग हरे रंग में हाइलाइट की गई हैं।" },
    "market": { en: "Market", ta: "சந்தை", hi: "बाज़ार" },
    "your_price": { en: "Your Price", ta: "உங்கள் விலை", hi: "आपकी कीमत" },
    "farmer": { en: "Farmer", ta: "விவசாயி", hi: "किसान" },
    "price": { en: "Price", ta: "விலை", hi: "कीमत" },
    "rank": { en: "Rank", ta: "தரம்", hi: "रैंक" },
    "no_farmers_listed": { en: "No farmers listed", ta: "எந்த விவசாயியும் பட்டியலிடப்படவில்லை", hi: "कोई किसान सूचीबद्ध नहीं है" },
    "you": { en: "(You)", ta: "(நீங்கள்)", hi: "(आप)" },
    
    // Hero Section
    "hero_title_1": { en: "Farm Fresh", ta: "பண்ணை புதியவை", hi: "खेत से ताज़ा" },
    "hero_title_2": { en: "Directly to You", ta: "நேரடியாக உங்களுக்கு", hi: "सीधे आप तक" },
    "hero_subtitle": { 
        en: "Connect directly with local farmers. Get fresh, traceable produce delivered to your doorstep. No middlemen, fair prices, guaranteed quality.", 
        ta: "உள்ளூர் விவசாயிகளுடன் நேரடியாக இணையுங்கள். புதிய மற்றும் தரமான விளைபொருட்களை உங்கள் வீட்டு வாசலில் பெறுங்கள். இடைத்தரகர்கள் இல்லை, நியாயமான விலை, உத்தரவாதமான தரம்.", 
        hi: "स्थानीय किसानों से सीधे जुड़ें। ताज़ा और गुणवत्तापूर्ण उपज सीधे अपने दरवाजे पर प्राप्त करें। कोई बिचौलिया नहीं, उचित मूल्य, गारंटीकृत गुणवत्ता।" 
    },
    "explore_categories": { en: "Explore Categories", ta: "வகைகளை ஆராயுங்கள்", hi: "श्रेणियों का अन्वेषण करें" },
    "shop_as_customer": { en: "Shop as Customer", ta: "வாடிக்கையாளராக வாங்குக", hi: "ग्राहक के रूप में खरीदारी करें" },
    "join_as_farmer": { en: "Join as Farmer", ta: "விவசாயியாக இணையுங்கள்", hi: "किसान के रूप में जुड़ें" },
    "fresh": { en: "100% Fresh", ta: "100% புதியவை", hi: "100% ताज़ा" },
    "fresh_sub": { en: "Daily harvest", ta: "தினசரி அறுவடை", hi: "दैनिक फसल" },
    "direct_trade": { en: "Direct Trade", ta: "நேரடி வர்த்தகம்", hi: "प्रत्यक्ष व्यापार" },
    "direct_trade_sub": { en: "No middlemen", ta: "இடைத்தரகர்கள் இல்லை", hi: "कोई बिचौलिया नहीं" },
    "verified": { en: "Verified", ta: "சரிபார்க்கப்பட்டது", hi: "सत्यापित" },
    "verified_sub": { en: "Quality assured", ta: "தரம் உறுதிசெய்யப்பட்டது", hi: "गुणवत्ता का आश्वासन" },
    "lab_tested": { en: "Lab tested", ta: "ஆய்வக சோதனை செய்யப்பட்டது", hi: "प्रयोगशाला में परीक्षण किया गया" },

    // Products
    "tomato": { en: "Tomato", ta: "தக்காளி", hi: "टमाटर" },
    "onion": { en: "Onion", ta: "வெங்காயம்", hi: "प्याज" },
    "potato": { en: "Potato", ta: "உருளைக்கிழங்கு", hi: "आलू" },
    "rice": { en: "Rice", ta: "அரிசி", hi: "चावल" },
    "wheat": { en: "Wheat", ta: "கோதுமை", hi: "गेहूँ" },
    "milk": { en: "Milk", ta: "பால்", hi: "दूध" },
    "red apple": { en: "Red Apple", ta: "சிவப்பு ஆப்பிள்", hi: "लाल सेब" },
    "green apple": { en: "Green Apple", ta: "பச்சை ஆப்பிள்", hi: "हरा सेब" },
    "banana": { en: "Banana", ta: "வாழைப்பழம்", hi: "केला" },
    "grapes": { en: "Grapes", ta: "திராட்சை", hi: "अंगूर" },
    "orange": { en: "Orange", ta: "ஆரஞ்சு", hi: "संतरा" },
    "lemon": { en: "Lemon", ta: "எலுமிச்சை", hi: "नींबू" },
    "apple-fresh": { en: "Apple-Fresh", ta: "ஆப்பிள்-புதிய", hi: "सेब-ताजा" },
    "carrot-fresh": { en: "Carrot-Fresh", ta: "கேரட்-புதிய", hi: "गाजर-ताजा" },

    // Categories
    "vegetables": { en: "Vegetables", ta: "காய்கறிகள்", hi: "सब्जियां" },
    "fruits": { en: "Fruits", ta: "பழங்கள்", hi: "फल" },
    "grains": { en: "Grains", ta: "தானியங்கள்", hi: "अनाज" },
    "dairy": { en: "Dairy", ta: "பால் பொருட்கள்", hi: "डेयरी" },
    
    // Others
    "popular_products": { en: "POPULAR PRODUCTS", ta: "பிரபலமான பொருட்கள்", hi: "लोकप्रिय उत्पाद" },
    "local_market": { en: "Local Market", ta: "உள்ளூர் சந்தை", hi: "स्थानीय बाज़ार" },
    "distance_unknown": { en: "Distance unknown", ta: "தூரம் தெரியவில்லை", hi: "दूरी अज्ञात" },
    "you_are_here": { en: "You are here", ta: "நீங்கள் இங்கே உள்ளீர்கள்", hi: "आप यहां हैं" },
    "no_products_found": { en: "No products found for", ta: "எந்த பொருட்களும் கிடைக்கவில்லை", hi: "के लिए कोई उत्पाद नहीं मिला" },

    // Market Prices
    "market_prices_title": { en: "Market Prices", ta: "சந்தை விலைகள்", hi: "बाजार मूल्य" },
    "market_prices_sub": { en: "Real-time pricing from local markets. Updated daily to ensure fair and transparent pricing.", ta: "உள்ளூர் சந்தைகளிலிருந்து நிகழ்நேர விலை நிர்ணயம். நியாயமான மற்றும் வெளிப்படையான விலையை உறுதி செய்ய தினமும் புதுப்பிக்கப்படுகிறது.", hi: "स्थानीय बाजारों से रीयल-टाइम मूल्य निर्धारण। उचित और पारदर्शी मूल्य निर्धारण सुनिश्चित करने के लिए प्रतिदिन अपडेट किया जाता है।" },
    "todays_market_prices": { en: "Today's Market Prices", ta: "இன்றைய சந்தை விலைகள்", hi: "आज के बाजार मूल्य" },
    "last_updated": { en: "Last updated:", ta: "கடைசியாக புதுப்பிக்கப்பட்டது:", hi: "अंतिम बार अपडेट किया गया:" },
    "clear_all_listings": { en: "Clear All Listings", ta: "அனைத்து பட்டியல்களையும் அழிக்கவும்", hi: "सभी लिस्टिंग साफ़ करें" },
    "market_is_empty": { en: "Market is empty", ta: "சந்தை காலியாக உள்ளது", hi: "बाजार खाली है" },
    "use_scanner": { en: "Use the scanner to identify and list your produce!", ta: "உங்கள் விளைபொருட்களை அடையாளம் காணவும் பட்டியலிடவும் ஸ்கேனரைப் பயன்படுத்தவும்!", hi: "अपनी उपज की पहचान करने और सूचीबद्ध करने के लिए स्कैनर का उपयोग करें!" },
    "transparent_pricing": { en: "transparent pricing.", ta: "வெளிப்படையான விலை.", hi: "पारदर्शी मूल्य निर्धारण।" },
    "starts_from": { en: "STARTS FROM", ta: "ஆரம்ப விலை", hi: "शुरुआती कीमत" },
    "farmers_listed": { en: "FARMERS LISTED", ta: "பட்டியலிடப்பட்ட விவசாயிகள்", hi: "सूचीबद्ध किसान" },
    "price_by_farmer": { en: "PRICE BY FARMER", ta: "விவசாயி வாரியாக விலை", hi: "किसान के अनुसार मूल्य" },
    "market_average": { en: "Market Average", ta: "சந்தை சராசரி", hi: "बाजार का औसत" },
    "view_best_deals": { en: "View Best Deals", ta: "சிறந்த சலுகைகளை காண்க", hi: "सर्वोत्तम सौदे देखें" },
    "market_trend": { en: "Market Trend", ta: "சந்தை போக்கு", hi: "बाजार का रुझान" },
    "market_trend_sub": { en: "Prices are stabilizing with seasonal adjustments.", ta: "பருவகால மாற்றங்களுடன் விலைகள் சீராகின்றன.", hi: "मौसमी समायोजन के साथ कीमतें स्थिर हो रही हैं।" },
    "active_markets": { en: "Active Markets", ta: "செயலில் உள்ள சந்தைகள்", hi: "सक्रिय बाजार" },
    "active_markets_sub": { en: "Data from 15+ local wholesale markets.", ta: "15+ உள்ளூர் மொத்த சந்தைகளின் தரவு.", hi: "15+ स्थानीय थोक बाजारों से डेटा।" },
    "update_frequency": { en: "Update Frequency", ta: "புதுப்பிப்பு நிகழ்வெண்", hi: "अद्यतन आवृत्ति" },
    "update_frequency_sub": { en: "Real-time updates every 30 minutes.", ta: "ஒவ்வொரு 30 நிமிடங்களுக்கும் நிகழ்நேர புதுப்பிப்புகள்.", hi: "हर 30 मिनट में रीयल-टाइम अपडेट।" },

    // Price Compare
    "price_compare_title": { en: "Price Compare", ta: "விலை ஒப்பீடு", hi: "मूल्य तुलना" },
    "price_compare_sub": { en: "Find the best deals — compare farmer prices against market rates", ta: "சிறந்த சலுகைகளைக் கண்டறியவும் — சந்தை விகிதங்களுக்கு எதிராக விவசாயிகளின் விலைகளை ஒப்பிடவும்", hi: "सर्वोत्तम सौदे खोजें — बाजार दरों के मुकाबले किसान कीमतों की तुलना करें" },
    "price_intelligence": { en: "PRICE INTELLIGENCE", ta: "விலை நுண்ணறிவு", hi: "मूल्य बुद्धिमत्ता" },
    "compare_prices": { en: "Compare Prices", ta: "விலைகளை ஒப்பிடவும்", hi: "कीमतों की तुलना करें" },
    "compare_prices_sub": { en: "Search any product to compare prices from all available farmers.", ta: "கிடைக்கக்கூடிய அனைத்து விவசாயிகளிடமிருந்தும் விலைகளை ஒப்பிட எந்தப் பொருளையும் தேடுங்கள்.", hi: "उपलब्ध सभी किसानों से कीमतों की तुलना करने के लिए कोई भी उत्पाद खोजें।" },

    // About
    "about_title": { en: "About AgriLink", ta: "அக்ரிலிங்க் பற்றி", hi: "एग्रीलिंक के बारे में" },
    "about_sub": { en: "Connecting farmers directly with customers for fresh, quality produce", ta: "புதிய, தரமான விளைபொருட்களுக்காக விவசாயிகளை நேரடியாக வாடிக்கையாளர்களுடன் இணைக்கிறது", hi: "ताजा, गुणवत्तापूर्ण उपज के लिए किसानों को सीधे ग्राहकों से जोड़ना" },
    "about_desc_1": { en: "Bridging the gap between farmers and consumers through technology, trust, and transparency. We're more than a marketplace – we're a movement towards sustainable agriculture.", ta: "தொழில்நுட்பம், நம்பிக்கை மற்றும் வெளிப்படைத்தன்மை மூலம் விவசாயிகளுக்கும் நுகர்வோருக்கும் இடையிலான இடைவெளியைக் குறைக்கிறது.", hi: "प्रौद्योगिकी, विश्वास और पारदर्शिता के माध्यम से किसानों और उपभोक्ताओं के बीच की खाई को पाटना।" },
    "our_mission": { en: "Our Mission", ta: "எங்கள் நோக்கம்", hi: "हमारा मिशन" },
    "our_mission_desc": { en: "To create a transparent, sustainable, and fair agricultural ecosystem...", ta: "ஒரு வெளிப்படையான, நிலையான மற்றும் நியாயமான விவசாய சுற்றுச்சூழல் அமைப்பை உருவாக்குவது...", hi: "एक पारदर्शी, टिकाऊ और निष्पक्ष कृषि पारिस्थितिकी तंत्र बनाना..." },
    "farm_to_fork": { en: "Farm-to-Fork Transparency", ta: "பண்ணையிலிருந்து தட்டு வரை வெளிப்படைத்தன்மை", hi: "खेत से मेज तक पारदर्शिता" },
    "fair_trade": { en: "Fair Trade Practices", ta: "நியாயமான வர்த்தக நடைமுறைகள்", hi: "निष्पक्ष व्यापार प्रथाएं" },
    "sustainable_ag": { en: "Sustainable Agriculture", ta: "நிலையான விவசாயம்", hi: "टिकाऊ कृषि" },
    "quality_assurance": { en: "Quality Assurance", ta: "தரம் உத்தரவாதம்", hi: "गुणवत्ता आश्वासन" },
    "our_story": { en: "Our Story", ta: "எங்கள் கதை", hi: "हमारी कहानी" },
    "building_trust": { en: "Building Trust", ta: "நம்பிக்கையை உருவாக்குதல்", hi: "विश्वास बनाना" },
    "join_our_community": { en: "Join Our Community", ta: "எங்கள் சமூகத்தில் இணையுங்கள்", hi: "हमारे समुदाय में शामिल हों" }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => {},
    t: (key) => String(key)
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("en");

    useEffect(() => {
        const savedLang = localStorage.getItem("agrilink_language") as Language;
        if (savedLang && ["en", "ta", "hi"].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("agrilink_language", lang);
    };

    const t = (key: string) => {
        if (translations[key]) {
            return translations[key][language];
        }
        // Fallback to key if translation missing
        return key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
