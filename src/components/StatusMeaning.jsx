export default function StatusMeaning() {
  const statuses = [
    {
      label: 'Processing',
      pillClass: 'bg-[#EEF3F8] text-[#41556b] border border-[#CBDCE9]',
      description: 'Your visa application is currently under review by the Cyprus visa authorities.'
    },
    {
      label: 'Approved',
      pillClass: 'bg-[#ECF9F0] text-[#1e873e] border border-[#9EE2B3]',
      description: 'Your visa application has been approved. Please follow the instructions provided by the visa office for passport submission or visa collection.'
    },
    {
      label: 'Rejected',
      pillClass: 'bg-[#FDF1F1] text-[#d03b39] border border-[#F6B8B7]',
      description: 'Your visa application has not been approved. Please contact the Cyprus visa office for further information.'
    }
  ]

  return (
    <section className="bg-[#f8fafc] pt-2 pb-16 md:pb-20">
      <div className="container mx-auto max-w-[860px] px-4 sm:px-6">
        <div className="bg-white rounded-[22px] border border-slate-200/80 p-6 sm:p-8 sm:pl-9">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] mb-5 tracking-tight">
            Status Meaning
          </h3>

          <div className="space-y-3 sm:space-y-3.5">
            {statuses.map((item) => (
              <div
                key={item.label}
                className="flex items-start sm:items-center gap-3.5 sm:gap-4"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3.5 py-0.5 text-[12px] font-medium shrink-0 min-w-[86px] text-center ${item.pillClass}`}
                >
                  {item.label}
                </span>
                <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-normal">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
