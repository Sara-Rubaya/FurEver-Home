
import {
  Search,
  ClipboardList,
  Home as HomeIcon,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse & Find",
    description:
      "Filter by species, age, and size to find the animal that best matches your preferences.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Apply to Adopt",
    description:
      "Submit your application with your housing information and experience. The shelter will review it.",
  },
  {
    icon: HomeIcon,
    step: "03",
    title: "Welcome Home",
    description:
      "Once your application is approved, bring your new family member home.",
  },
];

export default function HowItWorks() {
  return (
    <section data-aos="fade-right" className="relative overflow-hidden bg-[#FFF7ED] py-20">
      {/* Background Decorations */}
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-[#FDBA74]/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#F97316]/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FDBA74]/50 bg-white px-4 py-2 text-sm font-semibold text-[#9A3412] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#F97316]" />
            Simple Adoption Process
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#7F1D1D] sm:text-4xl md:text-5xl">
            How It <span className="text-[#F97316]">Works</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            Finding your new best friend is easier than you think.
            Follow these three simple steps to give a loving animal
            a forever home.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-7 md:grid-cols-3">
          {/* Connecting Line */}
          <div className="absolute left-[25%] right-[25%] top-12 hidden border-t-2 border-dashed border-[#FDBA74] md:block" />

          {steps.map(({ icon: Icon, step, title, description }) => (
            <div
              key={step}
              className="group relative rounded-3xl border border-[#FDBA74]/40 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#F97316]/50 hover:shadow-xl sm:p-8"
            >
              {/* Step Number */}
              <span className="absolute right-6 top-6 text-4xl font-black text-[#FDBA74]/40">
                {step}
              </span>

              {/* Icon */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#FFF7ED] text-[#F97316] transition-all duration-300 group-hover:rotate-3 group-hover:bg-[#F97316] group-hover:text-white">
                <Icon className="h-10 w-10" strokeWidth={1.8} />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#DC2626]">
                Step {step}
              </p>

              <h3 className="mt-3 text-xl font-bold text-[#7F1D1D]">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                {description}
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#9A3412]">
                <CheckCircle2 className="h-4 w-4 text-[#F97316]" />
                Easy & Simple
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-[#F97316] transition-all duration-300 group-hover:w-1/2" />
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <p className="text-sm font-medium text-gray-600">
            Every adoption starts with one simple step.
          </p>

          <div className="flex items-center gap-2 font-bold text-[#DC2626]">
            <span>Start your journey</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
