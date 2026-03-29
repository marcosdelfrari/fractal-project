const express = require("express");

const router = express.Router();

const { uploadLimiter } = require("../middleware/rateLimiter");

const {
  getSiteSettings,
  updateSiteSettings,
  getHomeSections,
  uploadSiteAsset,
  uploadSectionAsset,
  updateHomeSection,
  updateSectionsOrder,
  toggleSection,
} = require("../controllers/settings");

// Site settings routes
router.route("/site").get(getSiteSettings).put(updateSiteSettings);
router.post("/site/upload", uploadLimiter, uploadSiteAsset);
router.post("/sections/upload", uploadLimiter, uploadSectionAsset);

// Home sections routes
router
  .route("/home-sections")
  .get(getHomeSections)
  .post(updateHomeSection);

// Update sections order
router.route("/home-sections/order").put(updateSectionsOrder);

// Toggle section
router.route("/home-sections/:id/toggle").put(toggleSection);

module.exports = router;
