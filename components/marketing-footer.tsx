/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-footer__brand">
        <Link href="/" className="offer-wordmark" aria-label="Offer home">
          <span className="offer-mark" aria-hidden="true">O</span><span>offer</span>
        </Link>
        <p>Volunteer first. Paid when you need it.</p>
      </div>
      <div className="marketing-footer__columns">
        <div><p className="marketing-footer__label">Discover</p><Link href="/discover">Find a gig</Link><Link href="/post">Post a Gig</Link></div>
        <div><p className="marketing-footer__label">Your Offer</p><Link href="/my-gigs">My Gigs</Link><Link href="/messages">Messages</Link><Link href="/profile">Profile</Link></div>
      </div>
      <div className="marketing-footer__bottom"><span>© {new Date().getFullYear()} Offer</span><span>Built for useful work.</span></div>
    </footer>
  );
}
