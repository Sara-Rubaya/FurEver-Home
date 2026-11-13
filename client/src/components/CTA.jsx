
import { Link } from "react-router-dom";
import {
  Heart,
  PawPrint,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function CTA() {
  return (
    <section data-aos="fade-right" className="relative overflow-hidden bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#DC2626]">
      {/* Background Decorations */}
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full border-[50px] border-white/5" />

      <div className="absolute right-[15%] top-10 hidden rotate-12 text-white/10 sm:block">
        <PawPrint size={100} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-orange-100 backdrop-blur-sm">
          <Heart className="h-4 w-4 fill-[#FDBA74] text-[#FDBA74]" />
          Make a Difference Today
        </div>

        {/* Heading */}
        <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          Ready to Find Your{" "}
          <span className="text-[#FDBA74]">New Best Friend?</span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-orange-50/90 sm:text-lg">
          Browse now, or report a stray animal you see. One small
          step can make a big difference in an animal's life.
        </p>

        {/* Buttons */}
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/animals"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-[#7F1D1D] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFF7ED] hover:shadow-xl"
          >
            <Heart className="h-5 w-5 text-[#DC2626] transition-transform duration-300 group-hover:scale-110" />
            Browse Animals
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 bg-white/5 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FDBA74] hover:bg-[#F97316] hover:shadow-xl"
          >
            <PawPrint className="h-5 w-5" />
            Report an Animal
          </Link>
        </div>

        {/* Trust Message */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-orange-100/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FDBA74]" />
            Safe Adoption Process
          </div>

          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-[#FDBA74] text-[#FDBA74]" />
            Give Them Love
          </div>

          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-[#FDBA74]" />
            Every Life Matters
          </div>
        </div>
      </div>
    </section>
  );
}
