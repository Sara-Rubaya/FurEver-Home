
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is there any fee for adoption?",
    answer:
      "The fee varies depending on the shelter. Usually, a small fee is charged to cover vaccination and neutering costs. The exact amount is mentioned by the shelter on the animal's details page.",
  },
  {
    question: "Can I get updates about a stray or injured animal I reported?",
    answer:
      "Yes. You can go to the 'My Reports' page to see the status of all the reports you have submitted (pending/in-progress/rescued).",
  },
  {
    question: "How long does it take to get verified after registering as a shelter?",
    answer:
      "The admin manually reviews and verifies shelter accounts. It usually takes 1–2 business days.",
  },
  {
    question: "Can I apply again if my application is rejected?",
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
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dark md:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-gray-600">
          Answers to some common questions.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question} className="rounded-lg border">
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-medium text-dark">{faq.question}</span>

                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <p className="px-5 pb-4 text-sm text-gray-600">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

