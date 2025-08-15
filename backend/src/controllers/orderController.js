const db = require('../models');
const { Op } = require('sequelize');

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;
const InventoryMovement = db.InventoryMovement;

// =======================
// Helper: Create Order (FIXED VERSION)
// =======================
const processOrderTransaction = async (orderData, res) => {
  const t = await db.sequelize.transaction();
  try {
    const newOrder = await Order.create({
      status: 'Pending', 
      customerName: orderData.customerName,
      orderDate: new Date()
    }, { transaction: t });    let totalOrderAmount = 0;
    const orderItemsToCreate = [];

    for (const item of orderData.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}`);
      }

      orderItemsToCreate.push({
        orderId: newOrder.id,
        productId: product.id,
        quantity: item.quantity,
        priceAtOrder: product.price
      });

      totalOrderAmount += item.quantity * product.price;
    }

    await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });
    await newOrder.update({ totalAmount: totalOrderAmount }, { transaction: t });

    await t.commit();

    const createdOrderWithItems = await Order.findByPk(newOrder.id, {
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }]
      }],
    });

    res.status(201).json(createdOrderWithItems);
  } catch (error) {
    await t.rollback();
    console.error('Error creating order:', error);
    res.status(400).json({ message: error.message || 'Error creating order.' });
  }
};



exports.create = async (req, res) => {
  const { items, customerName } = req.body;
  if (!items || items.length === 0) {    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }
  if (!customerName || customerName.trim() === '') {
    return res.status(400).json({ message: 'Customer name is required.' });
  }
  await processOrderTransaction({ items, customerName }, res);
};



exports.findAll = async (req, res) => {
  try {
    const { customerName, status, startDate, endDate } = req.query;
    const whereClause = {};

    if (customerName) {
      whereClause.customerName = { [Op.iLike]: `%${customerName}%` };
    }
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && end) whereClause.orderDate = { [Op.between]: [start, end] };
      else if (start) whereClause.orderDate = { [Op.gte]: start };
      else if (end) whereClause.orderDate = { [Op.lte]: end };
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }]
      }],
      order: [['orderDate', 'DESC']]    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
};



exports.findOne = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'description'] }]      }]
    });
    if (!order) {
      return res.status(404).json({ message: `Order with id=${req.params.id} not found.` });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error retrieving order:', error);
    res.status(500).json({ message: 'Error retrieving order.' });
  }
};



exports.updateStatus = async (req, res) => {
  const { status: newStatus } = req.body;
  const validStatuses = ['Pending', 'Shipped', 'Cancelled'];

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: 'Invalid order status.' });
  }

  const t = await db.sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'orderItems' }],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: `Order with id=${req.params.id} not found.` });
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
        await t.commit();
        return res.status(200).json({ message: `Order status is already ${newStatus}.`});
    }

    if (newStatus === 'Shipped' && oldStatus === 'Pending') {
      for (const item of order.orderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (product.quantity < item.quantity) {          throw new Error(`Insufficient stock for product ${product.name} to ship.`);
        }
        await Product.update(
          { quantity: product.quantity - item.quantity },
          { where: { id: item.productId }, transaction: t }
        );
        await InventoryMovement.create({
          productId: item.productId,
          type: 'OUT',
          quantity: item.quantity,
          note: `Shipped in Order #${order.id}`
        }, { transaction: t });
      }
    } else if (newStatus === 'Cancelled' && oldStatus === 'Shipped') {
      for (const item of order.orderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        await Product.update(
          { quantity: product.quantity + item.quantity },
          { where: { id: item.productId }, transaction: t }
        );
        await InventoryMovement.create({
          productId: item.productId,
          type: 'IN',
          quantity: item.quantity,          note: `Returned from cancelled Order #${order.id}`
        }, { transaction: t });
      }
    }

    order.status = newStatus;
    await order.save({ transaction: t });    await t.commit();
    res.status(200).json({ message: 'Order status updated successfully.' });
  } catch (error) {
    await t.rollback();
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status.', details: error.message });
  }
};