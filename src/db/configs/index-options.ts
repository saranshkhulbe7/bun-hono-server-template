export const caseInsensitiveIndexOptionsNullExempt = {
  unique: true,
  background: true,
  collation: { locale: 'en', strength: 2 },
  partialFilterExpression: {
    // only index when transactionHash is stored as a String
    transactionHash: { $type: 'string' },
  },
};
