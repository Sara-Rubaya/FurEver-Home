import { Link } from "react-router-dom";

// Hero section - homepage er top e dekhabe
export default function Hero() {
  return (
    <section className="bg-orange-50">
      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-4 py-16 md:flex-row">
        {/* Text content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold leading-tight text-dark md:text-5xl">
            Give a Rescued Animal a{" "}
            <span className="text-primary">FurEver Home</span>
          </h1>
          <p className="mt-4 text-gray-600 md:text-lg">
            Browse rescued animals waiting for adoption, report a stray or
            injured animal, or support shelters through donations — all in
            one place.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <Link
              to="/animals"
              className="rounded-md bg-primary px-6 py-3 font-semibold text-white shadow hover:bg-orange-600"
            >
              Adopt Now
            </Link>
            <Link
              to="/report"
              className="rounded-md border-2 border-primary px-6 py-3 font-semibold text-primary hover:bg-orange-100"
            >
              Report an Animal
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1">
          <img
            src="https://i.ibb.co.com/CsW9sCN0/Pets.jpg"
            alt="Rescued dog waiting for adoption"
            className="w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
