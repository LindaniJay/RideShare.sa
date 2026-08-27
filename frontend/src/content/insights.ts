export type InsightSection = {
  heading: string;
  paragraphs: string[];
  points?: string[];
};

export type InsightPost = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  introduction: string;
  sections: InsightSection[];
  takeaway: string;
};

export const insightPosts: InsightPost[] = [
  {
    slug: 'building-trust-before-scale',
    category: 'Marketplace design',
    title: 'Building trust before scale',
    summary:
      'Why verification, transparent workflows and accountable records matter more than surface-level growth.',
    readTime: '7 min read',
    introduction:
      'A mobility marketplace can grow its listings, registrations and website traffic quickly. Those numbers matter, but they do not prove that customers can complete a dependable journey. Sustainable scale begins when both sides of the marketplace understand the rules, trust the process and know what happens when a trip does not go to plan.',
    sections: [
      {
        heading: 'Trust is an operating system',
        paragraphs: [
          'Trust is often treated as branding: reassuring words, badges and polished screens. In practice, trust is produced by the system behind the interface. It comes from identity checks, accurate vehicle records, clear pricing, traceable communication and consistent decisions.',
          'Each step must create useful evidence. A verification decision should have a reason. A payment should reconcile to a booking. A handover should record vehicle condition. A support request should connect to the relevant trip. Together, these records allow the platform to act fairly when customers disagree.',
        ],
      },
      {
        heading: 'Design for both sides of the marketplace',
        paragraphs: [
          'Renters need confidence that a vehicle exists, matches its listing and will be available as agreed. Hosts need confidence that the renter has completed the required checks, payment is accounted for and the return process protects the vehicle record.',
          'A strong marketplace does not hide one side’s risk to make the other side’s experience feel easier. It explains responsibilities early and designs balanced safeguards.',
        ],
        points: [
          'Role-appropriate identity and document checks',
          'Full-price visibility before commitment',
          'Booking-linked messages and notifications',
          'Time-stamped pickup and return evidence',
          'Clear escalation and review paths',
        ],
      },
      {
        heading: 'Scale what is repeatable',
        paragraphs: [
          'Expanding into new cities before the core journey is reliable spreads inconsistency. A better approach is to measure completed journeys, response times, cancellations, support causes and repeat usage. These signals reveal whether the operating model is ready to travel.',
          'For RideShare SA, responsible growth means improving marketplace density and service quality city by city. The goal is not merely to appear large. It is to make each additional journey more predictable than the last.',
        ],
      },
    ],
    takeaway:
      'Trust compounds when every important action leaves a clear record and every participant can understand what happens next.',
  },
  {
    slug: 'opportunity-in-underused-vehicles',
    category: 'Local mobility',
    title: 'The opportunity in underused vehicles',
    summary:
      'How better access and responsible hosting can help existing assets serve more local journeys.',
    readTime: '6 min read',
    introduction:
      'Vehicles are expensive assets. Purchase costs, finance, licensing, maintenance, security and depreciation continue whether a vehicle moves or remains parked. At the same time, many people and businesses need temporary access to transport without taking on permanent ownership. A well-run local rental marketplace can connect those two realities.',
    sections: [
      {
        heading: 'Access and ownership can complement each other',
        paragraphs: [
          'The opportunity is not simply to put every idle vehicle online. Supply must be suitable, documented, maintained and available through a reliable handover model. Demand must also be qualified for the intended trip.',
          'When those conditions meet, owners gain a structured way to make an underused asset productive, while renters gain access to vehicles closer to where they live or work.',
        ],
      },
      {
        heading: 'Responsible hosting is a real operation',
        paragraphs: [
          'Hosting requires more than uploading photographs. Accurate availability, clean vehicle presentation, fast responses, documented condition and professional handovers directly affect customer confidence.',
          'The platform should make these responsibilities visible and manageable rather than pretending hosting is effortless. Good tools help an individual host operate with the clarity customers expect from a professional rental experience.',
        ],
        points: [
          'Keep vehicle and document information current',
          'Set realistic availability and handover times',
          'Use the platform’s messaging and evidence workflows',
          'Record condition consistently at pickup and return',
          'Understand pricing, fees, claims and payout timing',
        ],
      },
      {
        heading: 'Local density creates practical value',
        paragraphs: [
          'A marketplace becomes more useful when enough suitable vehicles are available near real demand. This is why local density matters more than a broad but thin national footprint.',
          'Concentrated supply improves choice and can shorten handover distances. Concentrated demand gives hosts a clearer reason to maintain availability. Over time, the feedback loop can support better service standards and more repeat journeys.',
        ],
      },
    ],
    takeaway:
      'The strongest opportunity is not idle inventory alone; it is verified, well-operated supply matched with genuine local demand.',
  },
  {
    slug: 'professional-rental-journey',
    category: 'Operations',
    title: 'What makes a rental journey feel professional',
    summary:
      'A look at the connected steps behind discovery, payment, handover, support and return.',
    readTime: '8 min read',
    introduction:
      'Customers judge a rental platform by the whole journey, not a single screen. A beautiful listing cannot compensate for unclear payment. Fast checkout cannot repair a confused handover. Professional experience emerges when every stage is connected and each participant knows what to do next.',
    sections: [
      {
        heading: 'Before the booking',
        paragraphs: [
          'Discovery should help renters make a suitable decision. Useful listings provide accurate vehicle details, location context, availability, requirements and a transparent price. Search should narrow choice without hiding important conditions.',
          'Verification and terms acceptance belong early enough to prevent surprises, but they should explain why information is required and how it will be reviewed.',
        ],
      },
      {
        heading: 'From commitment to pickup',
        paragraphs: [
          'After checkout, the booking becomes the central record. Payment state, host response, messages, reminders and documents should all connect to it. A renter should not have to reconstruct the trip from unrelated pages or emails.',
          'The handover is a critical operational moment. Both parties need the agreed time and location, a condition checklist, evidence capture and a clear way to raise a problem before accepting the vehicle.',
        ],
        points: [
          'One authoritative booking status',
          'Visible payment and deposit state',
          'Trip-specific communication',
          'Timed reminders for required actions',
          'Structured pickup evidence and acceptance',
        ],
      },
      {
        heading: 'Support, return and financial closure',
        paragraphs: [
          'During the trip, support must distinguish general questions from urgent incidents. The booking context should travel with the support request so the customer does not repeatedly explain basic details.',
          'At return, evidence should be compared with the handover record. Deposit release, claim review and host payout should follow visible states with clear ownership. A journey is not complete when the keys change hands; it is complete when operational and financial obligations are closed.',
        ],
      },
    ],
    takeaway:
      'Professional rental UX is the visible expression of connected operations, clear ownership and reliable records.',
  },
  {
    slug: 'one-identity-distinct-products',
    category: 'Company thinking',
    title: 'One identity, distinct mobility products',
    summary:
      'Why RideShare SA is building a product family instead of disconnected customer experiences.',
    readTime: '6 min read',
    introduction:
      'Mobility needs do not begin and end with a booking. Customers may need access to a vehicle, trip support, fleet tools or a structured business arrangement. RideShare SA is designed as a parent mobility company with distinct products that share one identity and one standard of customer care.',
    sections: [
      {
        heading: 'Start with a clear foundation',
        paragraphs: [
          'RideShare Rent is the live marketplace foundation. It connects renters and hosts through discovery, verification, booking, payment, handover and return workflows.',
          'Building the foundation first creates real operational knowledge. It shows where customers need support, where professional fleet supply differs from individual hosting and where businesses require more structured service.',
        ],
      },
      {
        heading: 'Give each product a specific job',
        paragraphs: [
          'A product family should reduce confusion, not create more brands for their own sake. Each RideShare SA product has a distinct purpose while remaining recognisably part of the same company.',
        ],
        points: [
          'Rent: local vehicle access and hosting',
          'Assist: trip-linked incident and support coordination',
          'Fleet: tools and onboarding for multi-vehicle suppliers',
          'Business: structured mobility and partnership pathways',
        ],
      },
      {
        heading: 'Share trust, not complexity',
        paragraphs: [
          'Customers should benefit from a consistent identity, familiar language and connected standards. Behind the scenes, products can share verification, communication and operational infrastructure where appropriate.',
          'The principle is simple: reuse what strengthens trust, separate what serves a different customer job, and never force people to understand the company structure to complete a task.',
        ],
      },
    ],
    takeaway:
      'A connected product family works when every product has a clear purpose and every customer still recognises the company behind it.',
  },
];

export const getInsightPost = (slug: string) =>
  insightPosts.find(post => post.slug === slug);
