const fs = require('fs');
const quizzes = JSON.parse(fs.readFileSync('src/data/quizzes.json', 'utf-8'));

const cumulativeQuestions = [
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "A hurricane is an example of ______.",
    "options": ["a physical hazard", "a speculative risk", "a peril", "a storm"],
    "answer": "a peril"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Elizabeth does not want to lose money in the stock market, so she decides not to invest in the stock market. This is an example of ______.",
    "options": ["risk avoidance", "risk reduction", "risk transference", "risk retention"],
    "answer": "risk avoidance"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following statements is CORRECT?",
    "options": ["Only speculative risks are insurable.", "Only pure risks are insurable.", "Both pure risks and speculative risks are insurable.", "Neither pure risks nor speculative risks are insurable."],
    "answer": "Only pure risks are insurable."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "People buy insurance because it is one of the most effective ways of ______.",
    "options": ["avoiding risk", "transferring risk", "reducing risk", "retaining risk"],
    "answer": "transferring risk"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "The purpose and function of insurance has its roots in economics and ______.",
    "options": ["perils and hazards", "human life value", "risk avoidance", "risk reduction"],
    "answer": "human life value"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Dennis is reviewing several types of policies with his insurance agent. During their discussion, the insurance agent explains that some insurance contracts paid predetermined amounts stated in the policy, while others only reimburse the actual financial loss that occurred. Dennis learns that these types of contracts are categorized differently based on how benefits are determined. Which of the following are not valued contracts?",
    "options": ["Life insurance", "AD&D insurance", "Disability income insurance", "Medical expense insurance"],
    "answer": "Medical expense insurance"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following is an example of a risk retention group (RRG)?",
    "options": ["Labor unions", "A group of pharmacists", "A local church", "NAIFA"],
    "answer": "A group of pharmacists"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Who do licensed agents legally represent in an insurance transaction?",
    "options": ["Insurer", "Applicant and insured", "State Office of Insurance Regulation", "Themselves"],
    "answer": "Insurer"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Review the statements below and identify which is correct regarding the purpose of a reinsurer.",
    "options": ["A reinsurer accepts all risk from another insurer.", "A reinsurer assumes a portion of the risk from another insurer.", "A reinsurer cedes the risk.", "A reinsurer does not take any risk."],
    "answer": "A reinsurer assumes a portion of the risk from another insurer."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "A life insurance company organized in Wisconsin, with an office in Pittsburg, and licensed to sell insurance in Florida is a ______.",
    "options": ["domestic company", "alien company", "foreign company", "regional company"],
    "answer": "foreign company"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What is the parole evidence rule?",
    "options": ["Once a written contract is signed, it cannot be changed.", "An oral contract cannot be modified by written evidence.", "A written contract cannot be changed by oral evidence.", "An oral contract takes preference over any earlier written contracts."],
    "answer": "A written contract cannot be changed by oral evidence."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What makes an insurer competent?",
    "options": ["They are registered with the NAIC.", "They are licensed or authorized by the state.", "They follow the Code of Ethics of the state Office of Insurance Regulation.", "They register with the Security and Exchange Commission."],
    "answer": "They are licensed or authorized by the state."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following is an example of a STOLI?",
    "options": ["Brenda takes out a policy on her sister Pam.", "Emanuel takes out a policy on his employees.", "An investor has Catherine, 78, to take out a policy and names herself as the beneficiary.", "Destiny takes out a policy on her mother, Ann."],
    "answer": "An investor has Catherine, 78, to take out a policy and names herself as the beneficiary."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following is a \"take it or leave it\" type of contract?",
    "options": ["Aleatory", "Unilateral", "Conditional", "Adhesion"],
    "answer": "Adhesion"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following is a contract where only one party is liable in court?",
    "options": ["Aleatory", "Unilateral", "Conditional", "Adhesion"],
    "answer": "Unilateral"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What is a deceptive sales presentation?",
    "options": ["Any presentation that gives the prospect the wrong impression about any aspect of an insurance policy", "Any presentation that does not provide complete disclosure", "Any presentation that includes any misleading or inconclusive product comparison", "All of these are correct."],
    "answer": "All of these are correct."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "The period specified in the free look provision begins ______.",
    "options": ["when the policy is issued", "when the policy is delivered", "when the application is signed", "when the application is approved"],
    "answer": "when the policy is delivered"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "If the agent states mutual funds are the same as variable universal life insurance, this would be considered ______.",
    "options": ["twisting", "misrepresentation", "replacement", "rebating"],
    "answer": "misrepresentation"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "In the selling process, when are serious problems of misrepresentation likely to occur?",
    "options": ["Approach", "Presentation of recommendations", "Fact-finding and needs analysis", "Policy delivery and ongoing service"],
    "answer": "Presentation of recommendations"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following is NOT involved in the product presentation?",
    "options": ["Pressure", "Education", "Discussion", "Full Disclosure"],
    "answer": "Pressure"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What type of contract pays a stated amount in the event of loss?",
    "options": ["Reimbursement", "Stated", "Loss of value", "Valued"],
    "answer": "Valued"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Group health insurance is issued by commercial insurers and service organizations and provide coverage under a ______.",
    "options": ["Risk retention group", "Master contract", "Fraternal benefit society", "Medical Expense Plan"],
    "answer": "Master contract"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What are two types of health insurance reserves?",
    "options": ["Valued contracts & Indemnity contracts", "Jack & Jill Reserves", "premium reserves & loss reserves", "Master contracts & indemnity contracts"],
    "answer": "premium reserves & loss reserves"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the renewability provisions are least expensive?",
    "options": ["Cancellable", "Optionally Renewable", "Conditionally Renewable", "Noncancellable"],
    "answer": "Cancellable"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "The Affordable Care Act (ACA) created a number of insurance reforms. Which is NOT a part of the ACA reform?",
    "options": ["Insurance companies can no longer deny coverage based on preexisting conditions", "Individuals who make between 100-400% of the Federal Poverty Level (FPL) and want to purchase their own health insurance on the Exchange are eligible for subsidies.", "Medicaid eligibility was expanded to nearly all low-income individuals with incomes below 138% of federal poverty level", "All employers are mandated to offer disability income policies to all employees"],
    "answer": "All employers are mandated to offer disability income policies to all employees"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Most individual health insurance is issued on a ______ basis.",
    "options": ["participating", "non-participating", "claims", "cost"],
    "answer": "non-participating"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which item is not one of the five renewability provisions?",
    "options": ["Cancellable", "Non-cancelable", "Conditionally renewable", "All of these are parts of the five renewability provisions."],
    "answer": "All of these are parts of the five renewability provisions."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Select the CORRECT health insurance statement.",
    "options": ["Health insurance policies cannot be canceled by the insurer once they are issued.", "Many premium-payment options are available.", "Medical expense policies reimburse the insured for the costs of medical care.", "Disability income policies cover hospital expenses related to a disability."],
    "answer": "Medical expense policies reimburse the insured for the costs of medical care."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following statements are true regarding health insurance companies’ reserves?",
    "options": ["They are designated for future claims.", "The annual statement required by the state insurance departments breaks down a company's reserves in considerable detail.", "Two types of health insurance reserves are premium reserves and loss reserves.", "All of these are correct."],
    "answer": "All of these are correct."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which premium mode is least expensive?",
    "options": ["Annual", "Semiannual", "Quarterly", "Monthly"],
    "answer": "Annual"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "The Social Security Act of 1965 created which of the following?",
    "options": ["Old Age Benefits", "Medicaid", "Survivor benefits", "None of the above"],
    "answer": "Medicaid"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following service providers allows for a primary care physician and out-of-network care?",
    "options": ["Health Maintenance Organization (HMO)", "Preferred Provider (PPO)", "Point of Service Plan (POS)", "Exclusive Provider Organization (EPO)"],
    "answer": "Point of Service Plan (POS)"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Basic Medical expense policies do not contain which feature?",
    "options": ["Deductibles", "Room & Board benefits", "Physician office visits", "Miscellaneous benefits"],
    "answer": "Deductibles"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Choose the INCORRECT statement pertaining to Medicaid.",
    "options": ["Medicaid provides federal matching funds to states for medical public assistance plans.", "The purpose of Medicaid is to help eligible needy persons with medical assistance.", "Medicaid benefits can be applied to the deductible and coinsurance amounts of Medicare.", "Medicaid limits financial assistance to persons aged 65 or over who cannot afford necessary medical services."],
    "answer": "Medicaid limits financial assistance to persons aged 65 or over who cannot afford necessary medical services."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Choose the CORRECT statement pertaining to health maintenance organizations.",
    "options": ["An HMO is an insurance company that also markets group health insurance.", "Anna joined an HMO and then had a physical examination; she will be billed for the exam and each subsequent medical service as it is performed.", "An insurance company may sponsor or assist an HMO by offering contractual services.", "Like commercial insurers, HMOs generally assess deductibles."],
    "answer": "An insurance company may sponsor or assist an HMO by offering contractual services."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "What is the waiting period before someone can qualify for Social Security disability benefits?",
    "options": ["3 months", "5 months", "6 months", "12 months"],
    "answer": "5 months"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Why are HMOs a distinct form of health care provider?",
    "options": ["They are popular for large groups of employers.", "They provide financing for the health care plus the health care itself.", "They provide a large variety of options.", "The doctors operate on a fee for service arrangement."],
    "answer": "They provide financing for the health care plus the health care itself."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "All of the following statements concerning Social Security disability benefits are true EXCEPT:",
    "options": ["The impairment must be expected to last at least 12 months.", "The waiting period is 5 months.", "The waiting period may be waived in certain circumstances.", "Benefits are retroactive to the time of disability."],
    "answer": "Benefits are retroactive to the time of disability."
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following groups are NOT eligible for Medicare coverage?",
    "options": ["People aged 65 and older who are eligible for Social Security", "People aged 65 and older not eligible for Social Security, but willing to pay a monthly premium", "People of any age who have been entitled to S.S. Disability benefits", "People with any life-threatening condition"],
    "answer": "People with any life-threatening condition"
  },
  {
    "module": "Day 1-3 Cumulative Quiz",
    "question": "Which of the following are eligible for Medicare benefits? 1. Individuals aged 65 and over 2. Individuals under age 65 receiving Social Security disability benefits 3. Individuals with chronic liver problems 4. Individuals with chronic kidney problems",
    "options": ["1,2,3", "1,2,4", "1,3,4", "All the above"],
    "answer": "1,2,4"
  }
];

const allQuizzes = [...quizzes, ...cumulativeQuestions];
fs.writeFileSync('src/data/quizzes.json', JSON.stringify(allQuizzes, null, 2));
console.log(`Added ${cumulativeQuestions.length} cumulative questions.`);
