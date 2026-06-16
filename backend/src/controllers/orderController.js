const db = require('../config/database');
const logger = require('../utils/logger');

const orderController = {
  async createOrder(req, res) {
    try {
      const { items, total, customer_name } = req.body;
      const user_id = req.user.id;
      
      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items are required' });
      }
      if (!total || isNaN(total) || total <= 0) {
        return res.status(400).json({ error: 'Valid total is required' });
      }
      if (!user_id) {
        return res.status(400).json({ error: 'User authentication required' });
      }
      
      const order_id = 'ORD' + Date.now();
      const finalCustomerName = String(customer_name || 'Guest Customer');
      const finalTotal = parseFloat(total) || 0;
      const userId = parseInt(user_id) || null;
      
      if (!userId) {
        return res.status(400).json({ error: 'Invalid user authentication' });
      }
      
      // Insert order
      await db.execute(
        'INSERT INTO orders (order_id, user_id, customer_name, total, status) VALUES (?, ?, ?, ?, ?)',
        [order_id, userId, finalCustomerName, finalTotal, 'pending']
      );
      
      // Validate all item IDs first
      const parsedItems = items.map(item => {
        const itemId = parseInt(item.id);
        if (!itemId || itemId <= 0) throw new Error(`Invalid product ID: ${item.id}`);
        const itemQuantity = parseInt(item.quantity) || 1;
        const itemPrice = parseFloat(item.price) || 0;
        const finalPrice = (item.discount && !isNaN(parseFloat(item.discount)))
          ? itemPrice * (1 - parseFloat(item.discount) / 100)
          : itemPrice;
        return { itemId, itemQuantity, finalPrice };
      });

      // Batch fetch all products in one query
      const productIds = parsedItems.map(i => i.itemId);
      const placeholders = productIds.map(() => '?').join(',');
      const [productRows] = await db.execute(
        `SELECT id, name, created_by, stock FROM products WHERE id IN (${placeholders})`,
        productIds
      );
      const productMap = Object.fromEntries(productRows.map(p => [p.id, p]));

      // Insert order items + update stock + notifications
      for (const { itemId, itemQuantity, finalPrice } of parsedItems) {
        await db.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price, status) VALUES (?, ?, ?, ?, ?)',
          [order_id, itemId, itemQuantity, finalPrice, 'pending']
        );

        const product = productMap[itemId];
        if (product) {
          const newStock = Math.max(0, (parseInt(product.stock) || 0) - itemQuantity);
          const newStatus = newStock <= 0 ? 'sold-out' : 'available';

          await db.execute(
            'UPDATE products SET stock = ?, stock_status = ? WHERE id = ?',
            [newStock, newStatus, itemId]
          );

          await db.execute(
            'INSERT INTO notifications (type, tenant_id, product_id, order_id, message, data) VALUES (?, ?, ?, ?, ?, ?)',
            [
              'checkout',
              product.created_by,
              itemId,
              order_id,
              `New order from ${finalCustomerName}`,
              JSON.stringify({
                customer_name: finalCustomerName,
                product_name: product.name,
                quantity: itemQuantity,
                total_amount: finalPrice * itemQuantity,
              }),
            ]
          );
        }
      }
      
      res.json({ success: true, order_id });
    } catch (error) {
      logger.error('Create order error:', error.message);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  async getTenantOrders(req, res) {
    try {
      const tenant_id = req.user.id;
      
      const [orders] = await db.execute(
        `SELECT o.*, oi.product_id, oi.quantity, oi.price, oi.status as item_status, 
                oi.rejection_reason as item_rejection_reason, p.name as product_name,
                u.email as customer_email, u.phone as customer_phone
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN users u ON o.user_id = u.id
         WHERE p.created_by = ?
         ORDER BY o.created_at DESC`,
        [tenant_id]
      );
      
      res.json(orders);
    } catch (error) {
      logger.error('Get tenant orders error:', error.message);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status, product_id, rejection_reason } = req.body;
      const tenant_id = req.user.id;
      
      // If product_id is provided, update only that specific item
      if (product_id) {
        // Verify tenant owns this product
        const [productCheck] = await db.execute(
          'SELECT created_by FROM products WHERE id = ?',
          [product_id]
        );
        
        if (productCheck.length === 0 || productCheck[0].created_by !== tenant_id) {
          return res.status(403).json({ error: 'Access denied: You can only update orders for your own products' });
        }
        
        // Update specific order item
        if (rejection_reason) {
          await db.execute(
            `UPDATE order_items oi 
             JOIN products p ON oi.product_id = p.id 
             SET oi.status = ?, oi.rejection_reason = ? 
             WHERE oi.order_id = ? AND oi.product_id = ? AND p.created_by = ?`,
            [status, rejection_reason, order_id, product_id, tenant_id]
          );
        } else {
          await db.execute(
            `UPDATE order_items oi 
             JOIN products p ON oi.product_id = p.id 
             SET oi.status = ? 
             WHERE oi.order_id = ? AND oi.product_id = ? AND p.created_by = ?`,
            [status, order_id, product_id, tenant_id]
          );
        }
        
        // Check if all items in the order have the same status to update main order
        const [orderItems] = await db.execute(
          'SELECT DISTINCT status FROM order_items WHERE order_id = ?',
          [order_id]
        );
        
        if (orderItems.length === 1) {
          // All items have same status, update main order
          await db.execute(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            [orderItems[0].status, order_id]
          );
        } else {
          // Mixed statuses, set main order to 'mixed'
          await db.execute(
            'UPDATE orders SET status = ? WHERE order_id = ?',
            ['mixed', order_id]
          );
        }
      } else {
        // Legacy: update entire order (for backward compatibility)
        await db.execute(
          'UPDATE orders SET status = ? WHERE order_id = ?',
          [status, order_id]
        );
      }
      
      res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      logger.error('Update order status error:', error.message);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  async confirmOrderReceived(req, res) {
    try {
      const { order_id } = req.params;
      const { received_status, product_id } = req.body;
      const user_id = req.user.id;
      
      // Verify that the user owns this order
      const [orderCheck] = await db.execute(
        'SELECT user_id FROM orders WHERE order_id = ?',
        [order_id]
      );
      
      if (orderCheck.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (orderCheck[0].user_id !== user_id) {
        return res.status(403).json({ error: 'Access denied: You can only confirm your own orders' });
      }
      
      const newStatus = received_status === 'received' ? 'confirmed' : 'disputed';
      
      if (product_id) {
        // Update specific item status
        await db.execute(
          'UPDATE order_items SET status = ? WHERE order_id = ? AND product_id = ?',
          [newStatus, order_id, product_id]
        );
        
        // Check if all items in the order have the same status to update main order
        const [orderItems] = await db.execute(
          'SELECT DISTINCT status FROM order_items WHERE order_id = ?',
          [order_id]
        );
        
        if (orderItems.length === 1) {
          // All items have same status, update main order
          await db.execute(
            'UPDATE orders SET status = ? WHERE order_id = ? AND user_id = ?',
            [orderItems[0].status, order_id, user_id]
          );
        } else {
          // Mixed statuses, set main order to 'mixed'
          await db.execute(
            'UPDATE orders SET status = ? WHERE order_id = ? AND user_id = ?',
            ['mixed', order_id, user_id]
          );
        }
      } else {
        // Legacy: update entire order
        await db.execute(
          'UPDATE orders SET status = ? WHERE order_id = ? AND user_id = ?',
          [newStatus, order_id, user_id]
        );
      }
      
      res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      logger.error('Confirm order received error:', error.message);
      res.status(500).json({ error: 'Failed to confirm order' });
    }
  },

  async autoCompleteOrders(req, res) {
    try {
      // Get orders that need auto completion
      const [ordersToComplete] = await db.execute(
        `SELECT o.order_id, o.user_id, o.customer_name, p.created_by as tenant_id, p.name as product_name
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.status = "completed" 
         AND o.created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );
      
      // Auto complete and notify
      for (const order of ordersToComplete) {
        await db.execute(
          'UPDATE orders SET status = "confirmed" WHERE order_id = ?',
          [order.order_id]
        );
        
        // Create notification for tenant
        await db.execute(
          'INSERT INTO notifications (type, tenant_id, user_id, order_id, message, data) VALUES (?, ?, ?, ?, ?, ?)',
          [
            'order_confirmation',
            order.tenant_id,
            order.user_id,
            order.order_id,
            `Order ${order.order_id} auto-confirmed after 24 hours`,
            JSON.stringify({ 
              received_status: 'auto_confirmed',
              customer_name: order.customer_name,
              product_name: order.product_name
            })
          ]
        );
      }
      
      res.json({ success: true, message: `${ordersToComplete.length} orders auto-completed` });
    } catch (error) {
      logger.error('Auto complete orders error:', error.message);
      res.status(500).json({ error: 'Failed to auto complete orders' });
    }
  },

  async getUserOrders(req, res) {
    try {
      const user_id = req.user.id;
      
      const [orders] = await db.execute(
        `SELECT o.*, oi.product_id, oi.quantity, oi.price, oi.status as item_status, 
                oi.rejection_reason as item_rejection_reason, p.name as product_name, p.image as product_image
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [user_id]
      );
      
      res.json(orders);
    } catch (error) {
      logger.error('Get user orders error:', error.message);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
};

module.exports = orderController;