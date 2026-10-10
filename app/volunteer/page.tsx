import VolunteerForm from "@/components/VolunteerForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getPrograms, getEvents, getOpportunities } from "@/lib/content";
export const metadata = { title: "Volunteer" };
export const dynamic = "force-dynamic";
export default async function Volunteer() {
  const [programs, events, opps] = await Promise.all([getPrograms(), getEvents(), getOpportunities()]);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Reveal><SectionHeading kicker="Volunteer" title="Lend an hour, lift a street" lede="Applications are stored for admin review. We reply by email — demo mode logs messages instead of sending." /></Reveal>
      <div className="mt-8"><VolunteerForm programs={programs} events={events} opps={opps} /></div>
    </div>
  );
}
