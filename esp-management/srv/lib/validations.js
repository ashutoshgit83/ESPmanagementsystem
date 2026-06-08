/**
 * Validation utility functions shared across services
 */

/**
 * Valid status transitions for Purchase Orders
 */
const PO_STATUS_TRANSITIONS = {
  Draft:     ['Pending', 'Cancelled'],
  Pending:   ['Active', 'Draft', 'Cancelled'],
  Active:    ['Closed'],
  Closed:    [],            // Terminal state
  Cancelled: []             // Terminal state
};

/**
 * Valid status transitions for Invoices
 */
const INVOICE_STATUS_TRANSITIONS = {
  Received:        ['PendingApproval', 'Rejected'],
  PendingApproval: ['Approved', 'Rejected'],
  Approved:        ['Paid'],
  Rejected:        ['PendingApproval'],  // Allow resubmission
  Paid:            []                     // Terminal state
};

/**
 * Check if a status transition is valid
 */
function isValidTransition(currentStatus, newStatus, transitions) {
  const allowed = transitions[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
}

/**
 * Validate required fields and return error messages
 */
function validateRequired(data, fields, req) {
  for (const { field, label } of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      req.error(400, `${label} is required`, field);
    }
  }
}

/**
 * Validate numeric field is positive
 */
function validatePositive(data, fields, req) {
  for (const { field, label } of fields) {
    if (data[field] !== undefined && data[field] !== null && Number(data[field]) < 0) {
      req.error(400, `${label} must be a positive number`, field);
    }
  }
}

/**
 * Validate date range (start <= end)
 */
function validateDateRange(data, startField, endField, label, req) {
  if (data[startField] && data[endField]) {
    if (new Date(data[startField]) > new Date(data[endField])) {
      req.error(400, `${label}: Start date must be before or equal to end date`, startField);
    }
  }
}

/**
 * Validate percentage is between 0 and 100
 */
function validatePercentage(data, field, label, req) {
  if (data[field] !== undefined && data[field] !== null) {
    const val = Number(data[field]);
    if (val < 0 || val > 100) {
      req.error(400, `${label} must be between 0 and 100`, field);
    }
  }
}

module.exports = {
  PO_STATUS_TRANSITIONS,
  INVOICE_STATUS_TRANSITIONS,
  isValidTransition,
  validateRequired,
  validatePositive,
  validateDateRange,
  validatePercentage
};
