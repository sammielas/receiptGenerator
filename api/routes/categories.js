const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Category = require("../models/category");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Category.find()
    .select("product name items _id")
    .populate("product", "name", "price")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        category: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            name: doc.name,
            items: doc.items,
            request: {
              type: "GET",
              url: "http://localhost:3000/categories/" + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
router.post("/", (req, res, next) => {
  const category = new Category({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    items: req.body.items,
  });
  category
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created Category successfully",
        createdCategory: {
          name: result.name,
          items: result.items,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/categories/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:categoryId", (req, res, next) => {
  Category.findById(req.params.categoryId)
    .populate("product", "name", "price")
    .exec()
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          message: "Category does not exist",
        });
      }
      res.status(200).json({
        category: category,
        request: { type: "GET", url: "http://localhost:3000/categories" },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
router.patch("/:categoryId", (req, res, next) => {
  const id = req.params.categoryId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Category.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Category updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/categories/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:categoryId", (req, res, next) => {
  const id = req.params.categoryId;
  Category.remove({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Category deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/categories",
          body: { name: "String", items: ["String"] },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
