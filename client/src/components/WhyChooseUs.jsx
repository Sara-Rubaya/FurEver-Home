
import { ShieldCheck, Search, MapPinned, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Shelters",
    description:
      "All shelters and rescuers are verified by admins, so you don't have to worry about fake listings.",
  },

  {
    icon: Search,
    title: "Easy Search & Filter",
    description:
      "Find the perfect animal using filters like species, age, size, and location.",
  },

  {
    icon: MapPinned,
    title: "Rescue Reporting",
    description:
      "If you find a stray or injured animal, report it with a photo and location so rescuers can respond quickly.",
  },

  {
    icon: HeartHandshake,
    title: "Transparent Process",
    description:
      "Track your application status in real time — from pending to approved, everything stays clear.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark md:text-3xl">
          Why Choose FurEver Home
        </h2>

        <p className="mt-2 text-gray-600">
          From rescue to adoption, everything you need is in one place.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-primary">
              <Icon className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-semibold text-dark">{title}</h3>

            <p className="mt-2 text-sm text-gray-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

