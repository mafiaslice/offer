import type { ChatMessage, GigDetail, HostApplicant, InboxThread, MyGigCard, StartableThread } from "@/lib/data/types";

export const demoGigDetails: GigDetail[] = [
  {
    id: "demo-hangout-with-slice",
    slug: "hangout-with-slice",
    title: "Hangout with Slice",
    hostName: "Slice",
    hostInitials: "MS",
    kindLabel: "Volunteer",
    locationLabel: "Ikoyi",
    dateLabel: "Sep 25 · 10 AM",
    longDateLabel: "Friday, September 25 · 10:00 AM",
    imageTone: "sunset",
    category: "Events",
    spotsLabel: "5 spots left",
    summary: "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.",
    about: "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.",
    roles: ["Welcome guests and help people find their way", "Support setup, icebreakers, and light coordination"],
    incentive: "Transport support is available for every volunteer.",
    instructions: "Come dressed in black or white, wear comfortable shoes, and arrive 30 minutes early for briefing.",
    verified: true,
    startsAt: "2026-09-25T09:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-community-food-drive",
    slug: "community-food-drive",
    title: "Community food drive",
    hostName: "Neighbourhood Hub",
    hostInitials: "NH",
    kindLabel: "Volunteer",
    locationLabel: "Yaba",
    dateLabel: "Oct 02 · 8 AM",
    longDateLabel: "Saturday, October 2 · 8:00 AM",
    imageTone: "mint",
    category: "Community",
    spotsLabel: "12 spots left",
    summary: "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.",
    about: "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.",
    roles: ["Pack food parcels and label deliveries", "Welcome families and keep the distribution line moving"],
    incentive: "Breakfast and transport support are provided.",
    instructions: "Wear a comfortable top, closed shoes, and be ready to work on your feet.",
    verified: true,
    startsAt: "2026-10-02T07:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-festival-crew",
    slug: "festival-crew",
    title: "Festival crew wanted",
    hostName: "Live Works",
    hostInitials: "LW",
    kindLabel: "Paid gig",
    locationLabel: "Victoria Island",
    dateLabel: "Oct 12 · 4 PM",
    longDateLabel: "Monday, October 12 · 4:00 PM",
    imageTone: "night",
    category: "Events",
    spotsLabel: "8 spots left",
    summary: "Join the on-ground crew helping a live festival run smoothly from doors open through close.",
    about: "Join the on-ground crew helping a live festival run smoothly from doors open through close.",
    roles: ["Guest check-in and wristband support", "Wayfinding and light event operations"],
    incentive: "₦35,000 stipend with dinner included.",
    instructions: "Black trousers, plain black top, and comfortable closed shoes required.",
    verified: true,
    startsAt: "2026-10-12T15:00:00.000Z",
    status: "open",
  },
];

export const demoMyGigs: MyGigCard[] = [
  { ...demoGigDetails[0], mode: "Joined", status: "Upcoming", locationLabel: "Ikoyi" },
  { ...demoGigDetails[2], mode: "Joined", status: "Upcoming", locationLabel: "Victoria Island" },
  {
    ...demoGigDetails[1],
    mode: "Joined",
    status: "Completed",
    dateLabel: "Aug 02 · 8 AM",
    locationLabel: "Yaba",
  },
  {
    ...demoGigDetails[0],
    id: "demo-open-mic-night",
    title: "Open mic night",
    dateLabel: "Nov 04 · 6 PM",
    locationLabel: "Surulere",
    imageTone: "sunset",
    mode: "Hosted",
    status: "Upcoming",
  },
];

export const demoReviewQueue: HostApplicant[] = [
  { id: "demo-tola", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", applicantUserId: "demo-user-tola", name: "Tola Adebayo", initials: "TA", role: "Guest welcome & check-in", trust: "New to Offer", tone: "from-[#ffcf91] to-[#8e52ff]", status: "pending" },
  { id: "demo-nia", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", applicantUserId: "demo-user-nia", name: "Nia Okafor", initials: "NO", role: "Setup & coordination", trust: "4.8 · 6 gigs", tone: "from-[#bcebdc] to-[#49d7b8]", status: "pending" },
  { id: "demo-david", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", applicantUserId: "demo-user-david", name: "David Eze", initials: "DE", role: "Guest welcome & check-in", trust: "5.0 · 3 gigs", tone: "from-[#29244b] to-[#ff4da3]", status: "pending" },
];

export const demoInboxThreads: InboxThread[] = [
  { id: "demo-thread-slice", gigId: "demo-hangout-with-slice", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", counterpartName: "Slice", counterpartInitials: "MS", counterpartUserId: "demo-host-slice", preview: "Amazing — I’ll send the briefing here.", lastMessageAt: "2026-09-09T15:45:00.000Z", timeLabel: "3:45 PM", unread: 2, online: true, tone: "from-[#f5cc00] to-[#ff4da3]", role: "participant" },
  { id: "demo-thread-live-works", gigId: "demo-festival-crew", gigSlug: "festival-crew", gigTitle: "Festival crew wanted", counterpartName: "Live Works", counterpartInitials: "LW", counterpartUserId: "demo-host-live-works", preview: "Can you confirm you’ll be there by 4?", lastMessageAt: "2026-09-09T13:20:00.000Z", timeLabel: "1:20 PM", unread: 1, online: true, tone: "from-[#29244b] to-[#ff4da3]", role: "participant" },
  { id: "demo-thread-neighbourhood", gigId: "demo-community-food-drive", gigSlug: "community-food-drive", gigTitle: "Community food drive", counterpartName: "Neighbourhood Hub", counterpartInitials: "NH", counterpartUserId: "demo-host-neighbourhood", preview: "Thank you for showing up yesterday!", lastMessageAt: "2026-09-08T18:00:00.000Z", timeLabel: "Yesterday", unread: 0, online: false, tone: "from-[#bcebdc] to-[#7b8cff]", role: "participant" },
  { id: "demo-thread-tola", gigId: "demo-hangout-with-slice", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", counterpartName: "Tola Adebayo", counterpartInitials: "TA", counterpartUserId: "demo-user-tola", preview: "I can help with guest welcome.", lastMessageAt: "2026-09-07T11:00:00.000Z", timeLabel: "Mon", unread: 0, online: false, tone: "from-[#ffcf91] to-[#8e52ff]", role: "host" },
  { id: "demo-thread-support", gigId: "demo-support", gigSlug: "your-offer-account", gigTitle: "Your Offer account", counterpartName: "Offer Support", counterpartInitials: "O", counterpartUserId: "demo-support", preview: "Welcome to Offer. Here’s how it works.", lastMessageAt: "2026-09-06T12:00:00.000Z", timeLabel: "Sun", unread: 0, online: true, tone: "from-[#8e52ff] to-[#49d7b8]", role: "participant" },
];

export const demoStartable: StartableThread[] = demoReviewQueue
  .filter((applicant) => applicant.id !== "demo-tola")
  .map((applicant) => ({
    applicationId: applicant.id,
    gigSlug: applicant.gigSlug,
    gigTitle: applicant.gigTitle,
    counterpartName: applicant.name,
    counterpartInitials: applicant.initials,
    role: applicant.role,
    tone: applicant.tone,
  }));

export const demoChatMessages: Record<string, ChatMessage[]> = {
  "demo-thread-slice": [
    { id: "demo-msg-slice-1", threadId: "demo-thread-slice", senderUserId: "demo-user", body: "Hi — I’d love to help with guest welcome.", createdAt: "2026-09-09T15:12:00.000Z", mine: true },
    { id: "demo-msg-slice-2", threadId: "demo-thread-slice", senderUserId: "demo-host-slice", body: "Amazing — I’ll send the briefing here.", createdAt: "2026-09-09T15:45:00.000Z", mine: false },
  ],
  "demo-thread-live-works": [
    { id: "demo-msg-lw-1", threadId: "demo-thread-live-works", senderUserId: "demo-host-live-works", body: "Can you confirm you’ll be there by 4?", createdAt: "2026-09-09T13:20:00.000Z", mine: false },
  ],
  "demo-thread-neighbourhood": [
    { id: "demo-msg-nh-1", threadId: "demo-thread-neighbourhood", senderUserId: "demo-host-neighbourhood", body: "Thank you for showing up yesterday!", createdAt: "2026-09-08T18:00:00.000Z", mine: false },
    { id: "demo-msg-nh-2", threadId: "demo-thread-neighbourhood", senderUserId: "demo-user", body: "Glad I could help pack parcels.", createdAt: "2026-09-08T18:12:00.000Z", mine: true },
  ],
  "demo-thread-tola": [
    { id: "demo-msg-tola-1", threadId: "demo-thread-tola", senderUserId: "demo-user-tola", body: "I can help with guest welcome.", createdAt: "2026-09-07T11:00:00.000Z", mine: false },
  ],
  "demo-thread-support": [
    { id: "demo-msg-support-1", threadId: "demo-thread-support", senderUserId: "demo-support", body: "Welcome to Offer. Here’s how it works.", createdAt: "2026-09-06T12:00:00.000Z", mine: false },
  ],
};

export function toListItem(gig: GigDetail) {
  return {
    id: gig.id,
    slug: gig.slug,
    title: gig.title,
    hostName: gig.hostName,
    kindLabel: gig.kindLabel,
    locationLabel: gig.locationLabel,
    dateLabel: gig.dateLabel,
    imageTone: gig.imageTone,
    category: gig.category,
    spotsLabel: gig.spotsLabel,
  };
}
