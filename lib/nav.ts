export type NavItem = {
  href: "/discover" | "/my-gigs" | "/messages" | "/profile" | "/post";
  label: "Discover" | "My Gigs" | "Messages" | "Profile" | "Post a Gig";
};

/** Bottom nav order from the product brief. */
export const navItems: readonly NavItem[] = [
  { href: "/discover", label: "Discover" },
  { href: "/my-gigs", label: "My Gigs" },
  { href: "/post", label: "Post a Gig" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
] as const;
