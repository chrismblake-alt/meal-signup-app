interface KidCountProps {
  min: number
  max: number
}

export default function KidCount({ min, max }: KidCountProps) {
  return (
    <div className="card bg-gradient-to-r from-[#e31837] to-[#c2152f] text-white shadow-lg border-4 border-[#e31837]/20">
      <div className="text-center py-2">
        <p className="text-sm uppercase tracking-wide opacity-90 mb-1">Currently Serving</p>
        <p className="text-6xl font-bold mb-1">{min}-{max}</p>
        <p className="text-xl font-medium mb-3">Children Each Night</p>
        <div className="bg-[#e31837] rounded-lg px-4 py-3 mx-auto max-w-md border-2 border-white">
          <p className="text-lg font-semibold text-white">
            Please prepare meals for approximately {min}-{max} children
          </p>
        </div>
        <p className="text-sm opacity-80 mt-3">Updated weekly based on shelter capacity</p>
      </div>
    </div>
  )
}
