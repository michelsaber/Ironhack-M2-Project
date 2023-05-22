const express = require("express");
const FestivalModel = require("../models/Festival.model");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAuthor = require("../middlewares/isAuthor");
const fileUploader = require("../config/cloudinary.config");
const UserModel = require("../models/User.model");
const ArtistModel = require("../models/Artist.model");

//route to list with all festivals
router.get("/festival/festival-list", async (req, res, next) => {
  try {
    const allFestivals = await FestivalModel.find().lean();

    const allFestivalsMapped = allFestivals.map((festival) => {
      if (festival.date) {
        festival.date = festival.date.toDateString();
      }
      return festival;
    });

    res.render("festival/festival-all", { allFestivals: allFestivalsMapped });
  } catch {
    res.send("Oops, an error, go back");
  }
});

//routes to create a festival
router.get("/festival/create", isLoggedIn, async (req, res) => {
  const artists = await ArtistModel.find();
  res.render("festival/festival-create", { artists });
});

//post route for the form to create a festival
router.post(
  "/festival/create",
  isLoggedIn,
  fileUploader.single("festivalImg"),
  async (req, res) => {
    const { name, location, date, ticketPrice, info, lineup } = req.body;
    const authorsName = req.session.user.username;
    const author = await UserModel.findOne({ username: authorsName });
    // const authorsId = author._id;

    console.log("LOGGED USER", author);
    // console.log("LOGGED USER'S ID", authorsId);

    try {
      const newFestival = await FestivalModel.create({
        name,
        location,
        date,
        ticketPrice,
        info,
        festivalImg: req.file.path,
        lineup,
        author: author,
      });

      const pushingToUser = await UserModel.findByIdAndUpdate(author, {
        $push: { eventsCreated: newFestival._id },
      });
      console.log("NEW FESTIVAL", newFestival);
      res.redirect("/festival/festival-list");
    } catch (err) {
      res.redirect("/festival/create");
      console.log("Error while trying to create an event", err);
    }
  }
);

router.get("/festival/:festivalID", async (req, res) => {
  const { festivalID } = req.params;
  const currentFestival = await FestivalModel.findById(festivalID).populate(
    "author"
  );
  const populatedLineup = await FestivalModel.findById(festivalID).populate(
    "lineup"
  );
  console.log("populated lineup", populatedLineup);
  const parsedDate = currentFestival.date.toDateString();
  console.log("current festival", currentFestival);
  res.render("festival/festival-detail", {
    currentFestival,
    populatedLineup,
    parsedDate,
  });
});

router.get("/festival/:festivalID/edit", isLoggedIn, isAuthor, async (req, res) => {
  //later, if we add artists, we have to add here .populate("lineup")
  const { festivalID } = req.params;
  const festivalToEdit = await FestivalModel.findById(festivalID);
  // const allArtists = await ArtistModel.find(); this is to be added later if we have artists

  res.render("festival/festival-edit", { festivalToEdit });
});

//route to receive edit festival form and update the festival
router.post("/festival/:festivalID", isLoggedIn, async (req, res) => {
  const { festivalID } = req.params;
  const updatedFestival = await FestivalModel.findByIdAndUpdate(
    { _id: festivalID },
    req.body
  );
  res.redirect(`/festival/${festivalID}`);
});

// route to delete a festival
router.post("/festival/:festivalID/delete", isLoggedIn, isAuthor, async (req, res) => {
  try {
    const { festivalID } = req.params;
    await FestivalModel.findByIdAndDelete(festivalID);
    res.redirect("/festival/festival-list");
  } catch (err) {
    console.log("festival delete post error", err);
    res.send("Oops, problem while deleting, try again.");
  }
});

module.exports = router;
