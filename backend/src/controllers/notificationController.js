const db = require('../config/database');

const createNotification = async (req, res) => {
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
};

const getTenantNotifications = async (req, res) => {
  try {
    const tenantId = req.user.id;
    
    const [notifications] = await db.execute(
      `SELECT n.*, p.name as product_name 
       FROM notifications n
       LEFT JOIN products p ON n.product_id = p.id
       WHERE n.tenant_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [tenantId]
    );
    
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
};

const markAsRead = async (req, res) => {
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
};

module.exports = {
  createNotification,
  getTenantNotifications,
  markAsRead
};