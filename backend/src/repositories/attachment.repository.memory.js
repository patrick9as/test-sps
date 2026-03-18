const { nanoid } = require("nanoid");

/** @type {Map<string, Map<string, { id: string; userId: string; filename: string; mime: string; size: number; data: Buffer; createdAt: string; updatedAt: string }>>} */
const store = new Map();

/**
 * @param {object} attachment
 */
function toPublic(attachment) {
  if (!attachment) return null;
  const { data: _data, ...rest } = attachment;
  rest.downloadUrl = `/users/${attachment.userId}/attachments/${attachment.id}/content`;
  return rest;
}

/**
 * @param {string} userId
 */
async function listByUserId(userId) {
  const map = store.get(userId);
  if (!map) return [];
  return Array.from(map.values()).map(toPublic);
}

/**
 * @param {string} userId
 * @param {string} attachmentId
 */
async function findById(userId, attachmentId) {
  const map = store.get(userId);
  const item = map?.get(attachmentId) || null;
  return item ? toPublic(item) : null;
}

/**
 * @param {string} userId
 * @param {{ filename: string; mime: string; size: number; data: Buffer }} input
 */
async function create(userId, input) {
  const id = nanoid();
  const now = new Date().toISOString();
  const attachment = {
    id,
    userId,
    filename: input.filename,
    mime: input.mime,
    size: input.size,
    data: input.data,
    createdAt: now,
    updatedAt: now,
  };
  if (!store.has(userId)) store.set(userId, new Map());
  store.get(userId).set(id, attachment);
  return toPublic(attachment);
}

/**
 * @param {string} userId
 * @param {string} attachmentId
 * @param {{ filename?: string }} updates
 */
async function update(userId, attachmentId, updates) {
  const map = store.get(userId);
  const existing = map?.get(attachmentId);
  if (!existing) return null;
  if (updates.filename !== undefined) existing.filename = updates.filename;
  existing.updatedAt = new Date().toISOString();
  return toPublic(existing);
}

/**
 * @param {string} userId
 * @param {string} attachmentId
 */
async function remove(userId, attachmentId) {
  const map = store.get(userId);
  if (!map) return false;
  const deleted = map.delete(attachmentId);
  if (map.size === 0) store.delete(userId);
  return deleted;
}

/**
 * @param {string} userId
 * @param {string} attachmentId
 * @returns {Promise<{ mime: string; data: Buffer; filename: string } | null>}
 */
async function getContent(userId, attachmentId) {
  const map = store.get(userId);
  const existing = map?.get(attachmentId);
  if (!existing) return null;
  return { mime: existing.mime, data: existing.data, filename: existing.filename };
}

module.exports = {
  listByUserId,
  findById,
  create,
  update,
  remove,
  getContent,
};

