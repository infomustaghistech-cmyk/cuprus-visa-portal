import CheckStatus from '../components/CheckStatus'
import PageHeader from '../components/PageHeader'

export default function CheckStatusPage() {
  return (
    <>
      <PageHeader
        title="Check an application"
        intro="Enter the reference from your confirmation screen along with the passport number and date of birth used on the form."
      />
      <div className="section">
        <div className="container">
          <p className="mx-auto mb-6 max-w-3xl text-sm text-ink-mute">
            Sample references for this demo: CY-10001, CY-10002 and CY-10003.
          </p>
          <CheckStatus compact />
        </div>
      </div>
    </>
  )
}
