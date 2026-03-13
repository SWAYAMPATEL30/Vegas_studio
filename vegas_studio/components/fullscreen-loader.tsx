"use client"

export default function FullScreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(2px)",
        zIndex: 9999,
      }}
    >
      {/* Spinner */}
      <div
        className="h-14 w-14 rounded-full border-4 border-t-transparent animate-spin"
        style={{
          borderColor: "#FDB400",
          borderTopColor: "transparent",
        }}
      />
    </div>
  )
}
