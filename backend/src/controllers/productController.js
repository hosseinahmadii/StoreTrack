const db = require("../models");
const Product = db.Product;
const Category = db.Category;
const InventoryMovement = db.InventoryMovement;
const { Op } = require('sequelize');


exports.create = (req, res) => {
  if (!req.body.name || !req.body.price || !req.body.quantity || !req.body.categoryId) {
    res.status(400).send({ message: "Name, price, quantity, and categoryId are required!" });
    return;
  }

  const product = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    categoryId: req.body.categoryId
  };

  db.sequelize.transaction(t => {
      return Product.create(product, { transaction: t })
        .then(data => {
          return InventoryMovement.create({
            productId: data.id,
            type: 'IN',
            quantity: data.quantity,
            sourceDocumentType: 'Initial Stock',
            notes: 'Initial stock on product creation'
          }, { transaction: t }).then(() => data);
        });
    })
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while creating the Product." });
    });
};

exports.findAll = (req, res) => {
  const { name, categoryId } = req.query;
  let condition = {};

  if (name) {
    condition[Op.or] = [
      { name: { [Op.iLike]: `%${name}%` } },
      { description: { [Op.iLike]: `%${name}%` } }
    ];  }

  if (categoryId) {
    condition.categoryId = categoryId;
  }

  Product.findAll({
      where: condition,
      include: [{
        model: Category,
        as: 'Category',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    })
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving products." });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  Product.findByPk(id, {
      include: [{
        model: Category,
        as: 'Category',
        attributes: ['id', 'name']
      }]
    })
    .then(data => {
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(404).send({ message: `Cannot find Product with id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Product with id=" + id });
    });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const { quantity, ...otherUpdates } = req.body;

  const t = await db.sequelize.transaction();

  try {
    const product = await Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).send({ message: `Cannot update Product with id=${id}. Maybe Product was not found!` });
    }

    let updatedQuantity = product.quantity;
    if (quantity !== undefined && quantity !== product.quantity) {
      const quantityChange = quantity - product.quantity;
      const movementType = quantityChange > 0 ? 'IN' : 'OUT';
      const absQuantityChange = Math.abs(quantityChange);

      if (absQuantityChange > 0) {
        await InventoryMovement.create({
          productId: id,
          type: movementType,
          quantity: absQuantityChange,
          sourceDocumentType: 'Manual Adjustment',
          notes: `Stock adjusted manually. Old quantity: ${product.quantity}, New quantity: ${quantity}`
        }, { transaction: t });
      }
      updatedQuantity = quantity;
    }

    const num = await Product.update({ ...otherUpdates, quantity: updatedQuantity }, { where: { id: id }, transaction: t });

    if (num[0] === 1) {
      await t.commit();
      res.status(200).send({ message: "Product was updated successfully and stock movement logged." });
    } else {
      await t.rollback();
      res.status(404).send({ message: `Cannot update Product with id=${id}. Maybe Product was not found or req.body is empty!` });
    }
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message || "Error updating Product with id=" + id });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  const t = await db.sequelize.transaction();
  try {
    await InventoryMovement.destroy({ where: { productId: id }, transaction: t });
    const num = await Product.destroy({ where: { id: id }, transaction: t });

    if (num === 1) {
      await t.commit();
      res.status(200).send({ message: "Product and its inventory movements were deleted successfully!" });
    } else {
      await t.rollback();
      res.status(404).send({ message: `Cannot delete Product with id=${id}. Maybe Product was not found!` });
    }
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: "Could not delete Product with id=" + id });
  }
};