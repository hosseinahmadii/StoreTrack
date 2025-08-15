const db = require('../models');
const { Op } = require('sequelize');

const Order = db.Order;
const OrderItem = db.OrderItem;
const Product = db.Product;

exports.getSalesReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const statusesToFetch = ['Shipped', 'Completed', 'Cancelled'];

    console.log(`۱. در حال جستجوی سفارشات با وضعیت: ${statusesToFetch.join(', ')}`);

    const orders = await Order.findAll({
      where: {
        status: { [Op.in]: statusesToFetch },
      },
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price']
        }]
      }]
    });

    console.log(`۲. تعداد کل سفارشات پیدا شده (بدون فیلتر تاریخ): ${orders.length}`);
    if (orders.length > 0) {
      console.log('نمونه سفارشات پیدا شده:', JSON.stringify(orders.map(o => ({ id: o.id, status: o.status, date: o.createdAt })), null, 2));
    }

    let salesStats = {};
    let returnStats = {};
    let totalOrders = orders.length;
    let totalRevenue = 0;

    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!item.product) return;
        const pname = item.product.name;
        const itemPrice = item.priceAtOrder || item.product.price || 0;

        if (order.status === 'Shipped' || order.status === 'Completed') {
          totalRevenue += itemPrice * item.quantity;
          if (!salesStats[pname]) {            salesStats[pname] = { soldQuantity: 0, totalRevenue: 0 };
          }
          salesStats[pname].soldQuantity += item.quantity;
          salesStats[pname].totalRevenue += itemPrice * item.quantity;
        }

        if (order.status === 'Cancelled') {
          if (!returnStats[pname]) {
            returnStats[pname] = { returnedQuantity: 0, totalRefund: 0 };
          }
          returnStats[pname].returnedQuantity += item.quantity;
          returnStats[pname].totalRefund += itemPrice * item.quantity;
        }
      });
    });

    const sales = Object.keys(salesStats).map(name => ({      name,
      soldQuantity: salesStats[name].soldQuantity,
      totalRevenue: salesStats[name].totalRevenue
    }));

    const returns = Object.keys(returnStats).map(name => ({
      name,
      returnedQuantity: returnStats[name].returnedQuantity,
      totalRefund: returnStats[name].totalRefund
    }));

    const responseStartDate = startDate ? new Date(startDate) : new Date();
    const responseEndDate = endDate ? new Date(endDate) : new Date();

    res.json({
      startDate: responseStartDate,
      endDate: responseEndDate,
      totalRevenue,
      totalOrders,
      sales,
      returns
    });
  } catch (error) {
    console.error('!!! خطا در salesReportController:', error);
    res.status(500).json({ message: error.message });
  }
};