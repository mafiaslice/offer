export type DemoGig = {
  slug: string;
  title: string;
  hostName: string;
  kindLabel: "Volunteer" | "Paid gig";
  locationLabel: string;
  dateLabel: string;
  imageTone: "sunset" | "mint" | "night";
  category: "Events" | "Community" | "Hospitality" | "Projects";
};

/** Temporary display repository. Replace its implementation with the selected database adapter. */
export const demoGigs: DemoGig[] = [
  { slug: "hangout-with-slice", title: "Hangout with Slice", hostName: "Slice", kindLabel: "Volunteer", locationLabel: "Ikoyi", dateLabel: "Sep 25 · 10 AM", imageTone: "sunset", category: "Events" },
  { slug: "community-food-drive", title: "Community food drive", hostName: "Neighbourhood Hub", kindLabel: "Volunteer", locationLabel: "Yaba", dateLabel: "Oct 02 · 8 AM", imageTone: "mint", category: "Community" },
  { slug: "festival-crew", title: "Festival crew wanted", hostName: "Live Works", kindLabel: "Paid gig", locationLabel: "Victoria Island", dateLabel: "Oct 12 · 4 PM", imageTone: "night", category: "Events" },
];

export function getDemoGig(slug: string) {
  return demoGigs.find((gig) => gig.slug === slug);
}
