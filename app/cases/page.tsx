import { createClient } from "@/lib/supabase/server"

export default async function CasesPage() {
  const supabase = createClient()
  
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    
  if (error) {
    console.error('Error fetching cases:', error)
    return <div>Error loading cases</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cases</h1>
      <div className="space-y-4">
        {cases?.map((case_item) => (
          <div key={case_item.id} className="border p-4 rounded-lg">
            <p>Report Date: {case_item.report_date}</p>
            <p>Patient Count: {case_item.patient_count}</p>
            <p>Status: {case_item.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}