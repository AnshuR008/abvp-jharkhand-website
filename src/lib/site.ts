export const SITE = {
  name: "ABVP Jharkhand",
  fullName: "Akhil Bharatiya Vidyarthi Parishad, Jharkhand",
  tagline: "National Co-ordination of Students",
  motto: "Student Power • Nation First",
};

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/events", label: "Events" },
  { to: "/leadership", label: "Leadership" },
  { to: "/districts", label: "Districts" },
  { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" },
  { to: "/contact", label: "Contact" },
] as const;

export const NEWS_CATEGORIES = [
  "Latest News",
  "Press Release",
  "Organisation Update",
  "Activity Report",
  "Announcement",
  "Campaign Update",
  "District News",
];

export const LEADER_CATEGORIES = [
  "State Leadership",
  "State Office Bearer",
  "Department/Wing",
  "District Leadership",
  "Unit Leadership",
];

export const DOCUMENT_CATEGORIES = ["Report", "Press Release", "Publication", "Notice"];

export const CONTACT_CATEGORIES = ["General", "Membership", "Media", "Grievance", "Partnership"];

export const INTEREST_OPTIONS = [
  "Campus Activities",
  "Social Service",
  "Media & Design",
  "Education Reform",
  "Sports & Culture",
  "Rural Development",
];

export const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Post Graduate",
  "Research",
];

export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
