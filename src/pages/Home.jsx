import Hero from '../components/Hero'
import Statistics from '../components/Statistics'
import DiscoverCyprus from '../components/DiscoverCyprus'
import About from '../components/About'
import VisaTypes from '../components/VisaTypes'
import ApplicationProcess from '../components/ApplicationProcess'
import FAQ from '../components/FAQ'
import StatusMeaning from '../components/StatusMeaning'
import CTA from '../components/CTA'

export default function Home({ onNavigate }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <Statistics />
      <DiscoverCyprus />
      <About />
      <VisaTypes onNavigate={onNavigate} />
      <ApplicationProcess />
      <FAQ />
      <StatusMeaning />
      <CTA onNavigate={onNavigate} />
    </>
  )
}
