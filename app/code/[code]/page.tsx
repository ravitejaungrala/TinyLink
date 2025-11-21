import StatsCard from '@/components/StatsCard'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function StatsPage({ params }: PageProps) {
  const { code } = await params
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <a href="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Dashboard
        </a>
      </div>
      <StatsCard code={code} />
    </div>
  )
}