const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Stock = require("../models/stock");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Stock.find()
    .select("product quantity _id")
    .populate("product", "name")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        stocks: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/stocks/" + doc._id,
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
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const stock = new Stock({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return stock.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Stock Stored",
        createdStock: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/stocks/" + result._id,
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
router.get("/:stockId", (req, res, next) => {
  Stock.findById(req.params.stockId)
    .populate("product", "name")
    .exec()
    .then((stock) => {
      if (!stock) {
        return res.status(404).json({
          message: "Stock empty",
        });
      }
      res.status(200).json({
        stock: stock,
        request: { type: "GET", url: "http://localhost:3000/stocks" },
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});
router.patch("/:stockId", (req, res, next) => {
  const id = req.params.stockId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Stock.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Stock updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/stocks/" + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
