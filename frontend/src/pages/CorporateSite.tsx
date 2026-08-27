import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getInsightPost, insightPosts } from '../content/insights';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CarFront,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Handshake,
  Headphones,
  KeyRound,
  LifeBuoy,
  MapPin,
  Menu,
  MessageCircle,
  Newspaper,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react';

type Page =
  | 'home'
  | 'products'
  | 'business'
  | 'safety'
  | 'about'
  | 'contact'
  | 'careers'
  | 'investors'
  | 'insights'
  | 'article';
const marketplace = 'https://www.ridesharesaplatform.co.za';
const products = [
  {
    name: 'RideShare Rent',
    label: 'Live now',
    icon: CarFront,
    tone: 'green',
    summary:
      'A local vehicle-rental marketplace connecting verified renters with independent hosts.',
    points: [
      'Search vehicles by city and dates',
      'List and manage your own vehicle',
      'Booking, payment and trip workflows',
    ],
    href: `${marketplace}/listings`,
    action: 'Explore vehicles',
  },
  {
    name: 'RideShare Assist',
    label: 'Platform service',
    icon: LifeBuoy,
    tone: 'navy',
    summary:
      'A single place for active customers to report incidents and coordinate trip support.',
    points: [
      'Incident reporting',
      'Trip-linked support records',
      'Clear escalation journeys',
    ],
    href: `${marketplace}/assist`,
    action: 'Open Assist',
  },
  {
    name: 'RideShare Fleet',
    label: 'Partner programme',
    icon: BarChart3,
    tone: 'gold',
    summary:
      'Structured onboarding and marketplace tools for owners operating multiple vehicles.',
    points: [
      'Fleet onboarding',
      'Vehicle and booking visibility',
      'Commercial partnership support',
    ],
    href: '/business#fleet',
    action: 'Discuss your fleet',
  },
  {
    name: 'RideShare Business',
    label: 'Enquiries open',
    icon: Building2,
    tone: 'slate',
    summary:
      'Mobility solutions for companies, travel partners and replacement-vehicle programmes.',
    points: [
      'Corporate rental enquiries',
      'Replacement-vehicle partnerships',
      'Account-based service design',
    ],
    href: '/business',
    action: 'Explore business solutions',
  },
];

export default function CorporateSite({ page }: { page: Page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    const article =
      page === 'article'
        ? getInsightPost(location.pathname.split('/').pop() ?? '')
        : undefined;
    document.title = article
      ? `${article.title} | RideShare SA Insights`
      : page === 'home'
        ? 'RideShare SA | Local mobility, built for South Africa'
        : `${titleFor(page)} | RideShare SA`;
    const target = location.hash ? document.querySelector(location.hash) : null;
    window.requestAnimationFrame(() => {
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [location.pathname, location.hash, page]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const close = (event: KeyboardEvent) =>
      event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', close);
    };
  }, [menuOpen]);
  return (
    <div className="corporate-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header page={page} open={menuOpen} setOpen={setMenuOpen} />
      <main id="main">
        {page === 'home' && <HomePage />}
        {page === 'products' && <ProductsPage />}
        {page === 'business' && <BusinessPage />}
        {page === 'safety' && <SafetyPage />}
        {page === 'about' && <AboutPage />}
        {page === 'contact' && <ContactPage />}
        {page === 'careers' && <CareersPage />}
        {page === 'investors' && <InvestorsPage />}
        {page === 'insights' && <InsightsPage />}
        {page === 'article' && (
          <InsightArticlePage slug={location.pathname.split('/').pop() ?? ''} />
        )}
      </main>
      <Footer />
    </div>
  );
}

function Header({
  page,
  open,
  setOpen,
}: {
  page: Page;
  open: boolean;
  setOpen: (x: boolean) => void;
}) {
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" to="/" aria-label="RideShare SA home">
          <BrandMark />
          <span>
            <strong>RideShare SA</strong>
            <small>Mobility company</small>
          </span>
        </Link>
        <nav
          id="main-navigation"
          className={open ? 'main-nav open' : 'main-nav'}
          aria-label="Main navigation"
        >
          <Link
            aria-current={page === 'products' ? 'page' : undefined}
            className={page === 'products' ? 'active' : ''}
            to="/products"
          >
            Products
          </Link>
          <Link
            aria-current={page === 'about' ? 'page' : undefined}
            className={page === 'about' ? 'active' : ''}
            to="/about"
          >
            Company
          </Link>
          <Link
            aria-current={page === 'investors' ? 'page' : undefined}
            className={page === 'investors' ? 'active' : ''}
            to="/investors"
          >
            Investors
          </Link>
          <Link
            aria-current={page === 'careers' ? 'page' : undefined}
            className={page === 'careers' ? 'active' : ''}
            to="/careers"
          >
            Careers
          </Link>
          <Link
            aria-current={
              page === 'insights' || page === 'article' ? 'page' : undefined
            }
            className={
              page === 'insights' || page === 'article' ? 'active' : ''
            }
            to="/insights"
          >
            Insights
          </Link>
          <div className="mobile-nav-actions">
            <a className="button primary" href={marketplace}>
              Open RideShare <ArrowRight size={16} />
            </a>
          </div>
        </nav>
        <div className="nav-actions">
          <a className="button primary compact" href={marketplace}>
            Open RideShare <ArrowRight size={16} />
          </a>
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="main-navigation"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <Eyebrow>South African mobility, thoughtfully connected</Eyebrow>
            <h1>
              One company.
              <br />
              <em>More ways to move.</em>
            </h1>
            <p className="hero-lead">
              RideShare SA connects people, vehicle owners and businesses
              through practical mobility products—starting with a trusted local
              vehicle-rental marketplace.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={`${marketplace}/listings`}>
                Find a vehicle <ArrowRight size={18} />
              </a>
              <a
                className="button secondary"
                href={`${marketplace}/host/listings/new`}
              >
                List your vehicle
              </a>
            </div>
            <div className="trust-line">
              <BadgeCheck size={19} />
              <span>Role-based verification</span>
              <span className="dot">•</span>
              <span>Clear booking and trip workflows</span>
            </div>
          </div>
          <HeroVisual />
        </div>
        <div className="hero-band">
          <div className="page-shell band-grid">
            <span>Built for local journeys</span>
            <span>Clear marketplace workflows</span>
            <span>For people and businesses</span>
            <span>Growing city by city</span>
          </div>
        </div>
      </section>
      <section className="section page-shell">
        <SectionHeading
          kicker="Our product family"
          title="Mobility that works around real life"
          body="One RideShare SA identity, with focused products for every side of the journey. Rent is available now; our support, fleet and business services build around it."
        />
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </section>
      <RentSection />
      <section className="section page-shell">
        <SectionHeading
          kicker="Designed around your role"
          title="A clearer route from intention to outcome"
          body="Whether you need a vehicle, want to earn from one or manage mobility for a business, each journey starts in the right place."
        />
        <div className="audience-grid">
          <Audience
            icon={CarFront}
            kicker="For renters"
            title="The right vehicle, closer to home."
            body="Compare available vehicles, see the full booking price and manage the trip from one account."
            href={`${marketplace}/listings`}
            action="Browse vehicles"
          />
          <Audience
            icon={Store}
            kicker="For hosts"
            title="Put an underused vehicle to work."
            body="Create a listing, complete verification and manage requests, trips and payouts from a purpose-built workspace."
            href={`${marketplace}/host/listings/new`}
            action="Become a host"
          />
          <Audience
            icon={Building2}
            kicker="For businesses"
            title="A more flexible mobility partner."
            body="Discuss corporate rentals, fleet supply or a structured mobility partnership with our team."
            href="/business"
            action="Explore business"
          />
        </div>
      </section>
      <TrustSection />
      <FinalCta />
    </>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual" aria-label="RideShare product ecosystem">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="hero-card main-product">
        <span className="product-icon">
          <CarFront />
        </span>
        <small>AVAILABLE NOW</small>
        <strong>RideShare Rent</strong>
        <p>Rent locally. Earn from your vehicle.</p>
        <a href={`${marketplace}/listings`}>
          Open marketplace <ChevronRight size={17} />
        </a>
      </div>
      <Floating
        className="assist"
        icon={LifeBuoy}
        label="TRIP SUPPORT"
        name="Assist"
      />
      <Floating
        className="fleet"
        icon={BarChart3}
        label="FOR OWNERS"
        name="Fleet"
      />
      <Floating
        className="business"
        icon={Building2}
        label="FOR TEAMS"
        name="Business"
      />
    </div>
  );
}
function Floating({
  className,
  icon: Icon,
  label,
  name,
}: {
  className: string;
  icon: typeof LifeBuoy;
  label: string;
  name: string;
}) {
  return (
    <div className={`floating-card ${className}`}>
      <Icon />
      <span>
        <small>{label}</small>
        <strong>{name}</strong>
      </span>
    </div>
  );
}
function RentSection() {
  return (
    <section className="section split-section dark-section">
      <div className="page-shell split-grid">
        <div>
          <Eyebrow light>RideShare Rent</Eyebrow>
          <h2>A marketplace designed for both sides of the key.</h2>
          <p>
            Renters get a guided journey from search to return. Hosts get
            structured tools to publish vehicles, manage requests and follow
            payout progress.
          </p>
          <a className="button light" href={`${marketplace}/how-it-works`}>
            See how it works <ArrowRight size={18} />
          </a>
        </div>
        <div className="journey-panel">
          <Journey
            number="01"
            icon={MapPin}
            title="Discover"
            body="Search available vehicles by location, dates and trip needs."
          />
          <Journey
            number="02"
            icon={BadgeCheck}
            title="Verify"
            body="Complete the identity and marketplace checks required for your role."
          />
          <Journey
            number="03"
            icon={KeyRound}
            title="Book and hand over"
            body="Use connected payment, messaging and pickup steps."
          />
          <Journey
            number="04"
            icon={Route}
            title="Return with a record"
            body="Complete the return, evidence and deposit-release process."
          />
        </div>
      </div>
    </section>
  );
}
function ProductsPage() {
  return (
    <>
      <PageHero
        kicker="RideShare products"
        title="One mobility company. A connected product family."
        body="Each RideShare product solves a distinct part of the journey while sharing one standard for clarity, accountability and local relevance."
      />
      <section className="section page-shell">
        <div className="product-grid expanded">
          {products.map(p => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </section>
      <section className="section soft-section">
        <div className="page-shell">
          <SectionHeading
            kicker="How the family connects"
            title="From individual trips to organised mobility"
            body="Rent is the live marketplace foundation. Assist strengthens trip operations, Fleet serves vehicle suppliers, and Business creates structured demand."
          />
          <div className="flow-line">
            {products.map((p, i) => (
              <div key={p.name}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{p.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
function BusinessPage() {
  return (
    <>
      <PageHero
        kicker="RideShare Business"
        title="Local mobility partnerships built around your operation."
        body="For companies, fleet owners, travel partners and replacement-vehicle programmes that need a structured route to flexible vehicle access."
      />
      <section className="section page-shell">
        <div className="solution-grid">
          <Solution
            icon={Building2}
            title="Corporate mobility"
            body="Planned rental requirements, employee travel and account-based service discussions."
          />
          <Solution
            icon={CarFront}
            title="Replacement vehicles"
            body="Partnership design for insurers, brokers, repair networks and mobility providers."
          />
          <Solution
            icon={BarChart3}
            title="Fleet supply"
            body="Onboarding pathways for professional owners bringing multiple vehicles to the marketplace."
          />
          <Solution
            icon={Handshake}
            title="Travel partnerships"
            body="Referral and mobility opportunities for accommodation, tourism and travel businesses."
          />
        </div>
      </section>
      <section className="section dark-section" id="fleet">
        <div className="page-shell split-grid">
          <div>
            <Eyebrow light>Fleet partner pathway</Eyebrow>
            <h2>Bring supply. Build local availability.</h2>
            <p>
              We work with fleet owners who value accurate listings, reliable
              operations and clear customer standards.
            </p>
          </div>
          <div className="criteria-card">
            <h3>A useful first conversation includes</h3>
            {[
              'Operating city and service radius',
              'Number and type of vehicles',
              'Current licensing and documentation',
              'Availability and handover model',
              'Primary business contact',
            ].map(x => (
              <div key={x}>
                <Check size={18} />
                {x}
              </div>
            ))}
            <Link className="button light" to="/contact">
              Start a partnership enquiry
            </Link>
          </div>
        </div>
      </section>
      <FinalCta business />
    </>
  );
}
function SafetyPage() {
  return (
    <>
      <PageHero
        kicker="Trust and safety"
        title="Clear checks. Better evidence. Responsible journeys."
        body="RideShare SA builds safety into marketplace workflows while being precise about what the platform does—and what requires independent partners or customer responsibility."
      />
      <section className="section page-shell">
        <div className="principle-grid">
          <Solution
            icon={BadgeCheck}
            title="Identity and documents"
            body="Users and vehicles follow role-appropriate verification and document review journeys."
          />
          <Solution
            icon={MessageCircle}
            title="Recorded communication"
            body="Trip messaging keeps important coordination connected to the booking."
          />
          <Solution
            icon={ShieldCheck}
            title="Handover evidence"
            body="Pickup, return, incident and claim workflows support accountable records."
          />
          <Solution
            icon={CircleHelp}
            title="Honest protection language"
            body="We do not describe a trip as insured unless written partner cover explicitly confirms it."
          />
        </div>
        <div className="notice">
          <ShieldCheck />
          <div>
            <strong>Important protection notice</strong>
            <p>
              RideShare SA is a marketplace, not an insurance company. Vehicle
              owners and renters must confirm appropriate cover. Any future
              trip-specific cover will identify its provider, terms, excess and
              exclusions.
            </p>
          </div>
        </div>
      </section>
      <TrustSection />
      <FinalCta />
    </>
  );
}
function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About RideShare SA"
        title="Building a more useful local mobility company."
        body="We believe access and ownership can work better together. RideShare SA creates technology and partnerships that help people move, earn and operate."
      />
      <section className="section page-shell">
        <div className="story-grid">
          {[
            [
              '01',
              'Start with a real local problem.',
              'Vehicles are expensive assets, yet many spend much of their time underused. At the same time, people and businesses need flexible access to suitable transport.',
            ],
            [
              '02',
              'Build density before breadth.',
              'RideShare SA is designed to grow responsibly—improving supply, trust and completed journeys city by city instead of making unsupported national claims.',
            ],
            [
              '03',
              'Connect an ecosystem.',
              'The long-term company connects rental, assistance, fleet services and business mobility without forcing customers through disconnected brands.',
            ],
          ].map(([n, t, b]) => (
            <div key={n}>
              <span className="section-number">{n}</span>
              <h2>{t}</h2>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section soft-section">
        <div className="page-shell">
          <SectionHeading
            kicker="Our operating principles"
            title="Standards that should survive growth"
          />
          <div className="values-grid">
            {[
              ['Clarity', 'Say exactly what a product does.'],
              [
                'Accountability',
                'Keep important decisions and records auditable.',
              ],
              [
                'Local relevance',
                'Design for South African customers and operators.',
              ],
              [
                'Useful growth',
                'Optimise for safe, completed and repeated journeys.',
              ],
            ].map(([a, b]) => (
              <div key={a}>
                <Sparkles />
                <strong>{a}</strong>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact RideShare SA"
        title="Start with the right team."
        body="Choose the route that best matches your enquiry so we can get you to the right place quickly."
      />
      <section className="section page-shell">
        <div className="contact-grid">
          <Contact
            icon={Headphones}
            title="Customer support"
            body="For an existing account, booking, payment or trip."
            href={`${marketplace}/help-center`}
            action="Visit the help centre"
          />
          <Contact
            icon={CarFront}
            title="Rent or host"
            body="Start a new rental or vehicle-listing journey."
            href={`${marketplace}/listings`}
            action="Open the marketplace"
          />
          <Contact
            icon={Handshake}
            title="Business partnerships"
            body="For corporate, fleet, insurer, travel and commercial opportunities."
            href="mailto:hello@ridesharesaplatform.co.za?subject=RideShare%20SA%20partnership%20enquiry"
            action="Email partnerships"
          />
          <Contact
            icon={TrendingUp}
            title="Investor enquiries"
            body="For investors and strategic partners interested in RideShare SA's growth journey."
            href="mailto:hello@ridesharesaplatform.co.za?subject=RideShare%20SA%20investment%20enquiry"
            action="Contact investor relations"
          />
        </div>
        <div className="response-panel">
          <Clock3 />
          <div>
            <strong>Include useful context</strong>
            <p>
              Share your company, city, fleet or mobility requirement, preferred
              timing and contact details. Never email passwords, card numbers or
              identity documents.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function CareersPage() {
  return (
    <>
      <PageHero
        kicker="Careers at RideShare SA"
        title="Build mobility that works for real people."
        body="We are assembling a practical, accountable team around product, operations, trust and marketplace growth in South Africa."
      />
      <section className="section page-shell">
        <div className="careers-intro">
          <div>
            <Eyebrow>How we work</Eyebrow>
            <h2>Small teams. Clear ownership. Useful outcomes.</h2>
            <p>
              RideShare SA values people who can turn complex marketplace
              problems into simple customer experiences. We care about sound
              judgement, honest communication and work that holds up in the real
              world.
            </p>
          </div>
          <div className="values-grid compact-values">
            {[
              ['Customer clarity', 'Make the next step obvious.'],
              ['Operational rigour', 'Design for the full workflow.'],
              ['Local context', 'Build for South African realities.'],
              ['Responsible pace', 'Grow without skipping trust.'],
            ].map(([a, b]) => (
              <div key={a}>
                <Sparkles />
                <strong>{a}</strong>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft-section">
        <div className="page-shell">
          <SectionHeading
            kicker="Open roles"
            title="Current opportunities"
            body="We publish roles here when they are approved and ready for applications."
          />
          <div className="empty-opportunity">
            <BriefcaseBusiness />
            <div>
              <span>NO OPEN POSITIONS AT PRESENT</span>
              <h3>Nothing listed today. The journey is still growing.</h3>
              <p>
                We do not collect CVs through unsecured forms. Check this page
                for verified vacancies and application instructions.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FinalCta business />
    </>
  );
}

function InvestorsPage() {
  return (
    <>
      <PageHero
        kicker="Investment opportunity"
        title="Invest in the infrastructure behind local mobility."
        body="RideShare SA is seeking aligned investors and strategic partners to help grow a connected mobility ecosystem around vehicle access, marketplace trust and disciplined local expansion."
      />
      <section className="section page-shell">
        <SectionHeading
          kicker="Why RideShare SA"
          title="A marketplace foundation with multiple paths to value"
          body="Our immediate focus is making the rental marketplace dependable and repeatable. The wider company is designed to build additional services around the same customers, vehicles and operating infrastructure."
        />
        <div className="investment-grid">
          <article>
            <span>01</span>
            <TrendingUp />
            <h3>Marketplace foundation</h3>
            <p>
              RideShare Rent creates the core connection between verified demand
              and independently supplied vehicles.
            </p>
          </article>
          <article>
            <span>02</span>
            <BarChart3 />
            <h3>Operational infrastructure</h3>
            <p>
              Verification, messaging, payments, trip evidence and support
              provide a base for disciplined scale.
            </p>
          </article>
          <article>
            <span>03</span>
            <Building2 />
            <h3>Expansion pathways</h3>
            <p>
              Fleet, business mobility and assistance services are designed to
              grow around proven customer journeys.
            </p>
          </article>
        </div>
        <div className="capital-panel">
          <div>
            <small>INTENDED USE OF CAPITAL</small>
            <h2>Funding the systems that make responsible growth possible.</h2>
          </div>
          <div className="capital-list">
            {[
              [
                'Product and engineering',
                'Strengthen the marketplace, mobile experience and operational tooling.',
              ],
              [
                'Trust and operations',
                'Improve verification, customer support, trip evidence and incident workflows.',
              ],
              [
                'Marketplace growth',
                'Build quality vehicle supply and qualified renter demand city by city.',
              ],
              [
                'Strategic partnerships',
                'Develop fleet, business mobility and ecosystem distribution channels.',
              ],
            ].map(([title, body], index) => (
              <div key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="investor-note">
          <ShieldCheck />
          <div>
            <strong>Important investor notice</strong>
            <p>
              RideShare SA welcomes investment conversations, but this website
              is not a formal offer to sell securities or a promise of returns.
              Any opportunity will be assessed directly and documented through
              the appropriate legal and financial process.
            </p>
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="page-shell investor-contact">
          <div>
            <Eyebrow light>Investor and strategic enquiries</Eyebrow>
            <h2>Interested in building the next stage with us?</h2>
            <p>
              Tell us who you represent, your investment or partnership focus,
              geography and preferred contact details.
            </p>
          </div>
          <a
            className="button light"
            href="mailto:hello@ridesharesaplatform.co.za?subject=RideShare%20SA%20investment%20enquiry"
          >
            Start an investor conversation <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}

function InsightsPage() {
  const featured = insightPosts[0];
  return (
    <>
      <PageHero
        kicker="RideShare SA insights"
        title="Ideas, company updates and practical mobility thinking."
        body="Read how we think about marketplace trust, local vehicle access, product design and responsible growth."
      />
      <section className="section page-shell">
        <Link className="insights-lead" to={`/insights/${featured.slug}`}>
          <div>
            <span>FEATURED PERSPECTIVE</span>
            <h2>{featured.title}</h2>
            <p>{featured.introduction}</p>
            <strong>
              Read the perspective <ArrowRight size={18} />
            </strong>
          </div>
          <Newspaper />
        </Link>
        <div className="insight-grid">
          {insightPosts.map(post => (
            <Link
              className="insight-card"
              key={post.slug}
              to={`/insights/${post.slug}`}
            >
              <div>
                <small>{post.category}</small>
                <span>{post.readTime}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
              <strong>
                Read article <ArrowRight size={17} />
              </strong>
            </Link>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function InsightArticlePage({ slug }: { slug: string }) {
  const post = getInsightPost(slug);
  if (!post)
    return (
      <>
        <PageHero
          kicker="RideShare SA insights"
          title="Article not found."
          body="The article may have moved or the address may be incorrect."
        />
        <section className="section page-shell">
          <Link className="button primary" to="/insights">
            <ArrowLeft size={18} />
            Back to Insights
          </Link>
        </section>
      </>
    );
  const related = insightPosts
    .filter(item => item.slug !== post.slug)
    .slice(0, 3);
  return (
    <>
      <article className="article-page">
        <header className="article-hero">
          <div className="article-shell">
            <Link to="/insights" className="article-back">
              <ArrowLeft size={17} />
              All insights
            </Link>
            <div className="article-meta">
              <span>{post.category}</span>
              <span>{post.readTime}</span>
              <span>RideShare SA editorial</span>
            </div>
            <h1>{post.title}</h1>
            <p>{post.summary}</p>
          </div>
        </header>
        <div className="article-shell article-body">
          <p className="article-intro">{post.introduction}</p>
          {post.sections.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && (
                <ul>
                  {section.points.map(point => (
                    <li key={point}>
                      <Check size={18} />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <aside>
            <small>THE TAKEAWAY</small>
            <p>{post.takeaway}</p>
          </aside>
        </div>
      </article>
      <section className="section soft-section">
        <div className="page-shell">
          <SectionHeading
            kicker="Continue reading"
            title="More from RideShare SA"
          />
          <div className="related-insights">
            {related.map(item => (
              <Link key={item.slug} to={`/insights/${item.slug}`}>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <span>
                  {item.readTime}
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard(p: (typeof products)[number]) {
  const I = p.icon;
  const content = (
    <>
      <div className="card-top">
        <span className="large-icon">
          <I />
        </span>
        <span className="status-label">{p.label}</span>
      </div>
      <h3>{p.name}</h3>
      <p>{p.summary}</p>
      <ul>
        {p.points.map(x => (
          <li key={x}>
            <Check size={16} />
            {x}
          </li>
        ))}
      </ul>
      <span className="card-link">
        {p.action}
        <ArrowRight size={17} />
      </span>
    </>
  );
  return p.href.startsWith('/') ? (
    <Link className={`product-card ${p.tone}`} to={p.href}>
      {content}
    </Link>
  ) : (
    <a className={`product-card ${p.tone}`} href={p.href}>
      {content}
    </a>
  );
}
function Journey({
  number,
  icon: I,
  title,
  body,
}: {
  number: string;
  icon: typeof MapPin;
  title: string;
  body: string;
}) {
  return (
    <div className="journey-row">
      <span>{number}</span>
      <I />
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}
function Audience({
  icon: I,
  kicker,
  title,
  body,
  href,
  action,
}: {
  icon: typeof CarFront;
  kicker: string;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  const c = (
    <>
      <I />
      <small>{kicker}</small>
      <h3>{title}</h3>
      <p>{body}</p>
      <span>
        {action}
        <ArrowRight size={17} />
      </span>
    </>
  );
  return href.startsWith('/') ? (
    <Link className="audience-card" to={href}>
      {c}
    </Link>
  ) : (
    <a className="audience-card" href={href}>
      {c}
    </a>
  );
}
function Solution({
  icon: I,
  title,
  body,
}: {
  icon: typeof Building2;
  title: string;
  body: string;
}) {
  return (
    <article className="solution-card">
      <I />
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
function Contact({
  icon: I,
  title,
  body,
  href,
  action,
}: {
  icon: typeof Headphones;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <article className="contact-card">
      <I />
      <h3>{title}</h3>
      <p>{body}</p>
      <a href={href}>
        {action}
        <ArrowRight size={17} />
      </a>
    </article>
  );
}
function Eyebrow({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) {
  return (
    <div className={light ? 'eyebrow light' : 'eyebrow'}>
      <span />
      {children}
    </div>
  );
}
function SectionHeading({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="section-heading">
      <small>{kicker}</small>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}
function PageHero({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <section className="page-hero">
      <div className="page-shell">
        <Eyebrow light>{kicker}</Eyebrow>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </section>
  );
}
function TrustSection() {
  const rows: [
    [typeof BadgeCheck, string, string],
    [typeof WalletCards, string, string],
    [typeof MessageCircle, string, string],
    [typeof ShieldCheck, string, string],
  ] = [
    [
      BadgeCheck,
      'Verification',
      'People, vehicles and documents follow defined checks.',
    ],
    [
      WalletCards,
      'Transparent payments',
      'Booking totals, deposits and payout status stay visible.',
    ],
    [
      MessageCircle,
      'Connected communication',
      'Messages and notifications link back to real workflows.',
    ],
    [
      ShieldCheck,
      'Evidence-led operations',
      'Handover, returns, incidents and claims create records.',
    ],
  ];
  return (
    <section className="section soft-section">
      <div className="page-shell trust-layout">
        <div>
          <Eyebrow>Built around trust</Eyebrow>
          <h2>Professional workflows—not vague promises.</h2>
          <p>
            Clear terms, role-based verification, documented trip steps and
            visible financial status help customers understand what happens
            next.
          </p>
        </div>
        <div className="trust-grid">
          {rows.map(([I, t, b]) => (
            <div key={t}>
              <I />
              <strong>{t}</strong>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function FinalCta({ business = false }: { business?: boolean }) {
  return (
    <section className="final-cta">
      <div className="page-shell">
        <div>
          <small>{business ? 'PARTNERSHIPS' : 'RIDESHARE RENT'}</small>
          <h2>
            {business
              ? 'Let’s design the right mobility pathway.'
              : 'Your next journey can start here.'}
          </h2>
          <p>
            {business
              ? 'Tell us about your operation, fleet or customer need.'
              : 'Browse local vehicles or put your vehicle to work on the marketplace.'}
          </p>
        </div>
        <div>
          {business ? (
            <Link className="button light" to="/contact">
              Contact RideShare SA <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <a className="button light" href={`${marketplace}/listings`}>
                Find a vehicle <ArrowRight size={18} />
              </a>
              <a
                className="button outline-light"
                href={`${marketplace}/host/listings/new`}
              >
                Become a host
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer>
      <div className="page-shell footer-grid">
        <div className="footer-brand">
          <Link className="brand light-brand" to="/">
            <BrandMark />
            <span>
              <strong>RideShare SA</strong>
              <small>Mobility company</small>
            </span>
          </Link>
          <p>
            Local mobility products for people, vehicle owners and businesses.
          </p>
        </div>
        <div>
          <strong>Products</strong>
          <Link to="/products">Product family</Link>
          <a href={`${marketplace}/listings`}>RideShare Rent</a>
          <a href={`${marketplace}/assist`}>RideShare Assist</a>
        </div>
        <div>
          <strong>Company</strong>
          <Link to="/about">About</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/investors">Investors</Link>
          <Link to="/insights">Insights</Link>
        </div>
        <div>
          <strong>Information</strong>
          <Link to="/business">Business</Link>
          <Link to="/safety">Safety</Link>
          <Link to="/contact">Contact</Link>
          <a href={`${marketplace}/how-it-works`}>How it works</a>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <span>
          © {new Date().getFullYear()} RideShare SA. All rights reserved.
        </span>
        <span>Built for South Africa</span>
      </div>
    </footer>
  );
}
function BrandMark() {
  return <img className="brand-mark" src="/rideshare-logo.png" alt="" />;
}
function titleFor(page: Page) {
  return {
    products: 'Products',
    business: 'Business',
    safety: 'Trust & Safety',
    about: 'About',
    contact: 'Contact',
    careers: 'Careers',
    investors: 'Investor information',
    insights: 'Insights',
    article: 'Insight',
    home: 'Home',
  }[page];
}
