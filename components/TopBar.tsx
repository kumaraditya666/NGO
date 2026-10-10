import InstagramIcon from "@/components/InstagramIcon";
import { siteConfig } from "@/lib/config";

export default function TopBar() {
  return (
    <div className="bg-white border-b border-slate-200 font-sans">
      <div className="mx-auto max-w-[1240px] px-4 h-9 flex items-center justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-ink truncate">
          Learn today, lead tomorrow
        </p>
        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Shikshaa Sewa on Instagram"
          className="grid place-items-center h-9 w-9 -mr-2 shrink-0 rounded-md text-brand hover:text-accent-deep transition focus-visible:outline-2 focus-visible:outline-brand"
        >
          <InstagramIcon size={19} />
        </a>
      </div>
    </div>
  );
}
