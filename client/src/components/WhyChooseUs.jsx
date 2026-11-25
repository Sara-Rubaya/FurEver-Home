
import {
  ShieldCheck,
  Search,
  MapPinned,
  HeartHandshake,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Shelters",
    description:
      "All shelters and rescuers are verified by admins, so you don't have to worry about fake listings.",
    tag: "Safe & Trusted",
    iconBg: "bg-[#FFE4C7]",
    iconColor: "text-[#DC2626]",
    accent: "bg-[#DC2626]",
  },
  {
    icon: Search,
    title: "Easy Search & Filter",
    description:
      "Find your perfect companion using filters like species, age, size, and location.",
    tag: "Find Your Match",
    iconBg: "bg-orange-100",
    iconColor: "text-[#F97316]",
    accent: "bg-[#F97316]",
  },
  {
    icon: MapPinned,
    title: "Rescue Reporting",
    description:
      "Report stray or injured animals with photos and locations so rescuers can respond quickly.",
    tag: "Help Animals",
    iconBg: "bg-red-50",
    iconColor: "text-[#DC2626]",
    accent: "bg-[#DC2626]",
  },
  {
    icon: HeartHandshake,
    title: "Transparent Process",
    description:
      "Track your adoption application from pending to approved with a clear and transparent process.",
    tag: "Stay Updated",
    iconBg: "bg-[#FFE4C7]",
    iconColor: "text-[#F97316]",
    accent: "bg-[#F97316]",
  },
];

export default function WhyChooseUs() {
  return (
    <section data-aos="fade-left" className="relative overflow-hidden bg-[#FFF7ED] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

      {/* Background Decorations */}

      <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-[#FFE4C7]/60 blur-3xl" />

      <div className="absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* Section Heading */}

        <div className="mx-auto max-w-2xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FDBA74] bg-white px-4 py-2 shadow-sm">

            <Sparkles size={16} className="text-[#F97316]" />

            <span className="text-xs font-extrabold tracking-wider text-[#7F1D1D]">
              WHY FUREVER HOME
            </span>

          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#7F1D1D] sm:text-4xl lg:text-5xl">

            Why Choose{" "}

            <span className="text-[#DC2626]">
              FurEver Home?
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#783F32] sm:text-base">
            From rescue to adoption, we make every step easier,
            safer and more meaningful. Together, we can create
            a better world for animals.
          </p>

        </div>

        {/* Feature Cards */}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-[#FFE4C7] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#FDBA74] hover:shadow-xl hover:shadow-orange-100/70"
              >

                {/* Top Accent */}

                <div className={`absolute left-0 top-0 h-1.5 w-full ${feature.accent} opacity-70 transition-all duration-300 group-hover:h-2`} />

                {/* Card Number */}

                <span className="absolute right-6 top-6 text-4xl font-black text-[#FFF0E0] transition group-hover:text-[#FFE4C7]">
                  0{index + 1}
                </span>

                {/* Icon */}

                <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${feature.iconBg} transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                  <Icon
                    size={30}
                    className={feature.iconColor}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}

                <h3 className="mt-7 text-lg font-extrabold leading-snug text-[#7F1D1D] transition-colors group-hover:text-[#DC2626]">
                  {feature.title}
                </h3>

                {/* Description */}

                <p className="mt-3 min-h-[100px] text-sm leading-7 text-gray-500">
                  {feature.description}
                </p>

                {/* Bottom Tag */}

                <div className="mt-5 flex items-center justify-between border-t border-[#FFF0E0] pt-4">

                  <span className="flex items-center gap-2 text-xs font-bold text-[#7F1D1D]">

                    <CheckCircle2
                      size={15}
                      className="text-[#F97316]"
                    />

                    {feature.tag}

                  </span>

                  <ArrowUpRight
                    size={18}
                    className="text-[#DC2626] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />

                </div>

              </div>
            );
          })}

        </div>

        {/* Bottom Highlight */}

        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316] p-7 text-center shadow-xl shadow-orange-200/40 sm:p-9">

          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              <HeartHandshake size={27} />
            </div>

            <h3 className="text-xl font-extrabold text-white sm:text-2xl">
              Together, We Can Make a Difference!
            </h3>

            <p className="max-w-xl text-sm leading-7 text-white/85">
              Every adoption, every rescue and every helping hand
              brings us one step closer to a world where no animal
              is left behind.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}
