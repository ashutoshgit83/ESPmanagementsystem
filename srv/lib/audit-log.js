const cds = require('@sap/cds');

/**
 * Shared Audit Logging Module
 * Creates immutable audit trail entries for significant business events.
 * Supports: Create, Update, Delete, Approve, Reject, StatusChange
 */
async function createAuditEntry({ entityType, entityId, action, fieldName, oldValue, newValue, req }) {
  const { AuditLogs } = cds.entities('esp.management');
  const user = req?.user?.id || 'system';
  const now = new Date().toISOString();

  await INSERT.into(AuditLogs).entries({
    ID: cds.utils.uuid(),
    timestamp: now,
    entityType,
    entityId,
    action,
    fieldName: fieldName || null,
    oldValue: oldValue != null ? String(oldValue) : null,
    newValue: newValue != null ? String(newValue) : null,
    changedBy: user,
    changedAt: now
  });
}

/**
 * Log multiple field changes in a single call (for UPDATE events)
 */
async function logFieldChanges({ entityType, entityId, changes, req }) {
  for (const [fieldName, { oldValue, newValue }] of Object.entries(changes)) {
    if (oldValue !== newValue) {
      await createAuditEntry({
        entityType,
        entityId,
        action: 'Update',
        fieldName,
        oldValue,
        newValue,
        req
      });
    }
  }
}

/**
 * Log a status transition event
 */
async function logStatusChange({ entityType, entityId, oldStatus, newStatus, req }) {
  await createAuditEntry({
    entityType,
    entityId,
    action: 'StatusChange',
    fieldName: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    req
  });
}

/**
 * Log a creation event
 */
async function logCreate({ entityType, entityId, description, req }) {
  await createAuditEntry({
    entityType,
    entityId,
    action: 'Create',
    fieldName: null,
    oldValue: null,
    newValue: description || 'Entity created',
    req
  });
}

/**
 * Log a deletion event
 */
async function logDelete({ entityType, entityId, description, req }) {
  await createAuditEntry({
    entityType,
    entityId,
    action: 'Delete',
    fieldName: null,
    oldValue: description || 'Entity deleted',
    newValue: null,
    req
  });
}

module.exports = {
  createAuditEntry,
  logFieldChanges,
  logStatusChange,
  logCreate,
  logDelete
};
