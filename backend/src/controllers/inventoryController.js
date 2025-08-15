
const { InventoryMovement, Product } = require('../models');

exports.createMovement = async (req, res) => {
  try {
    const { productId, type, quantity, note } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (type === 'IN') {
      product.stock += quantity;
    } else if (type === 'OUT') {
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Not enough stock' });
      }
      product.stock -= quantity;
    } else {
      return res.status(400).json({ message: 'Invalid movement type' });
    }

    await product.save();

    const movement = await InventoryMovement.create({
      productId,
      type,
      quantity,
      note
    });

    res.status(201).json(movement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating inventory movement' });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const movements = await InventoryMovement.findAll({
      include: [{ model: Product, as: 'product', attributes: ['name'] }],
      order: [['date', 'DESC']]
    });
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching movements' });
  }
};