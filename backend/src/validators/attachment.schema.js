const { z } = require("zod");

const updateAttachmentSchema = z.object({
  filename: z.string().min(1).optional(),
});

module.exports = {
  updateAttachmentSchema,
};
