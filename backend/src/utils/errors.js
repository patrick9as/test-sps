/**
 * Responde com erro por chave para i18n no frontend.
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} errorKey
 * @param {{ data?: Array<{ path: string; message: string }> }} [extra]
 */
function sendError(res, status, errorKey, extra = {}) {
  const body = { error: errorKey, ...extra };
  res.status(status).json(body);
}

module.exports = { sendError };
