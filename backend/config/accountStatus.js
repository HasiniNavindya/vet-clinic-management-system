const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

function canLogin(status) {
  return status === ACCOUNT_STATUS.ACTIVE;
}

function loginBlockMessage(status, rejectionReason) {
  if (status === ACCOUNT_STATUS.PENDING) {
    return 'Your veterinarian application is under admin review. You will be able to log in after approval.';
  }
  if (status === ACCOUNT_STATUS.REJECTED) {
    const reason = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    return `Your veterinarian application was not approved.${reason}`;
  }
  return 'Your account is not active. Please contact the clinic.';
}

module.exports = {
  ACCOUNT_STATUS,
  canLogin,
  loginBlockMessage,
};
