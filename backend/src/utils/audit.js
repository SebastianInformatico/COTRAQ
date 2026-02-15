const { AuditLog } = require('../models');

/**
 * Registra una acción en el log de auditoría
 * @param {Object} params - Parámetros del log
 * @param {string} params.userId - ID del usuario (opcional)
 * @param {string} params.action - Acción realizada (CREATE, UPDATE, DELETE, etc.)
 * @param {string} params.entity - Nombre de la entidad afectada
 * @param {string} params.entityId - ID de la entidad afectada
 * @param {Object} params.details - Detalles adicionales del cambio
 * @param {Object} params.req - Objeto request de Express (opcional, para IP y User Agent)
 */
const logAudit = async ({ userId, action, entity, entityId, details, req }) => {
  try {
    const logData = {
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details
    };

    if (req) {
      logData.ip_address = req.ip || req.connection.remoteAddress;
      logData.user_agent = req.get('User-Agent');
      
      // Si no se pasó userId pero está en el req.user
      if (!logData.user_id && req.user && req.user.id) {
        logData.user_id = req.user.id;
      }
    }

    await AuditLog.create(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // No lanzamos el error para no interrumpir el flujo principal
  }
};

module.exports = { logAudit };
