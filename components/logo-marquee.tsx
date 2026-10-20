const marks = ["Offer community", "Trusted hands", "Volunteer first", "Event crews", "Local projects"];

export function LogoMarquee() {
  return (
    <section className="logo-marquee" aria-label="What Offer brings together">
      <p className="eyebrow">One place for useful hands</p>
      <div className="logo-marquee__viewport">
        <div className="logo-marquee__track">
          {[...marks, ...marks].map((mark, index) => (
            <span className="logo-marquee__mark" key={`${mark}-${index}`}>
              <span className="logo-marquee__dot" aria-hidden="true" />{mark}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
