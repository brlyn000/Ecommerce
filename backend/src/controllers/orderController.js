const db = require('../config/database');

const orderController = {
  async createOrder(req, res) {
    try {
      const { items, total, customer_name } = req.body;
      const user_id = req.user.id;
      
      const order_id = 'ORD' + Date.now();
      
      // Insert order
      await db.execute(
        'INSERT INTO orders (order_id, user_id, customer_name, total, status) VALUES (?, ?, ?, ?, ?)',
        [order_id, user_id, customer_name, total, 'pending']
      );
      
      // Insert order items and create notifications
      for (const item of items) {
        // Calculate final price with discount
        let finalPrice = item.price;
        if (item.discount) {
          finalPrice = item.price * (1 - item.discount / 100);
        }
        
        await db.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price, status) VALUES (?, ?, ?, ?, ?)',
          [order_id, item.id, item.quantity, finalPrice, 'pending']
        );
        
        // Get product info and update stock
        const [productRows] = await db.execute(
          'SELECT name, created_by, stock FROM products WHERE id = ?',
          [item.id]
        );
        
        if (productRows.length > 0) {
          const currentStock = productRows[0].stock;
          const newStock = Math.max(0, currentStock - item.quantity);
          const newStatus = newStock <= 0 ? 'sold-out' : 'available';
          
          // Update stock and status
          await db.execute(
            'UPDATE products SET stock = ?, stock_status = ? WHERE id = ?',
            [newStock, newStatus, item.id]
          );
        }
        
        if (productRows.length > 0) {
          const product = productRows[0];
          
          // Create notification for tenant
          await db.execute(
            'INSERT INTO notifications (type, tenant_id, product_id, order_id, message, data) VALUES (?, ?, ?, ?, ?, ?)',
            [
              'checkout',
              product.created_by,
              item.id,
              order_id,
              `New order from ${customer_name}`,
              JSON.stringify({
                customer_name: customer_name,
                product_name: product.name,
                quantity: item.quantity,
                total_amount: finalPrice * item.quantity
              })
            ]
          );
        }
      }
      
      res.json({ success: true, order_id });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Get tenant orders error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Update order status error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Confirm order received error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Auto complete orders error:', error);
      res.status(500).json({ error: error.message });
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
      console.error('Get user orders error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;