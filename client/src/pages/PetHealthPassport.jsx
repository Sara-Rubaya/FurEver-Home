import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Syringe,
  Stethoscope,
  Printer,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  HeartPulse,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_URL } from "../api.js";

const RECORD_TYPES = [
  "Checkup",
  "Treatment",
  "Surgery",
  "Deworming",
  "Lab Test",
  "Emergency",
  "Other",
];

const RECORD_BADGE = {
  Checkup: "bg-blue-100 text-blue-700",
  Treatment: "bg-orange-100 text-orange-700",
  Surgery: "bg-purple-100 text-purple-700",
  Deworming: "bg-green-100 text-green-700",
  "Lab Test": "bg-teal-100 text-teal-700",
  Emergency: "bg-red-100 text-red-700",
  Other: "bg-gray-100 text-gray-700",
};

const EMPTY_VAX = {
  name: "",
  dateAdministered: "",
  nextDueDate: "",
  vetName: "",
  clinicName: "",
  batchNumber: "",
  notes: "",
};

const EMPTY_RECORD = {
  title: "",
  recordType: "Checkup",
  date: "",
  vetName: "",
  clinicName: "",
  diagnosis: "",
  medication: "",
  notes: "",
};

const inputClass =
  "w-full rounded-lg border border-orange-200 bg-white px-3.5 py-2 text-sm text-dark focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-orange-200";

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getVaxStatus = (nextDueDate) => {
  if (!nextDueDate) {
    return {
      label: "Completed",
      style: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(nextDueDate);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue (${Math.abs(diffDays)}d)`,
      style: "bg-red-100 text-red-700",
      icon: AlertTriangle,
    };
  }
  if (diffDays <= 30) {
    return {
      label: diffDays === 0 ? "Due Today" : `Due in ${diffDays}d`,
      style: "bg-amber-100 text-amber-800",
      icon: Clock,
    };
  }
  return {
    label: "Up to date",
    style: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  };
};

// FR09 - Pet Health Passport: official pet medical record, vaccination history & printable card
export default function PetHealthPassport() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [passport, setPassport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Toggleable editor panels
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    microchipId: "",
    bloodGroup: "",
    weightKg: "",
    spayedNeutered: false,
    allergies: "",
    chronicConditions: "",
    dietaryNotes: "",
    emergencyClinicName: "",
    emergencyPhone: "",
  });

  const [showVaxForm, setShowVaxForm] = useState(false);
  const [vaxForm, setVaxForm] = useState(EMPTY_VAX);

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordForm, setRecordForm] = useState(EMPTY_RECORD);

  const [saving, setSaving] = useState(false);

  const syncInfoForm = (p) => {
    setInfoForm({
      microchipId: p?.microchipId || "",
      bloodGroup: p?.bloodGroup || "",
      weightKg: p?.weightKg ?? "",
      spayedNeutered: Boolean(p?.spayedNeutered),
      allergies: (p?.allergies || []).join(", "),
      chronicConditions: (p?.chronicConditions || []).join(", "),
      dietaryNotes: p?.dietaryNotes || "",
      emergencyClinicName: p?.emergencyVetContact?.clinicName || "",
      emergencyPhone: p?.emergencyVetContact?.phone || "",
    });
  };

  const loadPassport = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/api/passports/animal/${id}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load health passport");

      setAnimal(data.animal);
      setPassport(data.passport);
      setSummary(data.summary);
      setCanEdit(Boolean(data.canEdit));
      syncInfoForm(data.passport);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/passports/animal/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          microchipId: infoForm.microchipId,
          bloodGroup: infoForm.bloodGroup,
          weightKg: infoForm.weightKg === "" ? null : Number(infoForm.weightKg),
          spayedNeutered: infoForm.spayedNeutered,
          allergies: infoForm.allergies,
          chronicConditions: infoForm.chronicConditions,
          dietaryNotes: infoForm.dietaryNotes,
          emergencyVetContact: {
            clinicName: infoForm.emergencyClinicName,
            phone: infoForm.emergencyPhone,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save passport details");

      setEditingInfo(false);
      setFeedback("Health passport details saved.");
      await loadPassport();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/passports/animal/${id}/vaccinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vaxForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add vaccination");

      setVaxForm(EMPTY_VAX);
      setShowVaxForm(false);
      setFeedback("Vaccination added to passport.");
      await loadPassport();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVaccination = async (vaxId) => {
    if (!confirm("Remove this vaccination record?")) return;
    setError("");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/passports/animal/${id}/vaccinations/${vaxId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete vaccination");

      setFeedback("Vaccination entry removed.");
      await loadPassport();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/passports/animal/${id}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add medical record");

      setRecordForm(EMPTY_RECORD);
      setShowRecordForm(false);
      setFeedback("Medical record added to passport.");
      await loadPassport();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm("Remove this medical record?")) return;
    setError("");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/passports/animal/${id}/records/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete medical record");

      setFeedback("Medical record removed.");
      await loadPassport();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 bg-[#FFF7ED]">
        <Loader2 className="h-8 w-8 animate-spin text-[#DC2626]" />
        <p className="text-sm font-semibold text-[#7F1D1D]">Loading Pet Health Passport...</p>
      </div>
    );
  }

  if (!animal) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-gray-600">{error || "Animal not found."}</p>
        <Link to="/animals" className="mt-4 inline-block text-sm font-semibold text-[#DC2626] hover:underline">
          Back to Browse Animals
        </Link>
      </section>
    );
  }

  const vaccinations = [...(passport?.vaccinations || [])].sort(
    (a, b) => new Date(b.dateAdministered) - new Date(a.dateAdministered)
  );
  const medicalRecords = [...(passport?.medicalRecords || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <section className="min-h-screen bg-[#FFF7ED] px-4 py-8 print:bg-white print:py-2">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={`/animals/${animal._id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7F1D1D] hover:text-[#DC2626]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {animal.name}
            </Link>
            {isAuthenticated && (
              <Link
                to="/health-passports"
                className="text-sm font-medium text-gray-600 hover:text-[#7F1D1D]"
              >
                All Health Passports
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setEditingInfo((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-[#7F1D1D] shadow-sm transition hover:bg-[#FFE4C7]"
              >
                {editingInfo ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {editingInfo ? "Cancel Edit" : passport ? "Edit Health Info" : "Initialize Passport"}
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7F1D1D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#DC2626]"
            >
              <Printer className="h-4 w-4" />
              Print Passport
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 print:hidden">
            {error}
          </div>
        )}
        {feedback && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 print:hidden">
            {feedback}
          </div>
        )}

        {/* Passport Cover / Identity Card */}
        <div className="overflow-hidden rounded-3xl border border-[#FDBA74]/70 bg-white shadow-md print:shadow-none">
          <div className="bg-gradient-to-r from-[#7F1D1D] via-[#DC2626] to-[#F97316] px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <ShieldCheck className="h-6 w-6 text-[#FFE4C7]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FFE4C7]">
                    FurEver Home · FR09 Official Record
                  </p>
                  <h1 className="text-2xl font-extrabold">Pet Health Passport</h1>
                </div>
              </div>

              <div className="rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wider text-white/80">Passport ID</p>
                <p className="font-mono text-sm font-bold">
                  {passport?.passportNumber || "Pending Initialization"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
            <img
              src={animal.photoUrl}
              alt={animal.name}
              className="h-52 w-full rounded-2xl border border-orange-100 object-cover"
            />

            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-[#7F1D1D]">{animal.name}</h2>
                  <p className="text-sm text-gray-600">
                    {animal.breed} · {animal.species} · {animal.age} yrs · {animal.gender} · {animal.size}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      passport?.spayedNeutered
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {passport?.spayedNeutered ? "Spayed / Neutered" : "Not Spayed / Neutered"}
                  </span>
                  <span className="rounded-full bg-[#FFE4C7] px-3 py-1 text-xs font-semibold text-[#7F1D1D]">
                    {animal.healthStatus || "Health Logged"}
                  </span>
                </div>
              </div>

              {/* Key Vital Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-orange-100 bg-[#FFF7ED] p-3">
                  <p className="text-xs font-semibold text-gray-500">Microchip ID</p>
                  <p className="mt-1 font-mono text-sm font-bold text-[#7F1D1D]">
                    {passport?.microchipId || "Not registered"}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-[#FFF7ED] p-3">
                  <p className="text-xs font-semibold text-gray-500">Blood Group</p>
                  <p className="mt-1 text-sm font-bold text-[#7F1D1D]">
                    {passport?.bloodGroup || "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-[#FFF7ED] p-3">
                  <p className="text-xs font-semibold text-gray-500">Weight</p>
                  <p className="mt-1 text-sm font-bold text-[#7F1D1D]">
                    {passport?.weightKg !== null && passport?.weightKg !== undefined
                      ? `${passport.weightKg} kg`
                      : "Not recorded"}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-[#FFF7ED] p-3">
                  <p className="text-xs font-semibold text-gray-500">Shelter / Custodian</p>
                  <p className="mt-1 text-sm font-bold text-[#7F1D1D]">
                    {animal.shelter?.name || "Shelter"}
                  </p>
                </div>
              </div>

              {/* Allergies, Chronic Conditions & Dietary Notes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Allergies</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {passport?.allergies?.length ? (
                      passport.allergies.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None reported</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Chronic Conditions
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {passport?.chronicConditions?.length ? (
                      passport.chronicConditions.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              {(passport?.dietaryNotes || passport?.emergencyVetContact?.phone || passport?.emergencyVetContact?.clinicName) && (
                <div className="grid gap-3 rounded-xl border border-orange-100 bg-[#FFF7ED]/70 p-3.5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Dietary & Care Notes
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      {passport?.dietaryNotes || "Standard diet"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Emergency Vet Contact
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#7F1D1D]">
                      <Phone className="h-3.5 w-3.5 text-[#DC2626]" />
                      {passport?.emergencyVetContact?.clinicName || "Clinic not set"}
                      {passport?.emergencyVetContact?.phone
                        ? ` · ${passport.emergencyVetContact.phone}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-100 bg-[#FFF7ED] px-6 py-3 text-xs font-semibold text-[#7F1D1D]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Syringe className="h-4 w-4 text-[#F97316]" />
                {summary?.vaccinationCount || 0} Vaccinations
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-[#DC2626]" />
                {summary?.medicalRecordCount || 0} Medical Records
              </span>
              {summary?.overdueCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {summary.overdueCount} Overdue
                </span>
              )}
              {summary?.dueSoonCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-800">
                  <Clock className="h-3.5 w-3.5" />
                  {summary.dueSoonCount} Due Soon
                </span>
              )}
            </div>
            {passport?.updatedAt && (
              <span className="text-gray-500">
                Last updated {formatDate(passport.updatedAt)}
                {passport.lastUpdatedBy?.name ? ` by ${passport.lastUpdatedBy.name}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Inline Health Info Editor */}
        {canEdit && editingInfo && (
          <form
            onSubmit={handleSaveInfo}
            className="rounded-2xl border border-[#FDBA74] bg-white p-6 shadow-sm print:hidden"
          >
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#7F1D1D]">
              <HeartPulse className="h-5 w-5 text-[#DC2626]" />
              Update Pet Health Baseline
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Microchip ID</label>
                <input
                  type="text"
                  placeholder="e.g. 985112009876543"
                  value={infoForm.microchipId}
                  onChange={(e) => setInfoForm((f) => ({ ...f, microchipId: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Blood Group</label>
                <input
                  type="text"
                  placeholder="e.g. DEA 1.1+ / Type A"
                  value={infoForm.bloodGroup}
                  onChange={(e) => setInfoForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 12.5"
                  value={infoForm.weightKg}
                  onChange={(e) => setInfoForm((f) => ({ ...f, weightKg: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chicken, Pollen"
                  value={infoForm.allergies}
                  onChange={(e) => setInfoForm((f) => ({ ...f, allergies: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Chronic Conditions (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild asthma"
                  value={infoForm.chronicConditions}
                  onChange={(e) =>
                    setInfoForm((f) => ({ ...f, chronicConditions: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#7F1D1D]">
                  <input
                    type="checkbox"
                    checked={infoForm.spayedNeutered}
                    onChange={(e) =>
                      setInfoForm((f) => ({ ...f, spayedNeutered: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-[#DC2626]"
                  />
                  Spayed / Neutered
                </label>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Emergency Vet Clinic
                </label>
                <input
                  type="text"
                  placeholder="Clinic name"
                  value={infoForm.emergencyClinicName}
                  onChange={(e) =>
                    setInfoForm((f) => ({ ...f, emergencyClinicName: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Emergency Vet Phone
                </label>
                <input
                  type="text"
                  placeholder="01700-000000"
                  value={infoForm.emergencyPhone}
                  onChange={(e) => setInfoForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Dietary & Special Care Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Feeding schedule, medications, special care..."
                  value={infoForm.dietaryNotes}
                  onChange={(e) => setInfoForm((f) => ({ ...f, dietaryNotes: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingInfo(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D] disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        )}

        {/* Vaccinations Section */}
        <div className="rounded-2xl border border-[#FFE4C7] bg-white p-6 shadow-sm print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-[#F97316]" />
              <h2 className="text-xl font-extrabold text-[#7F1D1D]">Vaccination Records</h2>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowVaxForm((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#F97316] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#DC2626] print:hidden"
              >
                {showVaxForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showVaxForm ? "Close" : "Add Vaccination"}
              </button>
            )}
          </div>

          {canEdit && showVaxForm && (
            <form
              onSubmit={handleAddVaccination}
              className="mt-4 grid gap-3 rounded-xl border border-orange-200 bg-[#FFF7ED] p-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Vaccine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rabies, DHPP, FVRCP"
                  value={vaxForm.name}
                  onChange={(e) => setVaxForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Date Administered *
                </label>
                <input
                  type="date"
                  required
                  value={vaxForm.dateAdministered}
                  onChange={(e) =>
                    setVaxForm((f) => ({ ...f, dateAdministered: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={vaxForm.nextDueDate}
                  onChange={(e) => setVaxForm((f) => ({ ...f, nextDueDate: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Vet Name</label>
                <input
                  type="text"
                  placeholder="Dr. ..."
                  value={vaxForm.vetName}
                  onChange={(e) => setVaxForm((f) => ({ ...f, vetName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Clinic Name</label>
                <input
                  type="text"
                  placeholder="Clinic"
                  value={vaxForm.clinicName}
                  onChange={(e) => setVaxForm((f) => ({ ...f, clinicName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Batch / Lot Number
                </label>
                <input
                  type="text"
                  placeholder="Batch #"
                  value={vaxForm.batchNumber}
                  onChange={(e) => setVaxForm((f) => ({ ...f, batchNumber: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Notes</label>
                <input
                  type="text"
                  placeholder="Optional booster or reaction notes"
                  value={vaxForm.notes}
                  onChange={(e) => setVaxForm((f) => ({ ...f, notes: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Vaccination"}
                </button>
              </div>
            </form>
          )}

          {vaccinations.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No vaccination records logged yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {vaccinations.map((vax) => {
                const status = getVaxStatus(vax.nextDueDate);
                const StatusIcon = status.icon;
                return (
                  <div
                    key={vax._id}
                    className="flex flex-col justify-between rounded-xl border border-orange-100 bg-[#FFF7ED]/50 p-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#7F1D1D]">{vax.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.style}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p>
                          <span className="font-semibold text-gray-700">Administered:</span>{" "}
                          {formatDate(vax.dateAdministered)}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">Next Due:</span>{" "}
                          {formatDate(vax.nextDueDate)}
                        </p>
                        {(vax.vetName || vax.clinicName) && (
                          <p>
                            <span className="font-semibold text-gray-700">Provider:</span>{" "}
                            {[vax.vetName, vax.clinicName].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {vax.batchNumber && (
                          <p>
                            <span className="font-semibold text-gray-700">Batch:</span>{" "}
                            <span className="font-mono">{vax.batchNumber}</span>
                          </p>
                        )}
                        {vax.notes && <p className="italic text-gray-500">{vax.notes}</p>}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="mt-3 flex justify-end print:hidden">
                        <button
                          onClick={() => handleDeleteVaccination(vax._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Medical History & Treatments Section */}
        <div className="rounded-2xl border border-[#FFE4C7] bg-white p-6 shadow-sm print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-[#DC2626]" />
              <h2 className="text-xl font-extrabold text-[#7F1D1D]">
                Medical History & Treatments
              </h2>
            </div>

            {canEdit && (
              <button
                onClick={() => setShowRecordForm((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#DC2626] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#7F1D1D] print:hidden"
              >
                {showRecordForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showRecordForm ? "Close" : "Add Medical Record"}
              </button>
            )}
          </div>

          {canEdit && showRecordForm && (
            <form
              onSubmit={handleAddRecord}
              className="mt-4 grid gap-3 rounded-xl border border-orange-200 bg-[#FFF7ED] p-4 sm:grid-cols-2 lg:grid-cols-3 print:hidden"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Wellness Checkup"
                  value={recordForm.title}
                  onChange={(e) => setRecordForm((f) => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Type</label>
                <select
                  value={recordForm.recordType}
                  onChange={(e) => setRecordForm((f) => ({ ...f, recordType: e.target.value }))}
                  className={inputClass}
                >
                  {RECORD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Date *</label>
                <input
                  type="date"
                  required
                  value={recordForm.date}
                  onChange={(e) => setRecordForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Vet Name</label>
                <input
                  type="text"
                  placeholder="Dr. ..."
                  value={recordForm.vetName}
                  onChange={(e) => setRecordForm((f) => ({ ...f, vetName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Clinic Name</label>
                <input
                  type="text"
                  placeholder="Clinic"
                  value={recordForm.clinicName}
                  onChange={(e) => setRecordForm((f) => ({ ...f, clinicName: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Diagnosis</label>
                <input
                  type="text"
                  placeholder="Findings or diagnosis"
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm((f) => ({ ...f, diagnosis: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Medication / Treatment Given
                </label>
                <input
                  type="text"
                  placeholder="Prescription, dosage, or procedure"
                  value={recordForm.medication}
                  onChange={(e) => setRecordForm((f) => ({ ...f, medication: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="mb-1 block text-xs font-semibold text-gray-600">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Follow-up instructions or observations"
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm((f) => ({ ...f, notes: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white hover:bg-[#7F1D1D] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Medical Record"}
                </button>
              </div>
            </form>
          )}

          {medicalRecords.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No medical history records logged yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {medicalRecords.map((rec) => (
                <div
                  key={rec._id}
                  className="rounded-xl border border-orange-100 bg-[#FFF7ED]/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          RECORD_BADGE[rec.recordType] || RECORD_BADGE.Other
                        }`}
                      >
                        {rec.recordType}
                      </span>
                      <h3 className="font-bold text-[#7F1D1D]">{rec.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">
                        {formatDate(rec.date)}
                      </span>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteRecord(rec._id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 print:hidden"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 grid gap-1.5 text-xs text-gray-600 sm:grid-cols-2">
                    {(rec.vetName || rec.clinicName) && (
                      <p>
                        <span className="font-semibold text-gray-700">Vet / Clinic:</span>{" "}
                        {[rec.vetName, rec.clinicName].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {rec.diagnosis && (
                      <p>
                        <span className="font-semibold text-gray-700">Diagnosis:</span>{" "}
                        {rec.diagnosis}
                      </p>
                    )}
                    {rec.medication && (
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-gray-700">Medication / Treatment:</span>{" "}
                        {rec.medication}
                      </p>
                    )}
                    {rec.notes && (
                      <p className="sm:col-span-2 italic text-gray-500">{rec.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
