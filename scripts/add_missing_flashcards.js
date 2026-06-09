const fs = require('fs');

const flashcards = JSON.parse(fs.readFileSync('src/data/flashcards.json', 'utf-8'));
const existingTerms = new Set(flashcards.map(f => f.term.toLowerCase()));

const lessons = JSON.parse(fs.readFileSync('src/data/lessons.json', 'utf-8'));
const quizzes = JSON.parse(fs.readFileSync('src/data/quizzes.json', 'utf-8'));

let newCards = [];

// Terms to look for in lessons/quizzes that might be missing
const potentialTerms = {
  "Indemnity": "A principle of insurance where the insurer seeks to restore the insured to the same financial position as before the loss.",
  "Adhesion": "A contract prepared by one party (insurer) with no negotiation; the other party (insured) must accept it as is.",
  "Aleatory": "A contract where the values exchanged are not equal (e.g., small premium for large benefit).",
  "Unilateral": "A contract where only one party (the insurer) is legally bound to perform.",
  "Conditional": "A contract where both parties must perform certain duties to make the contract enforceable.",
  "Express Authority": "The authority specifically granted to an agent in writing by the insurer.",
  "Implied Authority": "The authority not explicitly granted but necessary for the agent to carry out their duties.",
  "Apparent Authority": "The authority the public perceives an agent to have based on the insurer's actions.",
  "Fiduciary": "A person in a position of trust, especially regarding financial matters like collecting premiums.",
  "Twisting": "Inducing a policyholder to drop an existing policy and buy a new one through misrepresentation.",
  "Churning": "Replacing a policy with the same insurer to earn extra commissions without benefiting the client.",
  "Rebating": "Offering something of value (like a portion of the commission) to an applicant to induce a sale.",
  "Domestic Insurer": "An insurance company incorporated in the state where it is doing business.",
  "Foreign Insurer": "An insurance company incorporated in another state.",
  "Alien Insurer": "An insurance company incorporated in another country.",
  "HMO (Health Maintenance Organization)": "A service provider that provides both the health care services and the financing for them.",
  "PPO (Preferred Provider Organization)": "A network of healthcare providers that offer services at a reduced rate to subscribers.",
  "Point of Service (POS)": "A type of health plan that allows members to choose between in-network and out-of-network care.",
  "Medicaid": "A joint state and federal program that provides health coverage to low-income individuals.",
  "Medicare": "A federal health insurance program for people 65 or older and certain younger people with disabilities.",
  "Social Security Disability": "A federal program providing benefits to workers who become totally and permanently disabled.",
  "Morbidity": "The rate at which sickness and injury occur within a specific group.",
  "Mortality": "The rate at which death occurs within a specific group.",
  "Participating Policy": "A policy where the policyowner is eligible to receive dividends or share in the insurer's profits.",
  "Non-participating Policy": "A policy where the policyowner does not share in the insurer's profits or receive dividends.",
  "STOLI (Stranger-Originated Life Insurance)": "A practice where investors induce individuals to take out life insurance for the benefit of the investor.",
  "Grace Period": "The period after the premium due date during which the policy remains in force.",
  "Free Look Period": "A period during which a new policyowner can review the policy and return it for a full refund.",
  "Incontestability": "A provision preventing the insurer from challenging the validity of a policy after it has been in force for a set period (usually 2 years).",
  "Subrogation": "The legal process by which an insurer seeks recovery from a third party responsible for a loss.",
  "COBRA": "A federal law allowing employees to continue group health coverage after leaving a job.",
  "Affordable Care Act (ACA)": "Federal legislation aimed at increasing healthcare access and affordability.",
  "Guaranteed Renewable": "A policy provision where the insurer must renew the policy as long as premiums are paid, but premiums can be increased by class.",
  "Noncancellable": "A policy provision where the insurer cannot cancel the policy or increase premiums as long as they are paid.",
  "Cancellable": "A policy that the insurer can terminate at any time.",
  "Valued Contract": "A contract that pays a stated amount regardless of the actual loss (e.g., life insurance).",
  "Reimbursement Contract": "A contract that pays the actual amount of the loss up to the policy limit (e.g., medical expense insurance)."
};

Object.keys(potentialTerms).forEach(term => {
  if (!existingTerms.has(term.toLowerCase())) {
    newCards.push({
      term: term,
      definition: potentialTerms[term],
      module: "Supplemental"
    });
  }
});

const updatedFlashcards = [...flashcards, ...newCards];
fs.writeFileSync('src/data/flashcards.json', JSON.stringify(updatedFlashcards, null, 2));
console.log(`Added ${newCards.length} missing flashcards.`);
