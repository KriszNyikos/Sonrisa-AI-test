describe('Backend Setup', () => {
  test('should have Express imported', () => {
    const express = require('express');
    expect(express).toBeDefined();
  });

  test('should be able to create an Express app', () => {
    const express = require('express');
    const app = express();
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });
});
