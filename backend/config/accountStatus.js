const { normalizeRole } = require('./roles');

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

function canLogin(status) {
  return status === ACCOUNT_STATUS.ACTIVE;
}

function loginBlockMessage(status, rejectionReason, roleId) {
  const role = normalizeRole(roleId);
  const isReceptionist = role === 'receptionist';
  const isDoctor = role === 'doctor';

  if (status === ACCOUNT_STATUS.PENDING) {
    if (isReceptionist) {
      return 'Your receptionist application is under admin review. You will be able to log in after approval.';
    }
    if (isDoctor) {
      return 'Your veterinarian application is under admin review. You will be able to log in after approval.';
    }
    return 'Your account is pending approval. Please contact the clinic.';
  }
  if (status === ACCOUNT_STATUS.REJECTED) {
    const reason = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    if (isReceptionist) {
      return `Your receptionist application was not approved.${reason}`;
    }
    if (isDoctor) {
      return `Your veterinarian application was not approved.${reason}`;
    }
    return `Your account was not approved.${reason}`;
  }
  if (status === ACCOUNT_STATUS.SUSPENDED) {
    return 'Your account has been suspended. Please contact the clinic.';
  }
  return 'Your account is not active. Please contact the clinic.';
}

module.exports = {
  ACCOUNT_STATUS,
  canLogin,
  loginBlockMessage,
};
