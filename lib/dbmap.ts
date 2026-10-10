// Pure record mappers between the app's camelCase JSON shapes and the
// snake_case Postgres tables (see supabase/migrations). No imports, no I/O,
// so the mapping can be unit-tested in isolation.

export const TABLE: Record<string, string> = {
  volunteers: "volunteers",
  enquiries: "enquiries",
  inkind_pledges: "inkind_pledges",
  registrations: "registrations",
  donations: "donations",
  donation_history: "donation_history",
  outbox: "notification_outbox",
  audit_log: "audit_log",
  staff: "staff",
};

/** Column used for newest-first ordering per collection. */
export function orderColumn(name: string): string {
  if (name === "donation_history") return "at";
  return "created_at";
}

// null-out empty strings for typed columns (date/int/timestamptz reject "").
function str(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v);
  return s === "" ? null : s;
}
function num(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function bool(v: unknown): boolean | null {
  if (v === undefined || v === null) return null;
  return Boolean(v);
}

export function toRow(name: string, r: any): Record<string, unknown> {
  switch (name) {
    case "volunteers":
      return {
        id: r.id, name: r.name ?? null, email: r.email ?? null, phone: r.phone ?? null,
        location: r.location ?? null, skills: r.skills ?? null, interests: r.interests ?? null,
        availability: r.availability ?? null, program_id: str(r.programId), event_id: str(r.eventId),
        message: r.message ?? null, status: r.status ?? "new",
        reviewed_by: str(r.reviewedBy), reviewed_at: str(r.reviewedAt), staff_note: r.staffNote ?? null,
        created_at: str(r.createdAt),
      };
    case "enquiries":
      return {
        id: r.id, kind: r.kind ?? "contact", name: r.name ?? null, email: r.email ?? null,
        phone: r.phone ?? null, subject: r.subject ?? null, message: r.message ?? null,
        status: r.status ?? "new",
        reviewed_by: str(r.reviewedBy), reviewed_at: str(r.reviewedAt), staff_note: r.staffNote ?? null,
        created_at: str(r.createdAt),
      };
    case "inkind_pledges":
      return {
        id: r.id, kind: r.kind ?? "inkind-pledge", name: r.name ?? null, email: r.email ?? null,
        phone: r.phone ?? null, subject: r.subject ?? null, message: r.message ?? null,
        status: r.status ?? "new",
        reviewed_by: str(r.reviewedBy), reviewed_at: str(r.reviewedAt), staff_note: r.staffNote ?? null,
        created_at: str(r.createdAt),
      };
    case "registrations":
      return {
        id: r.id, event_id: r.eventId, name: r.name ?? null, email: r.email ?? null,
        phone: r.phone ?? null, seats: num(r.seats) ?? 1, status: r.status ?? "new",
        reviewed_by: str(r.reviewedBy), reviewed_at: str(r.reviewedAt), staff_note: r.staffNote ?? null,
        created_at: str(r.createdAt),
      };
    case "donations":
      return {
        id: r.id, reference: r.reference, name: r.name ?? null, email: r.email ?? null,
        phone: r.phone ?? null, fund_type: r.fundType, fund_id: str(r.fundId),
        amount: num(r.amount) ?? 0, message: r.message ?? null, anonymous: bool(r.anonymous) ?? false,
        status: r.status ?? "awaiting_payment", utr: str(r.utr), paid_at: str(r.paidAt),
        proof_path: str(r.proofFile), cannot_find_ref: bool(r.cannotFindRef) ?? false,
        verified_amount: num(r.verifiedAmount), ack_number: str(r.ackNumber),
        reviewer: str(r.reviewer), reviewed_at: str(r.reviewedAt),
        internal_note: r.internalNote ?? null, token: r.token,
        test_record: bool(r.testRecord) ?? false,
        created_at: str(r.createdAt), updated_at: str(r.updatedAt),
      };
    case "donation_history":
      return {
        id: r.id, donation_id: r.donationId, from: r.from ?? null, to: r.to ?? null,
        by: r.by ?? null, note: r.note ?? null, at: str(r.at),
      };
    case "outbox":
      return {
        id: r.id, key: r.key, purpose: r.purpose, ref_kind: r.refKind, ref_id: r.refId,
        recipient: r.to, subject: r.subject, body_html: r.html ?? "", body_text: r.text ?? "",
        reply_to: str(r.replyTo), status: r.status ?? "pending",
        attempts: num(r.attempts) ?? 0, max_attempts: num(r.maxAttempts) ?? 3,
        next_attempt_at: str(r.nextAttemptAt), last_error: r.lastError ?? null,
        provider_message_id: str(r.messageId),
        created_at: str(r.createdAt), updated_at: str(r.updatedAt),
      };
    case "audit_log":
      return {
        id: r.id, at: str(r.at), by: r.by ?? null, action: r.action ?? null,
        entity: r.entity ?? null, entity_id: str(r.entityId), detail: r.detail ?? null,
      };
    case "staff":
      return {
        id: r.id, email: r.email, name: r.name ?? null, role: r.role,
        salt: r.salt, hash: r.hash,
        reset_hash: str(r.resetHash), reset_exp: num(r.resetExp),
        created_at: str(r.createdAt),
      };
    default:
      return r;
  }
}

function iso(v: unknown): string {
  if (!v) return new Date(0).toISOString();
  try {
    return new Date(String(v)).toISOString();
  } catch {
    return String(v);
  }
}

export function fromRow(name: string, r: any): any {
  switch (name) {
    case "volunteers":
      return {
        id: r.id, name: r.name ?? "", email: r.email ?? "", phone: r.phone ?? "",
        location: r.location ?? "", skills: r.skills ?? "", interests: r.interests ?? "",
        availability: r.availability ?? "", programId: r.program_id ?? "", eventId: r.event_id ?? "",
        message: r.message ?? "", formType: "volunteer", status: r.status ?? "new",
        reviewedBy: r.reviewed_by ?? undefined, reviewedAt: r.reviewed_at ?? undefined,
        staffNote: r.staff_note ?? undefined, createdAt: iso(r.created_at),
      };
    case "enquiries":
      return {
        id: r.id, kind: r.kind ?? "contact", name: r.name ?? "", email: r.email ?? "",
        phone: r.phone ?? "", subject: r.subject ?? "", message: r.message ?? "",
        formType: r.kind ?? "contact", status: r.status ?? "new",
        reviewedBy: r.reviewed_by ?? undefined, reviewedAt: r.reviewed_at ?? undefined,
        staffNote: r.staff_note ?? undefined, createdAt: iso(r.created_at),
      };
    case "inkind_pledges":
      return {
        id: r.id, kind: r.kind ?? "inkind-pledge", name: r.name ?? "", email: r.email ?? "",
        phone: r.phone ?? "", subject: r.subject ?? "", message: r.message ?? "",
        formType: "inkind-pledge", status: r.status ?? "new",
        reviewedBy: r.reviewed_by ?? undefined, reviewedAt: r.reviewed_at ?? undefined,
        staffNote: r.staff_note ?? undefined, createdAt: iso(r.created_at),
      };
    case "registrations":
      return {
        id: r.id, eventId: r.event_id, name: r.name ?? "", email: r.email ?? "",
        phone: r.phone ?? "", seats: r.seats ?? 1, formType: "event-registration",
        status: r.status ?? "new",
        reviewedBy: r.reviewed_by ?? undefined, reviewedAt: r.reviewed_at ?? undefined,
        staffNote: r.staff_note ?? undefined, createdAt: iso(r.created_at),
      };
    case "donations":
      return {
        id: r.id, reference: r.reference, name: r.name ?? "", email: r.email ?? "",
        phone: r.phone ?? "", fundType: r.fund_type, fundId: r.fund_id ?? "",
        amount: r.amount ?? 0, message: r.message ?? "", anonymous: !!r.anonymous,
        status: r.status, utr: r.utr ?? undefined, paidAt: r.paid_at ?? undefined,
        proofFile: r.proof_path ?? undefined, cannotFindRef: !!r.cannot_find_ref,
        verifiedAmount: r.verified_amount ?? undefined, ackNumber: r.ack_number ?? undefined,
        reviewer: r.reviewer ?? undefined, reviewedAt: r.reviewed_at ?? undefined,
        internalNote: r.internal_note ?? undefined, token: r.token,
        testRecord: !!r.test_record,
        createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
      };
    case "donation_history":
      return {
        id: r.id, donationId: r.donation_id, from: r.from ?? "", to: r.to ?? "",
        by: r.by ?? "", note: r.note ?? "", at: iso(r.at),
      };
    case "outbox":
      return {
        id: r.id, key: r.key, purpose: r.purpose, refKind: r.ref_kind, refId: r.ref_id,
        to: r.recipient, subject: r.subject, html: r.body_html ?? "", text: r.body_text ?? "",
        replyTo: r.reply_to ?? undefined, status: r.status,
        attempts: r.attempts ?? 0, maxAttempts: r.max_attempts ?? 3,
        nextAttemptAt: iso(r.next_attempt_at), lastError: r.last_error ?? undefined,
        messageId: r.provider_message_id ?? undefined,
        createdAt: iso(r.created_at), updatedAt: iso(r.updated_at),
      };
    case "audit_log":
      return {
        id: r.id, at: iso(r.at), by: r.by ?? "", action: r.action ?? "",
        entity: r.entity ?? "", entityId: r.entity_id ?? "", detail: r.detail ?? "",
      };
    case "staff":
      return {
        id: r.id, email: r.email, name: r.name ?? "", role: r.role,
        salt: r.salt, hash: r.hash,
        resetHash: r.reset_hash ?? undefined, resetExp: r.reset_exp ?? undefined,
        createdAt: iso(r.created_at),
      };
    default:
      return r;
  }
}
