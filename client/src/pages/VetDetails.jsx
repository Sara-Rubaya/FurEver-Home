import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Phone, Clock, Siren, Navigation, Trash2, Loader2 } from "lucide-react";
import { Stars, StarInput } from "../components/StarRating.jsx";
import { useAuth } from "../context/AuthContext.jsx";
 
// FR08 - Clinic details + rating summary + reviews + review form
export default function VetDetails() {
  const { id } = useParams();
  const { isAuthenticated, user, token } = useAuth();
 
  const [clinic, setClinic] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
 
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  const load = async () => {
    const [cRes, rRes] = await Promise.all([fetch(`/api/vets/${id}`), fetch(`/api/vets/${id}/reviews`)]);
    if (!cRes.ok) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setClinic(await cRes.json());
    setReviews(await rRes.json());
    setLoading(false);
  };
 
  useEffect(() => {
    load();
    
  }, [id]);
 
  
  const myReview = isAuthenticated ? reviews.find((r) => r.user?._id === user.id) : null;
 
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    }
    
  }, [myReview?._id]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
 
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vets/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");
 
      setSuccess(myReview ? "Your review was updated." : "Thanks for your review!");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleDelete = async (reviewId, mine) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/vets/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (mine) {
      setRating(0);
      setComment("");
      setSuccess("");
    }
    await load();
  };
 
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }
  if (notFound) {
    return <p className="py-20 text-center text-gray-500">Clinic not found.</p>;
  }
 
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/vet-directory" className="text-sm text-gray-500 hover:text-primary">
        ← Back to directory
      </Link>
 
      {/* Clinic info */}
      <div className="mt-3 rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-dark">{clinic.name}</h1>
          {clinic.emergencyAvailable && (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              <Siren className="h-3 w-3" /> Emergency
            </span>
          )}
        </div>
        <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {clinic.address}
        </p>
        {clinic.openingHours && (
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-4 w-4 shrink-0" /> {clinic.openingHours}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {clinic.services?.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
            <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s}</span>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <a href={`tel:${clinic.phone}`} className="flex items-center gap-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <Phone className="h-4 w-4" /> Call {clinic.phone}
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.location.lat},${clinic.location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
          >
            <Navigation className="h-4 w-4" /> Directions
          </a>
        </div>
      </div>
 
      {/* Rating summary */}
      <div className="mt-6 grid gap-6 rounded-xl border p-6 shadow-sm sm:grid-cols-[auto_1fr]">
        <div className="text-center">
          <p className="text-4xl font-bold text-dark">{clinic.reviewCount > 0 ? clinic.avgRating : "–"}</p>
          <Stars value={clinic.avgRating} className="h-5 w-5" />
          <p className="mt-1 text-sm text-gray-500">
            {clinic.reviewCount} review{clinic.reviewCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-1">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = clinic.distribution?.[n] || 0;
            const pct = clinic.reviewCount ? (count / clinic.reviewCount) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-8">{n} star</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
 
      {/* Review form */}
      <div className="mt-6 rounded-xl border p-6 shadow-sm">
        <h2 className="font-semibold text-dark">{myReview ? "Your review" : "Write a review"}</h2>
        {!isAuthenticated ? (
          <p className="mt-2 text-sm text-gray-600">
            <Link to="/login" className="font-medium text-primary hover:underline">Login to write a review</Link>
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
            {error && <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">{success}</p>}
            <StarInput value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Share your experience (optional)"
              className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
                {submitting ? "Saving..." : myReview ? "Update review" : "Submit review"}
              </button>
              {myReview && (
                <button type="button" onClick={() => handleDelete(myReview._id, true)} className="text-sm text-red-500 hover:text-red-700">
                  Delete my review
                </button>
              )}
            </div>
          </form>
        )}
      </div>
 
      {/* Reviews list */}
      <h2 className="mt-8 font-semibold text-dark">Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {reviews.map((r) => {
            const mine = isAuthenticated && r.user?._id === user.id;
            const canDelete = isAuthenticated && (mine || user.role === "admin");
            return (
              <div key={r._id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-dark">{r.user?.name || "Deleted user"}</span>
                    <Stars value={r.rating} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    {canDelete && !mine && (
                      <button onClick={() => handleDelete(r._id, false)} aria-label="Delete review" className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
