import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Phone, Navigation, CalendarDays, CheckCircle2, Trash2, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

export default function LostFoundDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setPost(null);
    setError("");
    fetch(`${API_URL}/api/lost-found/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load post");
        setPost(data);
      })
      .catch((err) => setError(err.message));
  }, [id, token]);

  const handleReunite = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/lost-found/${id}/reunite`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to mark as reunited");
      setPost((prev) => ({ ...prev, status: "reunited", matches: [] }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/lost-found/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete post");
      navigate("/lost-found");
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !post) return <p className="py-20 text-center text-red-600">{error}</p>;
  if (!post) return <p className="py-20 text-center text-gray-500">Loading...</p>;

  const isLost = post.type === "lost";
  const { lat = 0, lng = 0 } = post.location || {};
  const matches = post.matches || [];

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/lost-found" className="text-sm text-gray-500 hover:text-primary">
        ← Back to Lost &amp; Found
      </Link>

      {error && (
        <p className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <img src={post.photoUrl} alt={post.species} className="w-full rounded-xl object-cover shadow-sm" />

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase ${
                isLost ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {post.type}
            </span>
            {post.status === "reunited" && (
              <span className="rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold text-white">Reunited</span>
            )}
          </div>

          <h1 className="mt-2 text-2xl font-bold text-dark">
            {post.petName || `${post.color || ""} ${post.species}`.trim()}
          </h1>
          <p className="text-sm text-gray-600">{[post.species, post.breed, post.color].filter(Boolean).join(" • ")}</p>
          <p className="mt-4 text-gray-700">{post.description}</p>

          <p className="mt-4 flex items-start gap-1 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {post.location?.address}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <CalendarDays className="h-4 w-4" /> {isLost ? "Lost on" : "Found on"}{" "}
            {new Date(post.eventDate).toLocaleDateString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">Posted by {post.postedBy?.name || "User"}</p>

          {/* Contact */}
          <div className="mt-5 flex gap-2">
            <a
              href={`tel:${post.contactPhone}`}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Phone className="h-4 w-4" /> {post.contactPhone}
            </a>
            {lat !== 0 && lng !== 0 && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1 rounded-md border py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                <Navigation className="h-4 w-4" /> Directions
              </a>
            )}
          </div>

          {/* Owner actions */}
          {post.isOwner && (
            <div className="mt-4 flex gap-2">
              {post.status === "active" && (
                <button
                  onClick={handleReunite}
                  className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as Reunited
                </button>
              )}
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Possible matches */}
      {post.status === "active" && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-dark">
            <Sparkles className="h-5 w-5 text-primary" /> Possible Matches
          </h2>
          {matches.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              No matching {isLost ? "found" : "lost"} pets yet. Check back soon.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => (
                <Link
                  key={m._id}
                  to={`/lost-found/${m._id}`}
                  className="flex gap-3 rounded-lg border p-3 shadow-sm hover:shadow-md"
                >
                  <img src={m.photoUrl} alt={m.species} className="h-20 w-20 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-dark">
                      {m.petName || `${m.color || ""} ${m.species}`.trim()}
                    </p>
                    <p className="truncate text-xs text-gray-500">{m.location?.address}</p>
                    <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-primary">
                      Match score {m.matchScore}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
