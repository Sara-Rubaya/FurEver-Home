import mongoose from &quot;mongoose&quot;;
// Vet clinic schema - FR05 (Vet Near Me), pore FR07/FR08 o eita use korbe
const vetClinicSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
address: { type: String, required: true },
location: {
lat: { type: Number, required: true },
lng: { type: Number, required: true },
},
phone: { type: String, required: true },
openingHours: { type: String, default: &quot;&quot; },
services: { type: String, default: &quot;&quot; }, // comma separated, jemon &quot;Vaccination, Surgery&quot;
emergencyAvailable: { type: Boolean, default: false },
},
{ timestamps: true }
);
export default mongoose.model(&quot;VetClinic&quot;, vetClinicSchema);