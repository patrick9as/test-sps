const { ERROR_KEYS } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const attachmentRepository = require("../repositories/attachment.repository");
const { updateAttachmentSchema } = require("../validators/attachment.schema");
const { formatZodErrors } = require("../validators/user.schema");
const { sendError } = require("../utils/errors");

async function ensureUserExistsOr404(userId, res) {
  const existing = await userRepository.findByIdWithPassword(userId);
  if (!existing) {
    sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
    return false;
  }
  return true;
}

async function list(req, res) {
  const { id: userId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const items = await attachmentRepository.listByUserId(userId);
  return res.json({ data: items });
}

async function getById(req, res) {
  const { id: userId, attachmentId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const item = await attachmentRepository.findById(userId, attachmentId);
  if (!item) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }
  return res.json({ data: item });
}

async function create(req, res) {
  const { id: userId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const file = req.file;
  if (!file) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: [{ path: "file", message: ERROR_KEYS.VALIDATION_INVALID_BODY }],
    });
  }

  const created = await attachmentRepository.create(userId, {
    filename: file.originalname,
    mime: file.mimetype,
    size: file.size,
    data: file.buffer,
  });

  if (!created) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  return res.status(201).json({ data: created });
}

async function downloadContent(req, res) {
  const { id: userId, attachmentId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const content = await attachmentRepository.getContent(userId, attachmentId);
  if (!content) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  res.setHeader("Content-Type", content.mime || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  if (content.filename) {
    res.setHeader("Content-Disposition", `attachment; filename="${content.filename}"`);
  }
  return res.status(200).send(content.data);
}

async function update(req, res) {
  const { id: userId, attachmentId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const parsed = updateAttachmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, ERROR_KEYS.VALIDATION_INVALID_BODY, {
      data: formatZodErrors(parsed.error),
    });
  }

  const updated = await attachmentRepository.update(userId, attachmentId, parsed.data);
  if (!updated) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  return res.json({ data: updated });
}

async function remove(req, res) {
  const { id: userId, attachmentId } = req.params;
  if (!(await ensureUserExistsOr404(userId, res))) return;

  const deleted = await attachmentRepository.remove(userId, attachmentId);
  if (!deleted) {
    return sendError(res, 404, ERROR_KEYS.USERS_NOT_FOUND);
  }

  return res.status(200).json({ message: "ok" });
}

module.exports = {
  list,
  getById,
  create,
  downloadContent,
  update,
  remove,
};

