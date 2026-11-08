
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Ready to Find Your New Best Friend?
        </h2>

        <p className="mt-2 text-orange-50">
          Browse now, or report a stray animal you see — one small step can make
          a big difference.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/animals"
            className="rounded-md bg-white px-6 py-3 font-semibold text-primary shadow hover:bg-orange-50"
          >
            Browse Animals
          </Link>

          <Link
            to="/report"
            className="rounded-md border-2 border-white px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Report an Animal
          </Link>
        </div>
      </div>
    </section>
  );
}

