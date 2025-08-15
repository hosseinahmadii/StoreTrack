const db = require("../models");
const Category = db.Category;

exports.create = (req, res) => {
  if (!req.body.name) {
    res.status(400).send({ message: "Category name can not be empty!" });
    return;
  }
  const category = {
    name: req.body.name,
  };

  Category.create(category)    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while creating the Category." });
    });
};

exports.findAll = (req, res) => {
  Category.findAll({
      order: [['createdAt', 'DESC']]
    })
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while retrieving categories." });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;
  Category.findByPk(id)
    .then(data => {
      if (data) {
        res.status(200).send(data);
      } else {
        res.status(404).send({ message: `Cannot find Category with id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving Category with id=" + id });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;
  Category.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.status(200).send({ message: "Category was updated successfully." });
      } else {
        res.status(404).send({ message: `Cannot update Category with id=${id}. Maybe Category was not found or req.body is empty!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error updating Category with id=" + id });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  Category.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.status(200).send({ message: "Category was deleted successfully!" });
      } else {
        res.status(404).send({ message: `Cannot delete Category with id=${id}. Maybe Category was not found!` });
      }
    })    .catch(err => {
      res.status(500).send({ message: "Could not delete Category with id=" + id });
    });
};