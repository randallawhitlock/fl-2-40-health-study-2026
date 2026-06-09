const fs = require('fs');
const quizzes = JSON.parse(fs.readFileSync('src/data/quizzes.json', 'utf-8'));

const answers = {
  // Day 1 Module 1
  "Which of the following insurance concepts is founded on the ability to predict the approximate number of deaths or disabilities during a specific time for a specific group?": "Law of large numbers",
  "A boutique clothing owner is concerned her employees might take home clothing without paying for it. What type of hazard does this concern demonstrate?": "moral hazard",
  "Which of the following statements is CORRECT?": "Only pure risks are insurable.",
  "Insurable interest can be present in a variety of areas. Which statement does not identify an insurable risk?": "The loss cannot be due to chance.",
  "In the insurance industry, risk can be defined as ______.": "uncertainty regarding financial loss",
  "People buy insurance because it is one of the most effective ways of ______.": "transferring risk",
  "Insurance has several functions. Please identify one from the list below.": "It minimizes the individual's loss by sharing financial risk across a large group.",
  "A hurricane is an example of ______.": "a peril",
  "Alejandro bought his wife Maria a $20,000 diamond ring. When she is not wearing the ring, Maria keeps it locked in a safe. This is an example of risk ______.": "reduction",
  "Which of the following statements describe an element of an insurable risk? I - The loss must be due to chance. II - The loss must be definite and measurable. III - The loss must not be catastrophic. IV - The loss exposures to be insured must be large.": "I, II, III, IV",
  "The tendency for less favorable risks to seek or continue insurance is known as ______.": "adverse selection",
  "Which of the following statements concerning pure and speculative risks is true?": "Only pure risks are insurable.",
  "The purpose and function of insurance has its roots in economics and ______.": "human life value",
  "Human life value is the essence of an individual’s or family’s ______.": "economic existence",
  "Kara and her husband Jamal want to raise a family. They understand risk, and they have decided the best way to handle risk is to ______ the loss to another party.": "transfer",
  "Another way of looking at human life value is called future ______.": "earning potential",
  "Life and health insurance evolved to provide a practical solution to the economic losses associated with ______, ______, and ______.": "death, sickness, accidents",
  "Adverse selection is the tendency for people in ______ to seek insurance to a greater extent than other risks.": "poor health",
  "Which of the following is not a peril?": "Blindness",
  "How each person handles risks varies greatly depending on the situation or the degree of the loss. Which is the best way to handle risk for insurance?": "Risk transference",
  "Though insurance may be the best way to handle risk, not all risk is insurable. Which type of risk would not be insurable?": "Insurance for a tsunami",
  "A university decides to self-insure all their automobiles. This is an example of risk ______.": "retention",
  "Jimmy decides to install a smoke detector in his home. This is an example of risk ______.": "reduction",
  "Elizabeth does not want to lose money in the stock market, so she decides not to invest in the stock market. This is an example of ______.": "risk avoidance",
  "Andre is a gambler and wants to insure his losses. This is an example of ______.": "uninsurable speculative risk",

  // Day 2 Module 1
  "An insurance contract is not negotiated, rather it is prepared by the insurer. Which of the following statements explains this characteristic of insurance?": "The insurance contract is a contract of adhesion.",
  "Identify which statement is incorrect regarding insurable interest.": "A policy obtained by a person without insurable interest in the insured can be enforced.",
  "Review the statements below and identify which is accurate concerning an insurable interest.": "When the insured dies or becomes disabled, the policy owner must expect to suffer a loss.",
  "What is the parole evidence rule?": "A written contract cannot be changed by oral evidence.",
  "What makes an insurer competent?": "They are licensed or authorized by the state.",
  "At what time must an insurable interest exist in life and health contracts?": "At the inception of the policy",
  "Bill Wilson wants to obtain a life insurance policy on his employee, Kenneth Myers, and names Kenneth's wife, Susan, as the beneficiary. Whose signatures would be legally required on the application?": "Bill's and Kenneth's signatures are needed.",
  "What type of authority is not overtly extended but must be used to enable the agent to transact business of the principle?": "Implied",
  "The \"right of subrogation\" means the insurance company may acquire the insured's rights against liable third parties, those that may have contributed to the loss if a claim is paid. This could be found in which type of contract?": "Indemnity contracts",
  "Which of the following is a \"take it or leave it\" type of contract?": "Adhesion",
  "Mary pays a premium of $1500 annually for benefits of $250,000 worth of life insurance. This scenario describes what insurance feature?": "Aleatory",
  "Which of the following are considered competent instead of incompetent except:": "A 25-year-old under the influence",
  "Which statement concerning a life insurance contract is true?": "It is not a personal contract and can be given away.",
  "Which of the following are NOT valued contracts?": "Medical Expense policies",
  "Bill Wilson has a life insurance policy and has named his brother Kenneth Wilson as the primary beneficiary. The secondary beneficiary is Mary, Kenneth’s wife. Bill and Kenneth were riding in a car with Mary. Both Bill and Kenneth died in the car crash. Mary was the only survivor. Who will receive the life insurance proceeds?": "Mary will receive the proceeds as the secondary or contingent beneficiary.",
  "John worked for ABC Insurance. John was fired by his boss on March 1. John continued to write insurance and an application was received on March 25. What type of authority does this fall under?": "Apparent",
  "Which of the following is an example of a STOLI?": "An investor has Catherine, 78, to take out a policy and names herself as the beneficiary.",
  "Which of the following is a contract where only one party is liable in court?": "Unilateral",

  // Day 3 Module 1 (from Study Guide)
  "Which of the following statements is CORRECT regarding health insurance policy premiums?": "Health insurance policies are paid on a year-by-year basis and may experience periodic increases.",
  "Which of the following is NOT a fundamental type of health insurance coverage?": "Limited pay health",
  "In contrast to life insurance, which of the following premium factors is unique to health insurance?": "Morbidity",
  "Choose the CORRECT statement regarding health insurance.": "Medical expense policies reimburse the insured for the costs of medical care.",
  "A health insurance contract states that it will pay $350 a month to the insured should he or she become totally disabled. What type of contract is this?": "Valued",

  // Day 3 Module 2 (from Study Guide)
  "Which of the following service providers is known for emphasizing early detection and preventative care?": "HMOs",
  "Which of the following would make medical expense payments directly to the insured individual for covered medical expenses?": "Commercial insurer",
  "Who among the following individuals is MOST likely to qualify for Social Security disability beneﬁts?": "Kevin’s disability will prevent him from working for the next 12 months.",
  "Identify the INCORRECT statement regarding Medicaid.": "It restricts ﬁnancial help to people over 65 who require expensive medical services.",
  "Randy was injured in a car accident and applied for Social Security disability beneﬁts in August. If Randy’s application is approved, when will his beneﬁts begin?": "February",

  // Day 1 Module 2
  "Which of the following is NOT a correct standard for protecting consumers and promoting suitable sales that producers are expected to adhere?": "Assessing prospect's financial ability to pay commissions",
  "Which statement below does NOT indicate landmark cases and laws involving the regulation of insurance?": "The Federal Trade Commission (FTC) directly supervises the marketing techniques of all insurance companies.",
  "Which of the following statements about the National Association of Insurance Commissioners (NAIC) is NOT correct?": "The NAIC has the authority to prosecute and punish criminal violators in the insurance industry.",
  "Who do licensed agents legally represent in an insurance transaction?": "Insurer",
  "In Florida, brokers in insurance transactions may legally represent ______.": "the applicant and insured",
  "A life insurance company organized in Wisconsin, with an office in Pittsburg, and licensed to sell insurance in Florida is a ______.": "foreign company",
  "Which of the following is NOT a service provider?": "Lloyds of London",
  "Review the statements below and identify which is correct regarding the purpose of a reinsurer.": "A reinsurer assumes a portion of the risk from another insurer.",
  "State regulation of the insurance industry does not include ______.": "making insurance laws",
  "Which of the following is NOT a goal of the Buyer's Guide?": "Ensure that buyers obtain the lowest price for insurance",
  "What does the State Guaranty Association guarantee?": "That a claim will be paid if an insurer becomes insolvent",
  "Which of the following does NOT support the sale of insurance through agents and brokers?": "Direct selling system",
  "Which of the following is an example of a risk retention group (RRG)?": "A group of pharmacists",
  "Which of the following statement(s) is/are true concerning the NAIC?": "All of the answer choices are correct.",
  "An agent's license will terminate if he or she allows ______ years to pass without an appointment.": "four",
  "The USA Patriot Act was created in response to which of the following events?": "The September 11th attacks",
  "The ______ gives the state their ability to fine, issue cease and desist orders, and impose penalties.": "Unfair Trade Practices Act",
  "Reinsurers are a specialized branch of the insurance industry. This is because they insure ______.": "insurers",
  "Which group does this specialized entity—known as a reinsurer—primarily insure?": "Insurance companies",
  "Industrial insurance is characterized by relatively ______ face amounts.": "small",

  // Day 2 Module 2
  "In the selling process, when are serious problems of misrepresentation likely to occur?": "Presentation of recommendations",
  "Which of the following is NOT involved in the product presentation?": "Pressure",
  "All of the following are part of the Home Office underwriting process EXCEPT______.": "applicant's analyst report",
  "Ethics is defined as ______.": "standards of conduct, moral judgement, and instructions on how to interact with fellow members of a group or community",
  "A sales presentation is critical in the insurance industry. What is the main goal of it?": "To educate clients, empowering them to make their own decisions about what's right for them.",
  "What should a producer NOT do during a presentation?": "Sell a policy",
  "If the agent states mutual funds are the same as variable universal life insurance, this would be considered ______.": "misrepresentation",
  "An objective of the National Association of Insurance Commissioners is to ______.": "encourage uniformity in state insurance laws and regulations",
  "Which of the following is NOT a provision of NAIC's Life Insurance Illustrations Model Regulations?": "The words \"vanish\" and \"vanishing premium\" should be used sparingly in each policy illustration.",
  "The reason preprinted materials are recommended in the sales presentation is ______.": "preprinted materials have generally been reviewed for compliance.",
  "The purpose behind full disclosure requirements is to ______.": "help a client make an informed decision.",
  "An agent giving his client four tickets to a sporting event for purchasing a policy is an example of .": "rebating",
  "Identify which of the following is an example of churning.": "Churning occurs when one replaces a policy for another with the same insurer with the intent of earning additional premiums or commissions.",
  "Identify which of the following is included in the solicitation of insurance.": "All of the above",
  "The period specified in the free look provision begins.": "when the policy is delivered",
  "The producer should educate the applicant on all the following EXCEPT ______.": "how the DFS works with the CFO",
  "The producers have as much information as possible on the rating and rejection of the policy. Which of the following does not apply to the rating and rejection?": "All the above are correct",
  "What does the NAIC stand for?": "National Association of Insurance Commissioners",
  "What is a deceptive sales presentation?": "All of these are correct.",
  "Another ethical responsibility the producer owes the client is to briefly explain the underwriting process. Which is not included in the underwriting decision?": "Salary requirements",

  // Final Day 3 Module 2
  "Which of the following service providers allows for a primary care physician and out-of-network care?": "Point of Service Plan (POS)",
  "Which of the following groups are NOT eligible for Medicare coverage?": "People with any life-threatening condition",
  "How long is the waiting period before a person may file a claim for Social Security Disability benefits?": "5 months",
  "Why are HMOs a distinct form of health care provider?": "They provide financing for the health care plus the health care itself.",
  "If one becomes totally disabled, Social Security Disability benefits:": "May begin after six months",
  "Which of the following most accurately describes the Health Maintenance Act of 1973?": "It requires all employers with 25 or more employees to offer enrollment into an HMO if they provide health care benefits to their workers",
  "Basic Medical expense policies do not contain which feature?": "Deductibles",
  "The Social Security Act of 1965 created which of the following?": "Medicaid",
  "Which of the following are eligible for Medicare benefits? I - Individuals aged 65 and over II - Individuals under age 65 receiving Social Security disability benefits III - Individuals with chronic liver problems IV - Individuals with chronic kidney problems": "I, II, and IV",
  "In a health insurance policy, which term describes a situation where a policyowner has medical benefits assigned or paid directly to the hospital or physician?": "Right of assignment",
  "HMO's are known for emphasizing ______.": "Preventive medicine and early treatment",
  "All of the following statements concerning Social Security disability benefits are true EXCEPT:": "Benefits are retroactive to the time of disability.",
  "All of the following are eligible for Medicare EXCEPT:": "Dependents of those 65 or older",
  "Which of the following statements is true regarding Multiple Employer Trusts?": "The Multiple Employer Trust, not the employer, is the contract holder.",
  "All of the following may administer self-insured plans except:": "Actuaries",
  "Which of the following statement is true about Basic Hospital, Medical, and Surgical Expense Policies?": "They usually have a stated limit for specific expenses.",
  "Grouping small businesses together to obtain group insurance as one large group is characteristic of which of the following?": "A Multiple Employer Trust (MET)"
};

let updated = 0;
quizzes.forEach(q => {
  if (answers[q.question]) {
    q.answer = answers[q.question];
    updated++;
  }
});

fs.writeFileSync('src/data/quizzes.json', JSON.stringify(quizzes, null, 2));
console.log(`Updated ${updated} answers.`);
