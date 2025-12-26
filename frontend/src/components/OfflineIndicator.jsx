export default function OfflineIndicator({ isOffline }) {
  if (!isOffline) return null

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-center">
      <p className="font-semibold">
        ⚠️ You are currently offline. Changes cannot be saved.
      </p>
    </div>
  )
}
