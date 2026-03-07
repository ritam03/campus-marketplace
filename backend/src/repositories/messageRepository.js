import pool from '../config/db.js';

export const saveMessage = async (listingId, senderId, receiverId, encryptedContent) => {
  const result = await pool.query(
    `INSERT INTO messages (listing_id, sender_id, receiver_id, encrypted_content) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [listingId, senderId, receiverId, encryptedContent]
  );
  return result.rows[0];
};

export const getChatHistory = async (listingId, user1Id, user2Id) => {
  const result = await pool.query(
    `SELECT * FROM messages 
     WHERE listing_id = $1 
       AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
     ORDER BY created_at ASC`,
    [listingId, user1Id, user2Id]
  );
  return result.rows;
};

export const getUserInbox = async (userId) => {
  // Groups chats by conversation and listing
  const result = await pool.query(
    `SELECT DISTINCT ON (
      LEAST(m.sender_id, m.receiver_id), 
      GREATEST(m.sender_id, m.receiver_id), 
      m.listing_id
    )
    m.id, m.listing_id, m.sender_id, m.receiver_id, m.encrypted_content, m.created_at, m.is_read,
    l.title as listing_title,
    CASE WHEN m.sender_id = $1 THEN u2.name ELSE u1.name END as other_user_name,
    CASE WHEN m.sender_id = $1 THEN u2.id ELSE u1.id END as other_user_id
    FROM messages m
    JOIN listings l ON m.listing_id = l.id
    JOIN users u1 ON m.sender_id = u1.id
    JOIN users u2 ON m.receiver_id = u2.id
    WHERE m.sender_id = $1 OR m.receiver_id = $1
    ORDER BY 
      LEAST(m.sender_id, m.receiver_id), 
      GREATEST(m.sender_id, m.receiver_id), 
      m.listing_id, 
      m.created_at DESC`,
    [userId]
  );
  // Sort the final distinct list so newest chats are at the top
  return result.rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getTotalUnreadCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};

export const markChatAsRead = async (currentUserId, otherUserId, listingId) => {
  await pool.query(
    `UPDATE messages SET is_read = true 
     WHERE receiver_id = $1 AND sender_id = $2 AND listing_id = $3 AND is_read = false`,
    [currentUserId, otherUserId, listingId]
  );
};