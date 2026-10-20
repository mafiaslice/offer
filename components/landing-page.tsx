import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { ContactForm } from "@/components/contact-form";
import { LogoMarquee } from "@/components/logo-marquee";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";
import { TextReveal } from "@/components/text-reveal";
import { dataSource, listGigs } from "@/lib/data";
import { listGigs as listDemoGigs } from "@/lib/data/demo-adapter";
import { toneGradient } from "@/lib/data/format";
import type { GigListItem } from "@/lib/data/types";

const steps: Array<{ icon: IconName; title: string; detail: string }> = [
  { icon: "plus", title: "Post the work", detail: "Name the Gig, Roles, and Slots you need." },
  { icon: "users", title: "Meet the right people", detail: "Volunteers apply for a Role that fits." },
  { icon: "circle-check", title: "Make it happen", detail: "Keep everyone in sync and check in with QR." },
];

const audiences = [
  { eyebrow: "For Volunteers", title: "Find a place to be useful.", body: "Choose a role that feels right, show up with confidence, and leave knowing you helped move something forward." },
  { eyebrow: "For Hosts", title: "Bring the right hands together.", body: "Create a clear Gig, meet people who want to help, and keep the day moving from one simple place." },
];

async function volunteerStrip(): Promise<{ gigs: GigListItem[]; sample: boolean }> {
  if (dataSource() === "postgres") {
    try {
      const { data } = await listGigs({ kind: "volunteer" });
      const gigs = data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3);
      if (gigs.length > 0) return { gigs, sample: false };
    } catch {
      // Live gigs did not load. The strip falls back to the demo catalog.
    }
    const { data } = listDemoGigs({ kind: "volunteer" });
    return { gigs: data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3), sample: true };
  }
  const { data } = await listGigs({ kind: "volunteer" });
  return { gigs: data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3), sample: false };
}

function ActionLink({ href, children, secondary = false }: { href: string; children: string; secondary?: boolean }) {
  return <Link href={href} className={`landing-action ${secondary ? "landing-action--secondary" : ""}`}>{children}<span aria-hidden="true">↗</span></Link>;
}

export async function LandingPage() {
  const { gigs, sample } = await volunteerStrip();

  return (
    <div className="landing-page">
      <div className="landing-page__glow landing-page__glow--one" aria-hidden="true" />
      <div className="landing-page__glow landing-page__glow--two" aria-hidden="true" />
      <div className="landing-page__container">
        <MarketingHeader />
        <main>
          <section className="landing-hero" aria-labelledby="hero-heading">
            <div className="landing-hero__copy">
              <p className="eyebrow">A marketplace for useful hands</p>
              <TextReveal as="h1" id="hero-heading" text="Find the right hands for the work that matters." delay={0.08} />
              <p className="landing-hero__lede">Offer brings Hosts and Volunteers together for the events, projects, and moments that need a little more help.</p>
              <div className="landing-hero__actions"><ActionLink href="/discover">Find a gig</ActionLink><ActionLink href="/post" secondary>Post a Gig</ActionLink></div>
              <p className="landing-hero__note"><span className="landing-hero__pulse" aria-hidden="true" />Volunteer first. Paid when you need it.</p>
            </div>
            <div className="landing-hero__visual" aria-label="Offer connects a Host with Volunteers">
              <div className="hero-orbit hero-orbit--one" aria-hidden="true" /><div className="hero-orbit hero-orbit--two" aria-hidden="true" />
              <div className="hero-card hero-card--main"><div className="hero-card__top"><span className="hero-card__tag">Volunteer Gig</span><span className="hero-card__status">Open</span></div><p className="hero-card__title">Help bring the next gathering to life</p><p className="hero-card__meta"><Icon name="map-pin" className="size-4" />Lagos · 12 spots</p><div className="hero-card__avatars" aria-label="Four people have joined"><span>AS</span><span>JO</span><span>MK</span><span>+9</span></div></div>
              <div className="hero-card hero-card--float"><span className="hero-card__float-icon"><Icon name="circle-check" className="size-5" /></span><span><strong>3 roles filled</strong><small>People are showing up</small></span></div>
            </div>
          </section>

          <LogoMarquee />

          <section className="story-section" id="how-it-works" aria-labelledby="how-heading"><div className="section-heading"><p className="eyebrow">Simple by design</p><h2 id="how-heading">Good work starts with a clear ask.</h2><p>From the first post to the last check-in, Offer gives everyone the same simple rhythm.</p></div><div className="step-grid">{steps.map((step, index) => <article className="step-card" key={step.title}><span className="step-card__number">0{index + 1}</span><span className="step-card__icon"><Icon name={step.icon} className="size-5" /></span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div></section>

          <section className="audience-grid" aria-label="Offer for Hosts and Volunteers">{audiences.map((audience, index) => <article className={`audience-card audience-card--${index + 1}`} key={audience.title}><p className="eyebrow">{audience.eyebrow}</p><h2>{audience.title}</h2><p>{audience.body}</p><Link href={index === 0 ? "/discover" : "/post"}>{index === 0 ? "Explore volunteer gigs" : "Create a Gig"}<span aria-hidden="true">↗</span></Link></article>)}</section>

          <section className="gigs-section" aria-labelledby="gigs-heading"><div className="section-heading section-heading--row"><div><p className="eyebrow">Open now</p><h2 id="gigs-heading">Volunteer Gigs</h2><p>{sample ? "A few examples to show you what’s possible." : "Find your next useful thing to do."}</p></div><ActionLink href="/discover" secondary>See all gigs</ActionLink></div>{gigs.length > 0 ? <div className="gig-preview-grid">{gigs.map((gig) => <Link key={gig.slug} href={`/gigs/${gig.slug}`} className="gig-preview-card"><span className={`gig-preview-card__image bg-linear-to-br ${toneGradient(gig.imageTone)}`} /><span className="gig-preview-card__body"><span className="gig-preview-card__kind">Volunteer</span><strong>{gig.title}</strong><span className="gig-preview-card__meta"><Icon name="map-pin" className="size-4" />{gig.locationLabel}</span><span className="gig-preview-card__meta"><Icon name="clock" className="size-4" />{gig.dateLabel}</span><span className="gig-preview-card__spots">{gig.spotsLabel}</span></span></Link>)}</div> : <div className="empty-preview">No volunteer Gigs are open yet. <Link href="/post">Post the first one ↗</Link></div>}</section>

          <section className="split-cta" aria-labelledby="cta-heading"><div><p className="eyebrow">Make room for more</p><h2 id="cta-heading">A little help can change the whole day.</h2><p>Whether you’re gathering a crew or looking for a way to contribute, there’s a place for you on Offer.</p></div><div className="split-cta__panel"><span className="split-cta__icon"><Icon name="arrow-up-right" className="size-6" /></span><strong>Ready when you are.</strong><span>Start with a Gig or find one already in motion.</span><div><ActionLink href="/discover">Get started</ActionLink></div></div></section>

          <section className="contact-section" aria-labelledby="contact-heading"><div className="contact-section__copy"><p className="eyebrow">Let’s talk</p><h2 id="contact-heading">Have a question or an idea?</h2><p>Tell us what you’re building, organising, or trying to make easier. We’d love to hear it.</p></div><ContactForm /></section>
        </main>
        <MarketingFooter />
      </div>
    </div>
  );
}
