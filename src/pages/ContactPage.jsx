import Contact from '../components/Contact'
import FAQ from '../components/FAQ'
import PageHeader from '../components/PageHeader'

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact support"
        intro="Questions about a submitted application go to the support queue with your reference number."
      />
      <div className="section">
        <div className="container"><Contact compact /></div>
      </div>
      <FAQ />
    </>
  )
}
