
import { Link } from "react-router-dom";
import {
  FaPaw,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#FFF7ED] text-[#7F1D1D]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-2xl font-bold text-[#7F1D1D]">
            <FaPaw className="text-[#F97316]" />
            FurEver Home
          </div>

          <p className="mt-4 max-w-xs text-sm leading-7 text-[#7F1D1D]/70">
            Connecting rescued animals with loving homes, one adoption
            at a time. Every little paw deserves a loving family.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFE4C7] px-4 py-2 text-sm font-medium text-[#DC2626]">
            <FaPaw className="text-[#F97316]" />
            Adopt Love. Save Lives.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-5 text-lg font-bold text-[#7F1D1D]">
            Quick Links
          </h4>

          <ul className="space-y-3 text-sm text-[#7F1D1D]/75">
            <li>
              <Link to="/" className="transition-colors hover:text-[#F97316]">
                Home
              </Link>
            </li>
            <li>
              <Link to="/animals" className="transition-colors hover:text-[#F97316]">
                Browse Animals
              </Link>
            </li>
            <li>
              <Link to="/report" className="transition-colors hover:text-[#F97316]">
                Report Animal
              </Link>
            </li>
            <li>
              <Link to="/donate" className="transition-colors hover:text-[#F97316]">
                Donate
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Socials */}
        <div>
          <h4 className="mb-5 text-lg font-bold text-[#7F1D1D]">
            Get In Touch
          </h4>

          <p className="flex items-center gap-3 text-sm text-[#7F1D1D]/75">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE4C7] text-[#DC2626]">
              <FaEnvelope />
            </span>
            support@fureverhome.com
          </p>

          <p className="mt-4 text-sm text-[#7F1D1D]/70">
            Follow us and help more animals find their forever homes.
          </p>

          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7F1D1D] text-white transition-all hover:-translate-y-1 hover:bg-[#DC2626]"
            >
              <FaFacebook />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7F1D1D] text-white transition-all hover:-translate-y-1 hover:bg-[#F97316]"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#FDBA74]/60 bg-[#FFE4C7]/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-center sm:flex-row">
          <p className="text-xs text-[#7F1D1D]/70">
            © {year} FurEver Home. All rights reserved.
          </p>

          <p className="flex items-center gap-2 text-xs font-medium text-[#7F1D1D]">
            Made with <span className="text-[#DC2626]">♥</span> for every paw
            <FaArrowRight className="text-[#F97316]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
