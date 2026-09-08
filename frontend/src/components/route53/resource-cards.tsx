import { ArrowRightIcon } from "@/components/ui/icons";

function FeaturesVisual() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 800 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fiber-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#041428" />
          <stop offset="100%" stopColor="#0a3a8a" />
        </linearGradient>
      </defs>
      <rect width="800" height="640" fill="url(#fiber-bg)" />
      {Array.from({ length: 18 }, (_, index) => {
        const y = 20 + index * 34;
        return (
          <path
            key={y}
            d={`M-20 ${y} C 180 ${y + 80}, 420 ${y - 90}, 820 ${y + 40}`}
            fill="none"
            stroke={index % 3 === 0 ? "#4cc9ff" : "#2b7fff"}
            strokeWidth={index % 4 === 0 ? 2.4 : 1.2}
            opacity={0.55 + (index % 5) * 0.07}
          />
        );
      })}
    </svg>
  );
}

function CubesVisual() {
  return (
    <div className="absolute inset-0 bg-[#14171c]">
      <svg
        className="h-full w-full opacity-70"
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 40 }, (_, index) => {
          const col = index % 8;
          const row = Math.floor(index / 8);
          const x = col * 56 - 20;
          const y = row * 48 - 10;
          return (
            <g key={index} transform={`translate(${x} ${y})`}>
              <polygon points="28,4 52,18 28,32 4,18" fill="#2a3038" />
              <polygon points="4,18 28,32 28,52 4,38" fill="#1c2128" />
              <polygon points="28,32 52,18 52,38 28,52" fill="#343b45" />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-[#c084fc]/30 to-transparent" />
    </div>
  );
}

function ContactVisual() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="contact-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff4d2e" />
          <stop offset="100%" stopColor="#c81d25" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#contact-bg)" />
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 16 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 28 - 10}
            y={row * 24 - 8}
            width="26"
            height="22"
            fill="none"
            stroke="rgba(20,10,10,0.28)"
            strokeWidth="0.8"
            transform={`skewY(${row % 2 === 0 ? 6 : -6})`}
          />
        )),
      )}
    </svg>
  );
}

function CardLabel({ children }: { children: string }) {
  return (
    <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-[13px] font-medium text-white">
      {children}
    </span>
  );
}

export function ResourceCards() {
  return (
    <section id="get-started" className="py-16 md:py-24">
      <div className="aws-content">
        <h2 className="font-display mb-8 text-[32px] leading-tight font-medium text-aws-ink md:mb-10">
          Get started
        </h2>
        <div className="grid gap-4 md:grid-cols-5 md:grid-rows-2 md:gap-5">
          <a
            id="features"
            href="#features"
            className="aws-focus relative min-h-[280px] overflow-hidden rounded-2xl shadow-[0_10px_30px_rgba(20,60,140,0.28)] md:col-span-3 md:row-span-2 md:min-h-[420px]"
          >
            <FeaturesVisual />
            <CardLabel>Features page</CardLabel>
          </a>
          <a
            href="#"
            className="aws-focus relative min-h-[200px] overflow-hidden rounded-2xl text-white shadow-[0_8px_24px_rgba(20,20,20,0.25)] md:col-span-2"
          >
            <CubesVisual />
            <CardLabel>Getting started</CardLabel>
            <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-end p-5 md:p-6">
              <p className="text-[20px] leading-snug font-bold md:text-[22px]">
                Secure your Amazon VPC DNS resolution with Amazon Route 53
                Resolver DNS Firewall
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium">
                Learn more
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
          </a>
          <a
            href="#"
            className="aws-focus relative min-h-[180px] overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(180,30,30,0.25)] md:col-span-2"
          >
            <ContactVisual />
            <CardLabel>Contact us</CardLabel>
          </a>
        </div>
      </div>
    </section>
  );
}
