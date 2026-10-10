import VolunteerForm from "@/components/VolunteerForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getPrograms, getEvents, getOpportunities } from "@/lib/content";
export const metadata = { title: "Volunteer" };
export const dynamic = "force-dynamic";
export default async function Volunteer() {
  const [programs, events, opps] = await Promise.all([getPrograms(), getEvents(), getOpportunities()]);
  const pubPrograms = programs.filter((p) => p.state === "published");
  const upcoming = events.filter((e) => e.publish === "published" && e.state === "upcoming");
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Volunteer"
          title="Lend an hour, lift a street"
          lede="Tell us who you are and how you'd like to help. A person reads every application and replies."
        />
      </Reveal>
      <div className="mt-8"><VolunteerForm programs={pubPrograms} events={upcoming} opps={opps} /></div>
    </div>
  );
}
