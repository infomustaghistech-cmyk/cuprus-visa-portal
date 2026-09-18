import {
  Users, Globe, Shield, Clock,
  Plane, Briefcase, Building2, GraduationCap,
  ClipboardList, CheckCircle
} from 'lucide-react'

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'apply', label: 'Apply Visa' },
  { id: 'status', label: 'Check Status' },
  { id: 'contact', label: 'Contact' }
]

export const STATS = [
  { icon: Users, value: 50000, suffix: '+', label: 'Visas Processed Annually' },
  { icon: Globe, value: 120, suffix: '+', label: 'Countries Served' },
  { icon: Shield, value: 99.9, suffix: '%', decimals: 1, label: 'Secure Processing' },
  { icon: Clock, value: 10, prefix: '5-', label: 'Days Average Processing' }
]

export const VISA_TYPES = [
  {
    id: 'tourist',
    icon: Plane,
    title: 'Tourist Visa',
    duration: 'Up to 90 days',
    description: 'For leisure travel and tourism purposes.',
    documents: ['Passport valid 6+ months', 'Return ticket', 'Hotel or host details', 'Travel insurance']
  },
  {
    id: 'business',
    icon: Briefcase,
    title: 'Business Visa',
    duration: 'Up to 90 days',
    description: 'For business meetings and conferences.',
    documents: ['Invitation letter', 'Company registration', 'Return ticket', 'Travel insurance']
  },
  {
    id: 'work',
    icon: Building2,
    title: 'Work Visa',
    duration: '1–4 years',
    description: 'For employment and work permits.',
    documents: ['Signed contract', 'Employer sponsorship', 'Medical certificate', 'Police clearance']
  },
  {
    id: 'student',
    icon: GraduationCap,
    title: 'Student Visa',
    duration: 'Course length',
    description: 'For academic studies and courses.',
    documents: ['Acceptance letter', 'Proof of tuition payment', 'Accommodation proof', 'Medical certificate']
  }
]

export const DESTINATIONS = [
  { name: 'Paphos', blurb: 'Ancient harbour & UNESCO heritage', image: '/paphos.png' },
  { name: 'Kyrenia', blurb: 'Colourful waterfront & mountain views', image: '/kyrenia.png' },
  { name: "Aphrodite's Rock", blurb: 'Legendary birthplace of Aphrodite', image: '/aphrodite.png' },
  { name: 'Limassol', blurb: 'Modern beachfront cosmopolitan city', image: '/limassol.png' }
]

export const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Submit Application',
    body: 'Complete the visa application form with your details and documents.',
    icon: ClipboardList
  },
  {
    step: '02',
    title: 'Processing',
    body: 'Your application is reviewed by immigration officers.',
    icon: Clock
  },
  {
    step: '03',
    title: 'Decision',
    body: 'Receive your visa approval or further instructions.',
    icon: CheckCircle
  }
]

export const FAQS = [
  {
    q: 'How long does visa processing take?',
    a: 'Most standard tourist and business visa applications take between 5 to 10 working days. Work and student visas may require additional time for document verification.'
  },
  {
    q: 'What documents do I need?',
    a: 'Required documents include a valid passport (minimum 6 months validity), completed application form, passport-size photographs, travel insurance, flight itinerary, and proof of accommodation or financial means.'
  },
  {
    q: 'Can I track my application?',
    a: 'Yes, you can track your application status anytime using our online Check Status tool with your Application Reference Number and Passport Number.'
  },
  {
    q: 'How do I contact support?',
    a: 'Our support team is available Monday through Friday from 8:00 AM to 5:00 PM. You can click Contact Support below, email us at support@mfa.gov.cy, or call +357 22 651000.'
  }
]

export const CONTACT_INFO = [
  { label: 'Email', value: 'support@example.com', note: 'Replies within two working days' },
  { label: 'Phone', value: '+357 00 000000', note: 'Monday to Friday, 9:00–17:00' },
  { label: 'Office', value: 'Demo Street 1, Nicosia', note: 'Placeholder address' },
  { label: 'Hours', value: '09:00 – 17:00 EET', note: 'Closed on public holidays' }
]
