import { Link } from "react-router-dom";
import { FaPaw, FaFacebook, FaInstagram, FaEnvelope } from "react-icons/fa";

// Footer - brand info + quick links + contact/socials
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-dark text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <FaPaw className="text-primary" />
            FurEver Home
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Connecting rescued animals with loving homes, one adoption at a time.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/animals" className="hover:text-primary">Browse Animals</Link></li>
            <li><Link to="/report" className="hover:text-primary">Report Animal</Link></li>
            <li><Link to="/donate" className="hover:text-primary">Donate</Link></li>
          </ul>
        </div>

        {/* Contact / socials */}
        <div>
          <h4 className="mb-3 font-semibold text-white">Contact</h4>
          <p className="flex items-center gap-2 text-sm">
            <FaEnvelope /> support@fureverhome.com
          </p>
          <div className="mt-3 flex gap-4 text-xl">
            <a href="#" aria-label="Facebook" className="hover:text-primary"><FaFacebook /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary"><FaInstagram /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {year} FurEver Home. All rights reserved.
      </div>
    </footer>
  );
}
