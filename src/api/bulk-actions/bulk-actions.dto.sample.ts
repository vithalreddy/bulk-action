export const example1 = {
  entity: 'opportunity',
  rules: {
    conditions: {
      all: [
        {
          fact: 'id',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'id',
          operator: 'lessThanInclusive',
          value: 50,
        },
      ],
    },
  },
  updateData: {
    status: 'SPECIAL',
  },
};
