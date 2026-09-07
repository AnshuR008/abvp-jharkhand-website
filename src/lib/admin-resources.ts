export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "date"
    | "datetime"
    | "select"
    | "tags"
    | "json"
    | "media-list"
    | "district"
    | "media";
  accept?: string;
  options?: string[];
  required?: boolean;
};

export type Resource = {
  key: string;
  table: string;
  label: string;
  titleField: string;
  orderBy: { column: string; ascending?: boolean };
  fields: Field[];
};

import { LEADER_CATEGORIES, NEWS_CATEGORIES } from "./site";

export const RESOURCES: Record<string, Resource> = {
  news: {
    key: "news",
    table: "news",
    label: "News",
    titleField: "title",
    orderBy: { column: "published_at" },
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "category", label: "Category", type: "select", options: NEWS_CATEGORIES },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "featured_image", label: "Featured image", type: "media", accept: "image/*" },
      { name: "tags", label: "Tags (comma separated)", type: "tags" },
      { name: "author", label: "Author" },
      { name: "district_id", label: "District", type: "district" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
      { name: "published_at", label: "Publish date", type: "datetime" },
    ],
  },
  events: {
    key: "events",
    table: "events",
    label: "Events",
    titleField: "title",
    orderBy: { column: "start_date" },
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Short description", type: "textarea" },
      { name: "content", label: "Details", type: "textarea" },
      { name: "banner_image", label: "Banner image", type: "media", accept: "image/*" },
      { name: "start_date", label: "Start", type: "datetime" },
      { name: "end_date", label: "End", type: "datetime" },
      { name: "venue", label: "Venue" },
      { name: "city", label: "City" },
      { name: "district_id", label: "District", type: "district" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["upcoming", "ongoing", "past", "cancelled"],
      },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  leaders: {
    key: "leaders",
    table: "leaders",
    label: "Leaders",
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "designation", label: "Designation", required: true },
      { name: "category", label: "Category", type: "select", options: LEADER_CATEGORIES },
      { name: "district_id", label: "District", type: "district" },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photo", label: "Photo", type: "media", accept: "image/*" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "facebook_url", label: "Facebook URL" },
      { name: "twitter_url", label: "Twitter URL" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  inspirations: {
    key: "inspirations",
    table: "inspirations",
    label: "Inspiration",
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "photo", label: "Photo", type: "media", accept: "image/*" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  stats: {
    key: "stats",
    table: "site_stats",
    label: "Stats",
    titleField: "label",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "label", label: "Label", required: true },
      { name: "value", label: "Number", type: "number", required: true },
      { name: "suffix", label: "Suffix (e.g. +)" },
      {
        name: "icon",
        label: "Icon",
        type: "select",
        options: ["users", "districts", "programmes", "seva"],
      },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  districts: {
    key: "districts",
    table: "districts",
    label: "Districts",
    titleField: "name",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "cover_image", label: "Cover image", type: "media", accept: "image/*" },
      { name: "president_name", label: "District president" },
      { name: "contact_email", label: "Contact email" },
      { name: "contact_phone", label: "Contact phone" },
      { name: "address", label: "Address" },
      { name: "sort_order", label: "Sort order", type: "number" },
      { name: "active", label: "Active", type: "boolean" },
    ],
  },
  units: {
    key: "units",
    table: "units",
    label: "Units",
    titleField: "name",
    orderBy: { column: "created_at" },
    fields: [
      { name: "name", label: "Unit name", required: true },
      { name: "district_id", label: "District", type: "district" },
      { name: "college_name", label: "College" },
      { name: "incharge_name", label: "Incharge" },
      { name: "contact_phone", label: "Contact phone" },
      { name: "member_count", label: "Members", type: "number" },
      { name: "active", label: "Active", type: "boolean" },
    ],
  },
  gallery: {
    key: "gallery",
    table: "gallery_albums",
    label: "Gallery Albums",
    titleField: "title",
    orderBy: { column: "album_date" },
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "cover_image", label: "Cover image", type: "media", accept: "image/*" },
      { name: "images", label: "Gallery photos", type: "media-list", accept: "image/*" },
      { name: "album_date", label: "Album date", type: "date" },
      { name: "district_id", label: "District", type: "district" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  videos: {
    key: "videos",
    table: "videos",
    label: "Videos",
    titleField: "title",
    orderBy: { column: "published_on" },
    fields: [
      { name: "title", label: "Title", required: true },
      {
        name: "youtube_id",
        label: "Video file",
        type: "media",
        accept: "video/mp4,video/webm,video/quicktime",
        required: true,
      },
      { name: "description", label: "Description", type: "textarea" },
      { name: "category", label: "Category" },
      { name: "published_on", label: "Published on", type: "date" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  announcements: {
    key: "announcements",
    table: "announcements",
    label: "Announcements",
    titleField: "message",
    orderBy: { column: "created_at" },
    fields: [
      { name: "message", label: "Message", required: true },
      { name: "link", label: "Link (e.g. /join)" },
      { name: "starts_at", label: "Starts", type: "datetime" },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "active", label: "Active", type: "boolean" },
    ],
  },
  campaigns: {
    key: "campaigns",
    table: "campaigns",
    label: "Campaigns",
    titleField: "title",
    orderBy: { column: "start_date" },
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "slug", label: "Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "banner_image", label: "Banner image", type: "media", accept: "image/*" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["active", "completed", "planned"],
      },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  activities: {
    key: "activities",
    table: "activities",
    label: "Activities",
    titleField: "title",
    orderBy: { column: "activity_date" },
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "district_id", label: "District", type: "district" },
      { name: "activity_date", label: "Date", type: "date" },
      { name: "image", label: "Image", type: "media", accept: "image/*" },
      { name: "participants", label: "Participants", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);
