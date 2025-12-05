const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, tenant_id, product_id, order_id, message, data } = req.body;
    
    let finalTenantId = tenant_id;
    if (!finalTenantId && product_id) {
      const [productRows] = await db.execute(
        'SELECT created_by FROM products WHERE id = ?',
        [product_id]
      );
      if (productRows.length > 0) {
        finalTenantId = productRows[0].created_by;
      }
    }
    
    if (!finalTenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required'
      });
    }
    
    const [result] = await db.execute(
      `INSERT INTO notifications (type, tenant_id, product_id, order_id, message, data, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [type, finalTenantId, product_id || null, order_id || null, message, JSON.stringify(data)]
    );
    
    res.json({
      success: true,
      message: 'Notification created successfully',
      notification_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

router.get('/tenant', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { type } = req.query;
    
    let query = `SELECT n.*, p.name as product_name 
                 FROM notifications n
                 LEFT JOIN products p ON n.product_id = p.id
                 WHERE n.tenant_id = ?`;
    let params = [tenantId];
    
    if (type) {
      query += ` AND n.type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY n.created_at DESC LIMIT 50`;
    
    const [notifications] = await db.execute(query, params);
    
    res.json({
      success: true,
      notifications: notifications.map(notification => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.id;
    
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { type } = req.body;
    
    let query = 'UPDATE notifications SET is_read = 1 WHERE tenant_id = ?';
    let params = [tenantId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    await db.execute(query, params);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

module.exports = router;