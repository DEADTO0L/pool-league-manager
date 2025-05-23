import Image from "next/image"

export function ShareFooter() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center text-center">
      <p className="mb-4 text-lg font-medium">Good tools are meant to be shared—pass it on</p>
      <div className="relative h-[300px] w-[300px]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deadtools_qr_green_bg-KGsMlP9XZ29zYq7cXrr25Zyv8PMYTW.png"
          alt="DEADTOOL's Pool League Team Manager QR Code"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  )
}
