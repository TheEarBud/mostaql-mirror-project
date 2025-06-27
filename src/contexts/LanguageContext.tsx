
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.browseProjects': 'Browse Projects',
    'nav.findFreelancers': 'Find Freelancers',
    'nav.postProject': 'Post a Project',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Homepage
    'home.title': 'Find the perfect freelance services for your business',
    'home.subtitle': 'Work with talented people at the most affordable price to get the most done for your money',
    'home.getStarted': 'Get Started',
    'home.howItWorks': 'How it works',
    'home.postJob': 'Post a job',
    'home.postJobDesc': 'Tell us what you need done and receive competitive bids from freelancers.',
    'home.chooseFreelancer': 'Choose freelancers',
    'home.chooseFreelancerDesc': 'Compare profiles, portfolios, and reviews, then interview your favorites.',
    'home.getWork': 'Get work done',
    'home.getWorkDesc': 'Fund your project and the freelancer gets to work. Pay when satisfied.',
    
    // Authentication
    'auth.welcomeBack': 'Welcome back!',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.createAccount': 'Create Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.joinCommunity': 'Join our community today!',
    'auth.workAs': 'I want to:',
    'auth.workAsFreelancer': 'Work as a freelancer',
    'auth.hireFreelancers': 'Hire freelancers',
    'auth.agreeTerms': 'I agree to the Terms of Service and Privacy Policy',
    
    // Projects
    'projects.title': 'Browse Projects',
    'projects.subtitle': 'Find your next opportunity from thousands of projects',
    'projects.search': 'Search projects...',
    'projects.category': 'Category',
    'projects.budget': 'Budget Range',
    'projects.allCategories': 'All Categories',
    'projects.allBudgets': 'All Budgets',
    'projects.viewDetails': 'View Details',
    'projects.proposals': 'proposals',
    'projects.posted': 'Posted',
    
    // Post Project
    'postProject.title': 'Post a New Project',
    'postProject.subtitle': 'Tell us what you need done and receive competitive proposals from talented freelancers.',
    'postProject.projectTitle': 'Project Title',
    'postProject.whatNeedDone': 'What do you need done?',
    'postProject.selectCategory': 'Select a category',
    'postProject.description': 'Project Description',
    'postProject.describeProject': 'Describe your project in detail',
    'postProject.budgetTimeline': 'Budget & Timeline',
    'postProject.budgetType': 'Budget Type',
    'postProject.fixedPrice': 'Fixed Price - Pay a set amount for the entire project',
    'postProject.hourlyRate': 'Hourly Rate - Pay per hour of work',
    'postProject.projectBudget': 'Project Budget ($)',
    'postProject.hourlyRateLabel': 'Hourly Rate ($)',
    'postProject.projectDuration': 'Project Duration',
    'postProject.selectTimeframe': 'Select timeframe',
    'postProject.skillsRequired': 'Skills Required',
    'postProject.selectSkills': 'Select the skills needed for this project:',
    'postProject.submit': 'Post Project',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit'
  },
  ar: {
    // Navigation
    'nav.browseProjects': 'تصفح المشاريع',
    'nav.findFreelancers': 'ابحث عن المستقلين',
    'nav.postProject': 'انشر مشروع',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    
    // Homepage  
    'home.title': 'اعثر على الخدمات المستقلة المثالية لعملك',
    'home.subtitle': 'اعمل مع الأشخاص الموهوبين بأفضل الأسعار لإنجاز أكبر قدر من العمل مقابل أموالك',
    'home.getStarted': 'ابدأ الآن',
    'home.howItWorks': 'كيف يعمل',
    'home.postJob': 'انشر وظيفة',
    'home.postJobDesc': 'أخبرنا بما تحتاج إلى إنجازه واحصل على عروض تنافسية من المستقلين.',
    'home.chooseFreelancer': 'اختر المستقلين',
    'home.chooseFreelancerDesc': 'قارن الملفات الشخصية والمحافظ والمراجعات، ثم قابل المفضلين لديك.',
    'home.getWork': 'أنجز العمل',
    'home.getWorkDesc': 'مول مشروعك ويبدأ المستقل في العمل. ادفع عند الرضا.',
    
    // Authentication
    'auth.welcomeBack': 'مرحباً بعودتك!',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.createAccount': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.firstName': 'الاسم الأول',
    'auth.lastName': 'اسم العائلة',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.joinCommunity': 'انضم إلى مجتمعنا اليوم!',
    'auth.workAs': 'أريد أن:',
    'auth.workAsFreelancer': 'أعمل كمستقل',
    'auth.hireFreelancers': 'أوظف مستقلين',
    'auth.agreeTerms': 'أوافق على شروط الخدمة وسياسة الخصوصية',
    
    // Projects
    'projects.title': 'تصفح المشاريع',
    'projects.subtitle': 'اعثر على فرصتك التالية من آلاف المشاريع',
    'projects.search': 'ابحث في المشاريع...',
    'projects.category': 'الفئة',
    'projects.budget': 'نطاق الميزانية',
    'projects.allCategories': 'جميع الفئات',
    'projects.allBudgets': 'جميع الميزانيات',
    'projects.viewDetails': 'عرض التفاصيل',
    'projects.proposals': 'عروض',
    'projects.posted': 'نُشر',
    
    // Post Project
    'postProject.title': 'انشر مشروع جديد',
    'postProject.subtitle': 'أخبرنا بما تحتاج إلى إنجازه واحصل على عروض تنافسية من المستقلين الموهوبين.',
    'postProject.projectTitle': 'عنوان المشروع',
    'postProject.whatNeedDone': 'ما الذي تحتاج إلى إنجازه؟',
    'postProject.selectCategory': 'اختر فئة',
    'postProject.description': 'وصف المشروع',
    'postProject.describeProject': 'صف مشروعك بالتفصيل',
    'postProject.budgetTimeline': 'الميزانية والجدول الزمني',
    'postProject.budgetType': 'نوع الميزانية',
    'postProject.fixedPrice': 'سعر ثابت - ادفع مبلغاً محدداً للمشروع كاملاً',
    'postProject.hourlyRate': 'أجر بالساعة - ادفع مقابل كل ساعة عمل',
    'postProject.projectBudget': 'ميزانية المشروع ($)',
    'postProject.hourlyRateLabel': 'الأجر بالساعة ($)',
    'postProject.projectDuration': 'مدة المشروع',
    'postProject.selectTimeframe': 'اختر الإطار الزمني',
    'postProject.skillsRequired': 'المهارات المطلوبة',
    'postProject.selectSkills': 'اختر المهارات اللازمة لهذا المشروع:',
    'postProject.submit': 'انشر المشروع',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
