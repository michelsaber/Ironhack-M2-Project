const express = require("express");
const FestivalModel = require("../models/Festival.model");
const router = express.Router();

//route to list with all festivals
router.get("/festival/festival-list", async (req, res, next) => {
    try {
        const allFestivals = await FestivalModel.find();
        res.render("festival/festival-all", { allFestivals }); 
    } catch {
        res.send("Oops, an error, go back"); 
    }
  });

  //routes to create a festival
  router.get("/festival/create", (req, res) => {
    res.render("festival/festival-create");
  });
  
  //post route for the form to create a festival
  router.post("/festival/create", async (req, res) => {
    try {
        
      const newFestival = await FestivalModel.create(req.body);
      console.log("NEW FESTIVAL", newFestival);
      res.redirect("/festival/festival-list"); 
    } catch (err) {
      res.redirect("/festival/create");
      console.log("Error while trying to create an event", err);
    }
  });

  router.get("/festival/:festivalID", async (req, res) => {
    const { festivalID } = req.params;
    //later, if we add artists, we have to add here .populate("lineup") 
    const currentFestival = await FestivalModel.findById(festivalID);
    console.log("current festival", currentFestival); 
    res.render("festival/festival-detail", { currentFestival });
  }); 

  router.get("/festival/:festivalID/edit", async(req,res) => {

    //later, if we add artists, we have to add here .populate("lineup")
    const { festivalID } = req.params;
    const festivalToEdit = await FestivalModel.findById(festivalID);
    // const allArtists = await ArtistModel.find(); this is to be added later if we have artists
  
    res.render("festival/festivsl-edit", { festivalToEdit } );
  });

  //route to receive edit festival form and update the movie
  router.post("/festival/:festivalID", async(req,res) => {
    const { festivalID } = req.params;
    const updatedFestivsl = await FestivalModel.findByIdAndUpdate( { _id: festivalID }, req.body);
    res.redirect(`/festival/${festivalID}`);
  });

  // route to delete a festival
  router.post("/festival/:festivalID/delete", async (req, res) => {
    try {
  
      const { festivalID } = req.params;
      await FestivalModel.findByIdAndDelete(festivalID);
      res.redirect("/festival/festival-list");
    
    } catch (err) {
      console.log("festival delete post error", err);
      res.send ("Oops, problem while deleting, try again.");
    }
  });




module.exports = router;
