import express from &quot;express&quot;;
import { getNearbyVets, getAllVets, createVet, deleteVet } from &quot;../controllers/vetController.js&quot;;
import { protect } from &quot;../middleware/authMiddleware.js&quot;;
import { authorize } from &quot;../middleware/roleMiddleware.js&quot;;
const router = express.Router();
// Public
router.get(&quot;/nearby&quot;, getNearbyVets); // &quot;/:id&quot; er age thakte hobe
router.get(&quot;/&quot;, getAllVets);
// Admin only
router.post(&quot;/&quot;, protect, authorize(&quot;admin&quot;), createVet);
router.delete(&quot;/:id&quot;, protect, authorize(&quot;admin&quot;), deleteVet);
export default router;