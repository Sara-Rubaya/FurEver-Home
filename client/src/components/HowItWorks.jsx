import { Search, ClipboardList, Home as HomeIcon } from "lucide-react";

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
    <section className="bg-orange-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark md:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-gray-600">
            Find your new companion in just 3 simple steps.
          </p>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <Icon className="h-7 w-7" />
              </div>

              <p className="mt-3 text-xs font-semibold tracking-wide text-primary">
                STEP {step}
              </p>

              <h3 className="mt-1 font-semibold text-dark">{title}</h3>

              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

