
import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  PawPrint,
} from "lucide-react";

const faqs = [
  {
    question: "Is there any fee for adoption?",
    answer:
      "The fee varies depending on the shelter. Usually, a small fee is charged to cover vaccination and neutering costs. The exact amount is mentioned by the shelter on the animal's details page.",
  },
  {
    question:
      "Can I get updates about a stray or injured animal I reported?",
    answer:
      "Yes. You can go to the 'My Reports' page to see the status of all the reports you have submitted (pending/in-progress/rescued).",
  },
  {
    question:
      "How long does it take to get verified after registering as a shelter?",
    answer:
      "The admin manually reviews and verifies shelter accounts. It usually takes 1–2 business days.",
  },
  {
    question:
      "Can I apply again if my application is rejected?",
    answer:
      "Duplicate applications for the same animal are not allowed. However, you can apply for any other available animal at any time.",
  },
  {
    question: "How does the donation process work?",
    answer:
      "Donations are used directly for the shelter's operational costs, such as food and medical care. Payment gateway integration will be added soon.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section data-aos="fade-left" className="relative overflow-hidden bg-white py-20">
      {/* Background Decorations */}
      <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#FDBA74]/15 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-[#F97316]/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FDBA74]/50 bg-[#FFF7ED] px-4 py-2 text-sm font-semibold text-[#9A3412]">
            <HelpCircle className="h-4 w-4 text-[#F97316]" />
            Got Questions?
          </span>

          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#7F1D1D] sm:text-4xl md:text-5xl">
            Frequently Asked{" "}
            <span className="text-[#F97316]">Questions</span>
          </h2>

          <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            Everything you need to know about adopting, reporting
            animals, and becoming part of our community.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-12 flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`group overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-[#FDBA74] bg-[#FFF7ED] shadow-lg shadow-[#7F1D1D]/5"
                    : "border-gray-200 bg-white hover:border-[#FDBA74] hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-300 ${
                        isOpen
                          ? "bg-[#7F1D1D] text-white"
                          : "bg-[#FFF7ED] text-[#DC2626] group-hover:bg-[#FDBA74]/30"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`text-sm font-bold leading-6 transition-colors duration-300 sm:text-base ${
                        isOpen ? "text-[#7F1D1D]" : "text-gray-800"
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#F97316] text-white"
                        : "bg-[#FFF7ED] text-[#9A3412]"
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-[#FDBA74]/40 px-5 pb-6 pt-4 sm:px-7 sm:pl-[5.75rem]">
                      <p className="text-sm leading-7 text-gray-600 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Card */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#7F1D1D] to-[#DC2626] p-7 text-center shadow-xl shadow-[#7F1D1D]/15 sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
            <MessageCircle className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-xl font-bold text-white sm:text-2xl">
            Still Have Questions?
          </h3>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/80">
            We are here to help you. Your journey to giving an animal
            a loving forever home matters to us.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white">
            <PawPrint className="h-4 w-4" />
            We're happy to help!
          </div>
        </div>
      </div>
    </section>
  );
}
