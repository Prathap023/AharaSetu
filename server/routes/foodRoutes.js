const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const foodController = require("../controllers/foodController");

const {
  createListing,
  getAllListings,
  getAdminListings,
  adminApproveListing,
  adminRejectListing,
  claimListing,
  makePayment,
  restaurantApprove,
  restaurantReject,
  getMyListings,
  getMyClaimedListings,
  restaurantProvided,
  volunteerPickedUp,
  adminComplete,
  getPaymentIntent,
} = foodController;

// ================= PUBLIC =================
router.get("/", getAllListings);

// ================= RESTAURANT =================
router.post("/", protect, createListing);

router.get("/my-listings", protect, getMyListings);

router.put(
  "/approve-claim/:id",
  protect,
  restaurantApprove
);

router.put(
  "/reject-claim/:id",
  protect,
  restaurantReject
);

router.put(
  "/restaurant-provided/:id",
  protect,
  restaurantProvided
);

// ================= VOLUNTEER / NGO =================
router.put("/claim/:id", protect, claimListing);

router.put("/pay/:id", protect, makePayment);

router.get("/my-claims", protect, getMyClaimedListings);

router.get(
  "/get-payment-intent/:id",
  protect,
  getPaymentIntent
);

router.put(
  "/volunteer-pickedup/:id",
  protect,
  volunteerPickedUp
);

// ================= ADMIN =================
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminListings
);

router.put(
  "/admin/approve/:id",
  protect,
  adminOnly,
  adminApproveListing
);

router.put(
  "/admin/reject/:id",
  protect,
  adminOnly,
  adminRejectListing
);

router.put(
  "/admin/complete/:id",
  protect,
  adminOnly,
  adminComplete
);

module.exports = router;