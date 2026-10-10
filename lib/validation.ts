import { z } from "zod";

export const donationDetailsSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(20).optional().or(z.literal("")),
  fundType: z.enum(["general", "program", "campaign"]),
  fundId: z.string().max(80).optional().or(z.literal("")),
  amount: z.number().min(10).max(10000000),
  message: z.string().max(1000).optional().or(z.literal("")),
  anonymous: z.boolean().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
});

export const donationVerifySchema = z.object({
  reference: z.string().min(4).max(40),
  utr: z.string().min(4).max(40),
  paidAt: z.string().min(4).max(20),
  note: z.string().max(500).optional().or(z.literal("")),
  cannotFindRef: z.boolean().default(false),
});

export const volunteerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().max(160).optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    location: z.string().max(160).optional().or(z.literal("")),
    skills: z.string().max(500).optional().or(z.literal("")),
    interests: z.string().max(500).optional().or(z.literal("")),
    availability: z.string().max(200).optional().or(z.literal("")),
    programId: z.string().max(80).optional().or(z.literal("")),
    eventId: z.string().max(80).optional().or(z.literal("")),
    message: z.string().max(2000).optional().or(z.literal("")),
    consent: z.literal(true),
  })
  .superRefine((v, ctx) => {
    const email = (v.email || "").trim();
    const phone = (v.phone || "").trim();
    if (!email && !phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Give an email address or a phone number so we can reply.", path: ["email"] });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "That email address does not look valid.", path: ["email"] });
    }
  });

export const enquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional().or(z.literal("")),
  kind: z.enum(["contact", "partnership", "inkind-pledge", "general"]).default("contact"),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(5).max(4000),
  consent: z.literal(true),
});

export const eventRegSchema = z.object({
  eventId: z.string().min(1).max(80),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional().or(z.literal("")),
  seats: z.number().min(1).max(10).default(1),
  consent: z.literal(true),
});
