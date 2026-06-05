// In-memory seed users. Data lives in this array for the run and resets on
// restart. getNextId hands out ids for newly created users.
const users = [
  {
    userId: 1,
    firstName: 'Matan',
    lastName: 'Noam',
    email: 'matan@mealy.com',
    dietaryPreferences: ['vegetarian'],
    theme: 'light',
    createDate: '2025-01-10T10:00:00Z',
    updateDate: '2025-01-10T10:00:00Z',
    userRole: 'admin'
  },
  {
    userId: 2,
    firstName: 'Dana',
    lastName: 'Cohen',
    email: 'dana@mealy.com',
    dietaryPreferences: ['vegan', 'gluten-free'],
    theme: 'light',
    createDate: '2025-01-11T10:00:00Z',
    updateDate: '2025-01-11T10:00:00Z',
    userRole: 'manager'
  },
  {
    userId: 3,
    firstName: 'Yossi',
    lastName: 'Levi',
    email: 'yossi@mealy.com',
    dietaryPreferences: [],
    theme: 'light',
    createDate: '2025-01-12T10:00:00Z',
    updateDate: '2025-01-12T10:00:00Z',
    userRole: 'user'
  }
];

let nextId = 4;

module.exports = { users, getNextId: () => nextId++ };
