export interface KeyCollectionPersistence {
  index: number;
  count: number;
  type: string;
  keys: SimpleKeyPair[];
}

export interface SimpleKeyPair {
  public: string;
  secret: string;
}

export interface LinkedKeyCollectionIdentityPersistence {
  keyCollectionIndex: number;
  index: number;
  linkedIdentity?: string;
  isRevoked: boolean;
  revokedIdentity?: string;
}

export interface KeyCollectionJson {
  type: string;
  keys: SimpleKeyPair[];
}
