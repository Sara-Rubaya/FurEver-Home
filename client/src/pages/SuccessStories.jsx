import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Heart,
  Search,
  Plus,
  X,
  Camera,
  MapPin,
  Calendar,
  Star,
  Trash2,
  Edit3,
  BookOpen,
  Loader2,
  PawPrint,
  Quote,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const SPECIES_OPTIONS = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const STORY_TYPES = [
  "Adoption",
  "Rescue & Recovery",
  "Foster to Forever",
  "Medical Miracle",
];

const TYPE_BADGE = {
  Adoption: "bg-orange-100 text-[#7F1D1D]",
  "Rescue & Recovery": "bg-green-100 text-green-700",
  "Foster to Forever": "bg-amber-100 text-amber-800",
  "Medical Miracle": "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  title: "",
  petName: "",
  species: "Dog",
  breed: "",
  storyType: "Adoption",
  adoptionDate: "",
  location: "",
  shelterName: "",
  quote: "",
  story: "",
  beforePhotoUrl: "",
  afterPhotoUrl: "",
  animalId: "",
};

const inputClass =
  "w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm text-dark focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-orange-200";

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// FR10 - Success Stories Wall: community adoption & rescue stories with Before/After toggle, likes, and featured spotlight
export default function SuccessStories() {
  const { isAuthenticated, token, user } = useAuth();
  const currentUserId = user?.id || user?._id || null;
  const isAdmin = user?.role === "admin";

  const [stories, setStories] = useState([]);
  const [stats, setStats] = useState({ totalStories: 0, featuredCount: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  // Submission / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [afterFile, setAfterFile] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterPreview, setAfterPreview] = useState("");
  const [beforePreview, setBeforePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quick-pick pets (approved adoptions for adopters, or shelter animals for shelters)
  const [myPets, setMyPets] = useState([]);

  // Card state: track which cards currently display the "before" photo
  const [showBeforeById, setShowBeforeById] = useState({});
  const [activeStory, setActiveStory] = useState(null);

  const loadStories = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ sort });
      if (search.trim()) params.set("search", search.trim());
      if (speciesFilter) params.set("species", speciesFilter);
      if (typeFilter) params.set("storyType", typeFilter);
      if (featuredOnly) params.set("featured", "true");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/stories?${params.toString()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load success stories");

      setStories(data.stories || []);
      setStats(data.stats || { totalStories: 0, featuredCount: 0, totalLikes: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(loadStories, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, speciesFilter, typeFilter, featuredOnly, sort, token]);

  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      setMyPets([]);
      return;
    }
    const loadMyPets = async () => {
      try {
        if (user.role === "adopter") {
          const res = await fetch(`${API_URL}/api/applications`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return;
          const data = await res.json();
          const approvedPets = Array.isArray(data)
            ? data.filter((a) => a.status === "approved" && a.animal).map((a) => a.animal)
            : [];
          setMyPets(approvedPets);
        } else if (user.role === "shelter" && currentUserId) {
          const res = await fetch(`${API_URL}/api/animals?shelter=${currentUserId}`);
          if (!res.ok) return;
          const data = await res.json();
          setMyPets(Array.isArray(data) ? data : []);
        } else {
          setMyPets([]);
        }
      } catch {
        // optional helper list
      }
    };
    loadMyPets();
  }, [isAuthenticated, token, user, currentUserId]);

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary is not configured; paste an image URL instead.");
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body,
    });
    const data = await res.json();
    if (!res.ok) throw new Error("Image upload failed");
    return data.secure_url;
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAfterFile(null);
    setBeforeFile(null);
    setAfterPreview("");
    setBeforePreview("");
    setShowForm(false);
  };

  const handleSelectPet = (animalId) => {
    const pet = myPets.find((p) => p._id === animalId);
    if (!pet) {
      setForm((f) => ({ ...f, animalId: "" }));
      return;
    }
    setForm((f) => ({
      ...f,
      animalId: pet._id,
      petName: pet.name || f.petName,
      species: SPECIES_OPTIONS.includes(pet.species) ? pet.species : "Other",
      breed: pet.breed || f.breed,
      shelterName: pet.shelter?.name || f.shelterName,
      afterPhotoUrl: f.afterPhotoUrl || pet.photoUrl || "",
    }));
  };

  const handleStartEdit = (storyItem) => {
    setEditingId(storyItem._id);
    setForm({
      title: storyItem.title || "",
      petName: storyItem.petName || "",
      species: storyItem.species || "Dog",
      breed: storyItem.breed || "",
      storyType: storyItem.storyType || "Adoption",
      adoptionDate: storyItem.adoptionDate ? storyItem.adoptionDate.slice(0, 10) : "",
      location: storyItem.location || "",
      shelterName: storyItem.shelterName || "",
      quote: storyItem.quote || "",
      story: storyItem.story || "",
      beforePhotoUrl: storyItem.beforePhotoUrl || "",
      afterPhotoUrl: storyItem.afterPhotoUrl || "",
      animalId: storyItem.animal?._id || "",
    });
    setAfterFile(null);
    setBeforeFile(null);
    setAfterPreview(storyItem.afterPhotoUrl || "");
    setBeforePreview(storyItem.beforePhotoUrl || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");

    if (!afterFile && !form.afterPhotoUrl.trim()) {
      setError("Please upload an After photo or paste an image URL.");
      return;
    }

    setSubmitting(true);
    try {
      const resolvedAfter = afterFile
        ? await uploadToCloudinary(afterFile)
        : form.afterPhotoUrl.trim();
      const resolvedBefore = beforeFile
        ? await uploadToCloudinary(beforeFile)
        : form.beforePhotoUrl.trim();

      const endpoint = editingId
        ? `${API_URL}/api/stories/${editingId}`
        : `${API_URL}/api/stories`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          afterPhotoUrl: resolvedAfter,
          beforePhotoUrl: resolvedBefore,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save success story");

      resetForm();
      setFeedback(
        editingId
          ? "Success story updated!"
          : "Your story is now live on the Success Stories Wall!"
      );
      await loadStories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (storyId) => {
    if (!isAuthenticated) {
      setError("Please log in to cheer for a story.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/stories/${storyId}/like`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || "Failed to update like");

      setStories((prev) => prev.map((s) => (s._id === storyId ? updated : s)));
      if (activeStory?._id === storyId) setActiveStory(updated);
      setStats((prev) => ({
        ...prev,
        totalLikes:
          prev.totalLikes + (updated.likedByMe ? 1 : -1),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleFeature = async (storyId) => {
    try {
      const res = await fetch(`${API_URL}/api/stories/${storyId}/feature`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || "Failed to update featured status");
      await loadStories();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (storyId) => {
    if (!confirm("Delete this success story?")) return;
    try {
      const res = await fetch(`${API_URL}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete story");
      if (activeStory?._id === storyId) setActiveStory(null);
      setFeedback("Story removed from the wall.");
      await loadStories();
    } catch (err) {
      setError(err.message);
    }
  };

  const canManage = (item) => {
    if (isAdmin) return true;
    const authorId = item.author?._id || item.author;
    return Boolean(currentUserId && authorId && String(authorId) === String(currentUserId));
  };

  const clearFilters = () => {
    setSearch("");
    setSpeciesFilter("");
    setTypeFilter("");
    setFeaturedOnly(false);
    setSort("featured");
  };

  return (
    <section className="min-h-screen bg-[#FFF7ED] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316] p-7 text-white shadow-lg sm:p-10">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-bold tracking-wider backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-[#FFE4C7]" />
                FR10 · SUCCESS STORIES WALL
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Every Rescue Has a Happy Ending
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/90 sm:text-base">
                Celebrate adopted pets thriving in their forever homes. Read transformations,
                cheer for families, and share your own journey.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      if (showForm) resetForm();
                      else setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-5 py-2.5 text-sm font-bold text-[#7F1D1D] shadow-md transition hover:bg-white"
                  >
                    {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {showForm ? "Close Form" : "Share Your Story"}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-5 py-2.5 text-sm font-bold text-[#7F1D1D] shadow-md transition hover:bg-white"
                  >
                    Login to Share a Story
                  </Link>
                )}
                <Link
                  to="/animals"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <PawPrint className="h-4 w-4" />
                  Adopt a Pet
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-extrabold">{stats.totalStories}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FFE4C7]">
                  Stories
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-extrabold">{stats.featuredCount}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FFE4C7]">
                  Featured
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                <p className="text-2xl font-extrabold">{stats.totalLikes}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FFE4C7]">
                  Cheers
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {feedback && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {feedback}
          </div>
        )}

        {/* Submission / Edit Form */}
        {isAuthenticated && showForm && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#FDBA74] bg-white p-6 shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-extrabold text-[#7F1D1D]">
                {editingId ? "Edit Success Story" : "Share a Pet Success Story"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-gray-500 hover:text-[#DC2626]"
              >
                Cancel
              </button>
            </div>

            {!editingId && myPets.length > 0 && (
              <div className="mt-4 rounded-xl border border-orange-100 bg-[#FFF7ED] p-3.5">
                <label className="mb-1 block text-xs font-bold text-[#7F1D1D]">
                  Quick-fill from your pets (optional)
                </label>
                <select
                  value={form.animalId}
                  onChange={(e) => handleSelectPet(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Enter pet details manually --</option>
                  {myPets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name} ({pet.species} · {pet.breed})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Story Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. From Shy Stray to Couch King!"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Story Category
                </label>
                <select
                  value={form.storyType}
                  onChange={(e) => setForm((f) => ({ ...f, storyType: e.target.value }))}
                  className={inputClass}
                >
                  {STORY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Pet Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milo"
                  value={form.petName}
                  onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Species</label>
                <select
                  value={form.species}
                  onChange={(e) => setForm((f) => ({ ...f, species: e.target.value }))}
                  className={inputClass}
                >
                  {SPECIES_OPTIONS.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Breed</label>
                <input
                  type="text"
                  placeholder="e.g. Golden Retriever"
                  value={form.breed}
                  onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Adoption / Rescue Date
                </label>
                <input
                  type="date"
                  value={form.adoptionDate}
                  onChange={(e) => setForm((f) => ({ ...f, adoptionDate: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  City / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Shelter / Rescuer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paws Care Shelter"
                  value={form.shelterName}
                  onChange={(e) => setForm((f) => ({ ...f, shelterName: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Short Highlight Quote
                </label>
                <input
                  type="text"
                  maxLength={240}
                  placeholder="A favorite moment or one-line reflection..."
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Full Transformation Story *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell the community how you met, how they settled in, and how life has changed..."
                  value={form.story}
                  onChange={(e) => setForm((f) => ({ ...f, story: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {/* After Photo (Required) */}
              <div className="rounded-xl border border-orange-200 bg-[#FFF7ED]/70 p-4 sm:col-span-1 lg:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#7F1D1D]">
                  After / Current Happy Photo * (upload or paste URL)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-[#7F1D1D] hover:bg-[#FFE4C7]">
                    <Camera className="h-4 w-4 text-[#F97316]" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setAfterFile(file);
                        setAfterPreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.afterPhotoUrl}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, afterPhotoUrl: e.target.value }));
                      if (!afterFile) setAfterPreview(e.target.value);
                    }}
                    className={`${inputClass} flex-1`}
                  />
                </div>
                {afterPreview && (
                  <img
                    src={afterPreview}
                    alt="After preview"
                    className="mt-3 h-28 w-44 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Before Photo (Optional) */}
              <div className="rounded-xl border border-orange-200 bg-[#FFF7ED]/70 p-4">
                <label className="mb-1.5 block text-xs font-bold text-[#7F1D1D]">
                  Before Photo (optional)
                </label>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-[#7F1D1D] hover:bg-[#FFE4C7]">
                    <Camera className="h-4 w-4 text-[#F97316]" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setBeforeFile(file);
                        setBeforePreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (optional)"
                    value={form.beforePhotoUrl}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, beforePhotoUrl: e.target.value }));
                      if (!beforeFile) setBeforePreview(e.target.value);
                    }}
                    className={inputClass}
                  />
                </div>
                {beforePreview && (
                  <img
                    src={beforePreview}
                    alt="Before preview"
                    className="mt-3 h-28 w-44 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#DC2626] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#7F1D1D] disabled:opacity-60"
              >
                {submitting ? "Publishing..." : editingId ? "Save Changes" : "Publish Story"}
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#FFE4C7] bg-white p-4 shadow-sm">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search pet name, breed, city, or story..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-orange-200 py-2 pl-10 pr-4 text-sm focus:border-[#F97316] focus:outline-none"
            />
          </div>

          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm text-[#7F1D1D]"
          >
            <option value="">All Species</option>
            {SPECIES_OPTIONS.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm text-[#7F1D1D]"
          >
            <option value="">All Story Types</option>
            {STORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm text-[#7F1D1D]"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newest</option>
            <option value="mostLiked">Most Cheered</option>
            <option value="oldest">Oldest</option>
          </select>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-200 bg-[#FFF7ED] px-3.5 py-2 text-xs font-bold text-[#7F1D1D]">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="accent-[#DC2626]"
            />
            Featured Only
          </label>

          {(search || speciesFilter || typeFilter || featuredOnly || sort !== "featured") && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#DC2626] hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#DC2626]" />
            <p className="text-sm font-semibold text-[#7F1D1D]">Loading success stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-2xl border border-[#FFE4C7] bg-white p-12 text-center shadow-sm">
            <Sparkles className="mx-auto h-10 w-10 text-[#F97316]" />
            <h2 className="mt-3 text-lg font-bold text-[#7F1D1D]">No success stories yet</h2>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share an inspiring rescue or adoption story with the community!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((item) => {
              const hasBefore = Boolean(item.beforePhotoUrl);
              const showingBefore = hasBefore && Boolean(showBeforeById[item._id]);
              const activePhoto = showingBefore ? item.beforePhotoUrl : item.afterPhotoUrl;

              return (
                <article
                  key={item._id}
                  className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    item.isFeatured ? "border-[#F97316] ring-1 ring-[#FDBA74]" : "border-[#FFE4C7]"
                  }`}
                >
                  <div>
                    {/* Photo + Badges */}
                    <div className="relative h-56 overflow-hidden bg-orange-50">
                      <img
                        src={activePhoto}
                        alt={`${item.petName} ${showingBefore ? "before" : "after"}`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {item.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#DC2626] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                            <Star className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
                            TYPE_BADGE[item.storyType] || "bg-white text-[#7F1D1D]"
                          }`}
                        >
                          {item.storyType}
                        </span>
                      </div>

                      {hasBefore && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowBeforeById((prev) => ({
                              ...prev,
                              [item._id]: !prev[item._id],
                            }))
                          }
                          className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-[#DC2626]"
                        >
                          {showingBefore ? "Showing: Before (Click for After)" : "View Before Photo"}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#F97316]">
                        <span>
                          {item.petName} · {item.species}
                          {item.breed ? ` (${item.breed})` : ""}
                        </span>
                        {item.adoptionDate && (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.adoptionDate)}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-lg font-extrabold text-[#7F1D1D]">
                        {item.title}
                      </h3>

                      {item.quote && (
                        <blockquote className="mt-2.5 flex items-start gap-2 rounded-xl bg-[#FFF7ED] px-3 py-2 text-xs italic text-[#7F1D1D]">
                          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F97316]" />
                          <span>"{item.quote}"</span>
                        </blockquote>
                      )}

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                        {item.story}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        {item.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#DC2626]" />
                            {item.location}
                          </span>
                        )}
                        {item.shelterName && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-[#F97316]" />
                            {item.shelterName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[#FFE4C7] bg-[#FFF7ED]/50 px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLike(item._id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                          item.likedByMe
                            ? "bg-[#DC2626] text-white"
                            : "border border-orange-200 bg-white text-[#7F1D1D] hover:bg-[#FFE4C7]"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${item.likedByMe ? "fill-current" : ""}`} />
                        {item.likeCount}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveStory(item)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#7F1D1D] hover:text-[#DC2626]"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Read
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleToggleFeature(item._id)}
                            title={item.isFeatured ? "Remove from Featured" : "Feature story"}
                            className="text-xs font-bold text-[#F97316] hover:text-[#DC2626]"
                          >
                            {item.isFeatured ? "Unfeature" : "Feature"}
                          </button>
                        )}

                        {canManage(item) && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(item)}
                              aria-label="Edit story"
                              className="text-gray-500 hover:text-[#7F1D1D]"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              aria-label="Delete story"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="mt-1.5 text-[11px] text-gray-500">
                      Shared by {item.author?.name || item.authorDisplayName || "Community Member"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Story Modal */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                    TYPE_BADGE[activeStory.storyType] || "bg-orange-100 text-[#7F1D1D]"
                  }`}
                >
                  {activeStory.storyType}
                </span>
                <h2 className="mt-2 text-2xl font-extrabold text-[#7F1D1D]">
                  {activeStory.title}
                </h2>
                <p className="text-sm font-medium text-gray-600">
                  {activeStory.petName} · {activeStory.species}
                  {activeStory.breed ? ` (${activeStory.breed})` : ""}
                </p>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`mt-4 grid gap-3 ${
                activeStory.beforePhotoUrl ? "sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {activeStory.beforePhotoUrl && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase text-gray-500">Before</p>
                  <img
                    src={activeStory.beforePhotoUrl}
                    alt={`${activeStory.petName} before`}
                    className="h-56 w-full rounded-2xl object-cover"
                  />
                </div>
              )}
              <div>
                {activeStory.beforePhotoUrl && (
                  <p className="mb-1 text-xs font-bold uppercase text-[#DC2626]">After</p>
                )}
                <img
                  src={activeStory.afterPhotoUrl}
                  alt={`${activeStory.petName} after`}
                  className="h-56 w-full rounded-2xl object-cover"
                />
              </div>
            </div>

            {activeStory.quote && (
              <blockquote className="mt-4 rounded-xl bg-[#FFF7ED] p-3.5 text-sm italic text-[#7F1D1D]">
                "{activeStory.quote}"
              </blockquote>
            )}

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
              {activeStory.story}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 pt-4 text-xs text-gray-500">
              <div className="flex flex-wrap gap-3">
                <span>
                  Shared by{" "}
                  <strong className="text-[#7F1D1D]">
                    {activeStory.author?.name || activeStory.authorDisplayName || "Community"}
                  </strong>
                </span>
                {activeStory.shelterName && <span>· Shelter: {activeStory.shelterName}</span>}
                {activeStory.location && <span>· {activeStory.location}</span>}
              </div>

              <button
                onClick={() => handleLike(activeStory._id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeStory.likedByMe
                    ? "bg-[#DC2626] text-white"
                    : "border border-orange-200 bg-[#FFF7ED] text-[#7F1D1D]"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${activeStory.likedByMe ? "fill-current" : ""}`} />
                Cheer ({activeStory.likeCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
