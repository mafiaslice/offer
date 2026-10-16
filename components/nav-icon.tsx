import { Icon, type IconName } from "@/components/icon";

type NavLabel = "Discover" | "My Gigs" | "Messages" | "Profile" | "Post a Gig";

type NavIconProps = {
  label: NavLabel;
  className?: string;
  /** Active destinations use the Rune fill glyph when `public/fill` has one. */
  active?: boolean;
};

const names: Record<NavLabel, IconName> = {
  Discover: "search",
  "My Gigs": "calendar",
  Messages: "message-square",
  Profile: "circle-user",
  "Post a Gig": "plus",
};

export function NavIcon({ label, className, active = false }: NavIconProps) {
  return <Icon name={names[label]} filled={active} className={className} />;
}
