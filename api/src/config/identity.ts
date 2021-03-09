// TODO Currently we use only one key collection but for prod this key collection might run out of index so they must be created dynamically
// see ticket: https://app.zenhub.com/workspaces/e-commerce-audit-log-5f61d95cdfcfd03a6193cc6f/issues/iotaledger/e-commerce-audit-log/54
export const KEY_COLLECTION_INDEX = 0;
// Size must be a multiple of 2^2, 2^3, 2^4, ...
export const KEY_COLLECTION_SIZE = 8;
