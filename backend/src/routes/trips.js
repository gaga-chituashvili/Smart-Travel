import { Router } from "express";
import { authenticateToken, requireTripAccess } from "../middleware/auth.js";
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  inviteMember,
  joinTrip,
  addDay,
  addActivity,
  updateActivity,
  deleteActivity,
  reorderActivities,
} from "../controllers/trips.controller.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getTrips);
router.post("/", createTrip);
router.get("/:id", getTrip);
router.patch("/:id", await requireTripAccess(["OWNER", "EDITOR"]), updateTrip);
router.delete("/:id", await requireTripAccess(["OWNER"]), deleteTrip);
router.post(
  "/:id/invite",
  await requireTripAccess(["OWNER", "EDITOR"]),
  inviteMember,
);
router.post("/join/:token", joinTrip);

// Itinerary
router.post(
  "/:tripId/days",
  await requireTripAccess(["OWNER", "EDITOR"]),
  addDay,
);
router.post(
  "/:tripId/days/:dayId/activities",
  await requireTripAccess(["OWNER", "EDITOR"]),
  addActivity,
);
router.patch(
  "/:tripId/days/:dayId/activities/:actId",
  await requireTripAccess(["OWNER", "EDITOR"]),
  updateActivity,
);
router.delete(
  "/:tripId/days/:dayId/activities/:actId",
  await requireTripAccess(["OWNER", "EDITOR"]),
  deleteActivity,
);
router.post(
  "/:tripId/days/:dayId/reorder",
  await requireTripAccess(["OWNER", "EDITOR"]),
  reorderActivities,
);

export default router;
