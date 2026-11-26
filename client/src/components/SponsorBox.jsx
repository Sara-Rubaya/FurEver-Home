import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import { API_URL } from "../api.js";

export const taka = (n) => `৳${Number(n).toLocaleString()}`;

// Reusable progress bar - Donate page & SponsorBox duitate use hoy
export function ProgressBar({ raised, goal, percent }) {
  return (
    <div>
      <div className="h-2.5 overflow-hidden rounded-full bg-orange-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 flex justify-between text-xs text-gray-600">
        <span>{taka(raised)} raised</span>
        <span>Goal {taka(goal)} ({percent}%)</span>
      </p>
    </div>
  );
}

// AnimalDetails page e "Sponsor" box - goal set na thakle kichu dekhay na
export default function SponsorBox({ animalId }) {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/donations/animal/${animalId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setInfo)
      .catch(() => setInfo(null));
  }, [animalId]);

  if (!info?.sponsorGoal || info.status === "adopted") return null;

  return (
    <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
      <h3 className="flex items-center gap-2 font-semibold text-dark">
        <HeartHandshake className="h-5 w-5 text-primary" /> Sponsor {info.name}
      </h3>
      <div className="mt-3">
        <ProgressBar raised={info.raised} goal={info.sponsorGoal} percent={info.percent} />
      </div>
      {info.supporters.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Supported by {info.supporters.map((s) => s.name).join(", ")}
          {info.donors > info.supporters.length && ` and ${info.donors - info.supporters.length} more`}
        </p>
      )}
      <Link
        to={`/donate/new?animal=${animalId}`}
        className="mt-3 inline-block rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
      >
        Sponsor Now
      </Link>
    </div>
  );
}
