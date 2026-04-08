const express = require("express");

const router = express.Router();

const { uploadLimiter } = require("../middleware/rateLimiter");

const { requireAdmin } = require("../middleware/auth");

const {
  getPublicSiteSettings,
  getSiteSettings,
  updateSiteSettings,
  getHomeSections,
  uploadSiteAsset,
  uploadSectionAsset,
  updateHomeSection,
  updateSectionsOrder,
  toggleSection,
} = require("../controllers/settings");

// Vitrine: DTO + cache (sem auth)
router.get("/public", getPublicSiteSettings);
router.head("/public", getPublicSiteSettings);

// Site settings — leitura completa e mutações só admin (JWT no Express)
router.route("/site").get(requireAdmin, getSiteSettings).put(requireAdmin, updateSiteSettings);
router.post("/site/upload", uploadLimiter, requireAdmin, uploadSiteAsset);
router.post("/sections/upload", uploadLimiter, requireAdmin, uploadSectionAsset);

// Home sections routes — leitura pública; mutações admin
router
  .route("/home-sections")
  .get(getHomeSections)
  .post(requireAdmin, updateHomeSection);

// Update sections order
router.route("/home-sections/order").put(requireAdmin, updateSectionsOrder);

// Toggle section
router.route("/home-sections/:id/toggle").put(requireAdmin, toggleSection);

module.exports = router;
