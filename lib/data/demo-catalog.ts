import { formatSlotLabel } from "@/lib/data/format";
import type { ChatMessage, GigDetail, GigSlotView, HostApplicant, InboxThread, MyGigCard, StartableThread } from "@/lib/data/types";

function slot(startsAt: string, endsAt: string, capacity: number, roleTitle?: string): GigSlotView {
  return {
    startsAt,
    endsAt,
    timeLabel: formatSlotLabel(startsAt, endsAt),
    capacity,
    roleTitle,
  };
}

export const demoGigDetails: GigDetail[] = [
  {
    id: "demo-hangout-with-slice",
    slug: "hangout-with-slice",
    title: "Hangout with Slice",
    hostName: "Slice",
    hostInitials: "MS",
    hostUserId: "demo-host-slice",
    kindLabel: "Volunteer",
    locationLabel: "Ikoyi",
    dateLabel: "Sep 25 · 10 AM",
    longDateLabel: "Friday, September 25 · 10:00 AM",
    imageTone: "sunset",
    category: "Events",
    spotsLabel: "5 spots left",
    summary: "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.",
    about:
      "Slice is opening the doors for an unhurried afternoon in Ikoyi. Volunteers keep the space warm: greet people by name, help them find a seat, and make sure nobody is hovering alone with a plate.\n\nThis is a volunteer gig. Come ready to talk, listen, and help the room feel like it belongs to everyone who showed up.",
    roles: ["Welcome guests and help people find their way", "Support setup, icebreakers, and light coordination"],
    roleDetails: [
      {
        title: "Welcome guests and help people find their way",
        description: "Meet people at the door, help them feel at home, and point them to food and conversation.",
        capacity: 3,
      },
      {
        title: "Support setup, icebreakers, and light coordination",
        description: "Set tables, run a simple icebreaker, and keep the afternoon moving without making it stiff.",
        capacity: 2,
      },
    ],
    slots: [slot("2026-09-25T09:00:00.000Z", "2026-09-25T14:00:00.000Z", 5)],
    incentive: "Transport support is available for every volunteer.",
    instructions: "Come dressed in black or white, wear comfortable shoes, and arrive 30 minutes early for briefing.",
    verified: false,
    startsAt: "2026-09-25T09:00:00.000Z",
    endsAt: "2026-09-25T14:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-community-food-drive",
    slug: "community-food-drive",
    title: "Community food drive",
    hostName: "Neighbourhood Hub",
    hostInitials: "NH",
    hostUserId: "demo-host-neighbourhood",
    kindLabel: "Volunteer",
    locationLabel: "Yaba",
    dateLabel: "Oct 02 · 8 AM",
    longDateLabel: "Saturday, October 2 · 8:00 AM",
    imageTone: "mint",
    category: "Community",
    spotsLabel: "12 spots left",
    summary: "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.",
    about:
      "Neighbourhood Hub runs a regular food drive for families nearby. Volunteers pack parcels in the morning, then keep the distribution line kind and clear when people arrive.\n\nNo special skills. Closed shoes, a calm voice, and a willingness to lift boxes are enough.",
    roles: ["Pack food parcels and label deliveries", "Welcome families and keep the distribution line moving"],
    roleDetails: [
      {
        title: "Pack food parcels and label deliveries",
        description: "Assemble parcels from the packing list and label them so the afternoon hand-off stays accurate.",
        capacity: 8,
      },
      {
        title: "Welcome families and keep the distribution line moving",
        description: "Greet families, check names against the list, and keep the line moving without rushing anyone.",
        capacity: 4,
      },
    ],
    slots: [
      slot("2026-10-02T07:00:00.000Z", "2026-10-02T11:00:00.000Z", 8, "Pack food parcels and label deliveries"),
      slot("2026-10-02T11:00:00.000Z", "2026-10-02T14:00:00.000Z", 4, "Welcome families and keep the distribution line moving"),
    ],
    incentive: "Breakfast and transport support are provided.",
    instructions: "Wear a comfortable top, closed shoes, and be ready to work on your feet.",
    verified: false,
    startsAt: "2026-10-02T07:00:00.000Z",
    endsAt: "2026-10-02T14:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-festival-crew",
    slug: "festival-crew",
    title: "Festival crew wanted",
    hostName: "Live Works",
    hostInitials: "LW",
    hostUserId: "demo-host-live-works",
    kindLabel: "Paid gig",
    locationLabel: "Victoria Island",
    dateLabel: "Oct 12 · 4 PM",
    longDateLabel: "Monday, October 12 · 4:00 PM",
    imageTone: "night",
    category: "Events",
    spotsLabel: "8 spots left",
    summary: "Join the on-ground crew helping a live festival run smoothly from doors open through close.",
    about:
      "Live Works needs extra hands for a one-night festival on Victoria Island. This is a paid gig: guest check-in, wristbands, and wayfinding until close.\n\nPayment is agreed with the host in the incentive note. Offer does not take or hold funds.",
    roles: ["Guest check-in and wristband support", "Wayfinding and light event operations"],
    roleDetails: [
      {
        title: "Guest check-in and wristband support",
        description: "Check tickets, fit wristbands, and keep the door line honest and friendly.",
        capacity: 5,
      },
      {
        title: "Wayfinding and light event operations",
        description: "Point people to stages, water, and exits. Help the crew close down after the last set.",
        capacity: 3,
      },
    ],
    slots: [slot("2026-10-12T15:00:00.000Z", "2026-10-12T23:00:00.000Z", 8)],
    incentive: "₦35,000 stipend with dinner included.",
    instructions: "Black trousers, plain black top, and comfortable closed shoes required.",
    verified: false,
    startsAt: "2026-10-12T15:00:00.000Z",
    endsAt: "2026-10-12T23:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-neighbourhood-kitchen",
    slug: "neighbourhood-kitchen",
    title: "Neighbourhood kitchen service",
    hostName: "Table & Co",
    hostInitials: "TC",
    hostUserId: "demo-host-table",
    kindLabel: "Volunteer",
    locationLabel: "Surulere",
    dateLabel: "Oct 18 · 11 AM",
    longDateLabel: "Sunday, October 18 · 11:00 AM",
    imageTone: "sunset",
    category: "Hospitality",
    spotsLabel: "6 spots left",
    summary: "Plate lunch, refill water, and keep a community kitchen feeling like a dining room.",
    about:
      "Table & Co opens a community kitchen on Sundays. Volunteers plate lunch, keep water on the tables, and treat every guest like they booked a seat.\n\nHospitality here is volunteer work: no till, no tips, just a room that feels looked after.",
    roles: ["Plate and serve lunch", "Keep tables and water stations ready"],
    roleDetails: [
      {
        title: "Plate and serve lunch",
        description: "Plate from the pass and walk dishes to tables with a short, kind hello.",
        capacity: 4,
      },
      {
        title: "Keep tables and water stations ready",
        description: "Clear plates, refill water, and reset tables between sittings.",
        capacity: 2,
      },
    ],
    slots: [slot("2026-10-18T10:00:00.000Z", "2026-10-18T15:00:00.000Z", 6)],
    incentive: "A staff meal is served after the last sitting.",
    instructions: "Wear a plain dark top, closed shoes, and hair tied back. Arrive at 10:30 AM for a short briefing.",
    verified: false,
    startsAt: "2026-10-18T10:00:00.000Z",
    endsAt: "2026-10-18T15:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-community-mural",
    slug: "community-mural",
    title: "Community mural day",
    hostName: "Studio Yard",
    hostInitials: "SY",
    hostUserId: "demo-host-studio",
    kindLabel: "Volunteer",
    locationLabel: "Yaba",
    dateLabel: "Nov 01 · 9 AM",
    longDateLabel: "Sunday, November 1 · 9:00 AM",
    imageTone: "night",
    category: "Projects",
    spotsLabel: "10 spots left",
    summary: "Prime a wall, pass paint, and help a neighbourhood mural go up in a single day.",
    about:
      "Studio Yard is painting a mural with neighbours on a Yaba side street. Volunteers prime, tape, and fill colour — no portfolio required.\n\nThis is a volunteer project gig. The artists lead; you keep the wall moving and the street tidy.",
    roles: ["Prime and tape the wall", "Fill colour and keep the street tidy"],
    roleDetails: [
      {
        title: "Prime and tape the wall",
        description: "Roll primer, tape edges, and keep the scaffold area clear for the lead artists.",
        capacity: 6,
      },
      {
        title: "Fill colour and keep the street tidy",
        description: "Fill marked sections, rinse brushes, and bag tape and cups so the street stays walkable.",
        capacity: 4,
      },
    ],
    slots: [slot("2026-11-01T08:00:00.000Z", "2026-11-01T16:00:00.000Z", 10)],
    incentive: "Lunch, water, and a spare set of gloves are provided.",
    instructions: "Wear clothes you can paint in and closed shoes. Sunscreen if you have it. Meet at the corner shop at 8:45 AM.",
    verified: false,
    startsAt: "2026-11-01T08:00:00.000Z",
    endsAt: "2026-11-01T16:00:00.000Z",
    status: "open",
  },
  {
    id: "demo-open-mic-night",
    slug: "open-mic-night",
    title: "Open mic night",
    hostName: "You",
    hostInitials: "YO",
    hostUserId: "demo-user",
    kindLabel: "Volunteer",
    locationLabel: "Surulere",
    dateLabel: "Nov 04 · 6 PM",
    longDateLabel: "Wednesday, November 4 · 6:00 PM",
    imageTone: "sunset",
    category: "Events",
    spotsLabel: "6 spots left",
    summary: "Host a neighbourhood open mic: greet performers, keep the door kind, and help the room stay on time.",
    about:
      "You are hosting this gig in the demo walkthrough. Volunteers greet performers, keep a simple run-of-show, and make first-timers feel like they belong on the mic.\n\nThis is a volunteer Events gig. Message applicants from My Gigs when you want a 1:1 thread.",
    roles: ["Guest welcome & check-in", "Setup & coordination"],
    roleDetails: [
      {
        title: "Guest welcome & check-in",
        description: "Take names at the door, keep the list, and point people to seats and water.",
        capacity: 3,
      },
      {
        title: "Setup & coordination",
        description: "Set mics, keep the run-of-show, and help performers on and off stage.",
        capacity: 3,
      },
    ],
    slots: [slot("2026-11-04T17:00:00.000Z", "2026-11-04T22:00:00.000Z", 6)],
    incentive: "A meal and a reserved seat for the second half.",
    instructions: "Black or white top, comfortable shoes. Arrive at 5:15 PM to set chairs and check the PA.",
    verified: false,
    startsAt: "2026-11-04T17:00:00.000Z",
    endsAt: "2026-11-04T22:00:00.000Z",
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
    ...(demoGigDetails.find((gig) => gig.slug === "open-mic-night") ?? demoGigDetails[0]),
    mode: "Hosted",
    status: "Upcoming",
  },
];

export const demoReviewQueue: HostApplicant[] = [
  { id: "demo-tola", gigSlug: "open-mic-night", gigTitle: "Open mic night", applicantUserId: "demo-user-tola", name: "Tola Adebayo", initials: "TA", role: "Guest welcome & check-in", trust: "New to Offer", tone: "from-[#ffcf91] to-[#8e52ff]", status: "pending" },
  { id: "demo-nia", gigSlug: "open-mic-night", gigTitle: "Open mic night", applicantUserId: "demo-user-nia", name: "Nia Okafor", initials: "NO", role: "Setup & coordination", trust: "New to Offer", tone: "from-[#bcebdc] to-[#49d7b8]", status: "pending" },
  { id: "demo-david", gigSlug: "open-mic-night", gigTitle: "Open mic night", applicantUserId: "demo-user-david", name: "David Eze", initials: "DE", role: "Guest welcome & check-in", trust: "New to Offer", tone: "from-[#29244b] to-[#ff4da3]", status: "pending" },
];

export const demoInboxThreads: InboxThread[] = [
  { id: "demo-thread-slice", gigId: "demo-hangout-with-slice", gigSlug: "hangout-with-slice", gigTitle: "Hangout with Slice", counterpartName: "Slice", counterpartInitials: "MS", counterpartUserId: "demo-host-slice", preview: "Amazing — I’ll send the briefing here.", lastMessageAt: "2026-09-09T15:45:00.000Z", timeLabel: "3:45 PM", unread: 2, online: true, tone: "from-[#f5cc00] to-[#ff4da3]", role: "participant" },
  { id: "demo-thread-live-works", gigId: "demo-festival-crew", gigSlug: "festival-crew", gigTitle: "Festival crew wanted", counterpartName: "Live Works", counterpartInitials: "LW", counterpartUserId: "demo-host-live-works", preview: "Can you confirm you’ll be there by 4?", lastMessageAt: "2026-09-09T13:20:00.000Z", timeLabel: "1:20 PM", unread: 1, online: true, tone: "from-[#29244b] to-[#ff4da3]", role: "participant" },
  { id: "demo-thread-neighbourhood", gigId: "demo-community-food-drive", gigSlug: "community-food-drive", gigTitle: "Community food drive", counterpartName: "Neighbourhood Hub", counterpartInitials: "NH", counterpartUserId: "demo-host-neighbourhood", preview: "Thank you for showing up yesterday!", lastMessageAt: "2026-09-08T18:00:00.000Z", timeLabel: "Yesterday", unread: 0, online: false, tone: "from-[#bcebdc] to-[#7b8cff]", role: "participant" },
  { id: "demo-thread-tola", gigId: "demo-open-mic-night", gigSlug: "open-mic-night", gigTitle: "Open mic night", counterpartName: "Tola Adebayo", counterpartInitials: "TA", counterpartUserId: "demo-user-tola", preview: "I can help with guest welcome.", lastMessageAt: "2026-09-07T11:00:00.000Z", timeLabel: "Mon", unread: 0, online: false, tone: "from-[#ffcf91] to-[#8e52ff]", role: "host" },
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
