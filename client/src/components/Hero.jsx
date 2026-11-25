
import { Link } from "react-router-dom";

import {
  PawPrint,
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export default function Hero() {
  return (
    <section data-aos="fade-right" className="relative overflow-hidden bg-gradient-to-br from-[#FFF7ED] via-[#FFE4C7] to-[#FDBA74]/50">

      {/* Background Decorations */}

      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#FDBA74]/30 blur-3xl" />

      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#F97316]/15 blur-3xl" />

      <div className="absolute right-[40%] top-10 hidden text-[#DC2626]/10 lg:block">
        <PawPrint size={75} />
      </div>

      {/* Main Hero Content */}

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">

        {/* ================= LEFT CONTENT ================= */}

        <div className="text-center lg:text-left">

          {/* Top Badge */}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FDBA74] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFE4C7]">
              <Heart
                size={15}
                className="fill-[#DC2626] text-[#DC2626]"
              />
            </span>

            <span className="text-xs font-extrabold tracking-wide text-[#7F1D1D] sm:text-sm">
              EVERY PAW DESERVES A HOME
            </span>

            <Sparkles
              size={15}
              className="text-[#F97316]"
            />

          </div>

          {/* Main Heading */}

          <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-[#7F1D1D] sm:text-5xl lg:text-6xl xl:text-[68px]">

            Give a Rescued Animal a{" "}

            <span className="relative inline-block text-[#DC2626]">
              FurEver Home.

              <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-[#F97316]/50" />
            </span>

          </h1>

          {/* Description */}

          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-[#783F32] sm:text-lg lg:mx-0">

            Every animal deserves love, care and a second chance.
            Discover rescued pets waiting for adoption, report
            animals in need and connect with trusted shelters
            to make a difference.

          </p>

          {/* CTA Buttons */}

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">

            <Link
              to="/animals"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#7F1D1D] to-[#DC2626] px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-200"
            >
              <Heart size={19} />

              Adopt Now

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/report"
              className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 border-[#DC2626] bg-white/70 px-7 py-4 text-sm font-extrabold text-[#DC2626] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[#DC2626] hover:text-white hover:shadow-lg"
            >
              <PawPrint size={19} />

              Report an Animal

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* Trust Information */}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                <ShieldCheck
                  size={19}
                  className="text-[#DC2626]"
                />
              </div>

              <span className="text-xs font-bold text-[#7F1D1D] sm:text-sm">
                Trusted Shelters
              </span>

            </div>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                <HeartHandshake
                  size={19}
                  className="text-[#F97316]"
                />
              </div>

              <span className="text-xs font-bold text-[#7F1D1D] sm:text-sm">
                Animal Rescue
              </span>

            </div>

          </div>

        </div>

        {/* ================= RIGHT IMAGE ================= */}

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">

          {/* Decorative Background */}

          <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border-[18px] border-[#F97316]/20 sm:-right-8 sm:-top-8 sm:h-44 sm:w-44" />

          <div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-full bg-[#DC2626]/10 blur-xl" />

          {/* Main Image Container */}

          <div className="relative z-10 overflow-hidden rounded-[32px] border-[7px] border-white shadow-2xl shadow-[#7F1D1D]/20 sm:rounded-[40px]">

            <img
              src="https://i.ibb.co.com/CsW9sCN0/Pets.jpg"
              alt="Rescued animals waiting for their forever home"
              className="h-[340px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[430px] lg:h-[490px]"
            />

            {/* Image Overlay */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#7F1D1D]/50 via-transparent to-transparent" />

            {/* Image Bottom Text */}

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-md">

                <Heart
                  size={14}
                  className="fill-white"
                />

                LOVE CHANGES EVERYTHING

              </div>

              <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                A New Beginning,
                <br />
                A Forever Family.
              </h2>

            </div>

          </div>

          {/* Floating Adoption Card */}

          <div className="absolute -left-3 top-8 z-20 flex items-center gap-3 rounded-2xl border border-[#FFE4C7] bg-white p-3 shadow-xl sm:-left-8 sm:p-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFE4C7] text-[#DC2626] sm:h-12 sm:w-12">
              <HeartHandshake size={25} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#7F1D1D]">
                Spread Love
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">
                Change a life today
              </p>
            </div>

          </div>

          {/* Floating Paw Icon */}

          <div className="absolute -bottom-5 right-5 z-20 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[#DC2626] to-[#F97316] text-white shadow-xl sm:right-8 sm:h-20 sm:w-20">

            <PawPrint size={35} />

          </div>

        </div>

      </div>

      {/* Bottom Decorative Shape */}

      <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316]" />

    </section>
  );
}
