# Unit Test Suite for Lost & Found Application

This directory contains comprehensive Jest unit tests for the five core functionalities of the Lost & Found Application using Supabase directly (no backend API).

## Test Files

1. **supabaseService.registerUser.test.ts** - User Registration Tests (Supabase Auth + Database)
2. **supabaseService.loginUser.test.ts** - User Login Tests (Supabase Auth)
3. **supabaseService.updateUserProfile.test.ts** - User Profile Update Tests (Supabase Auth + Database)
4. **supabaseService.submitLostItemPost.test.ts** - Lost Item Post Submission Tests (Supabase Database)
5. **supabaseService.submitClaim.test.ts** - Claim Submission Tests (Supabase Database)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

Each test file includes:

### ✅ Success Cases
- Valid input scenarios
- Expected successful responses
- Proper data handling

### ❌ Failure Cases
- Missing required fields
- Invalid input formats
- Database errors
- Network failures
- Authentication errors
- Duplicate entries
- Validation failures

### Input Validation
- Request format verification
- Header validation
- Body structure checks

### Service Function Isolation
- Mocked dependencies
- Isolated service logic
- Token management verification

## Test Structure

Each test follows this structure:
1. **Scenario/Use Case description** - Clear description of what is being tested
2. **Input data** - Test input values
3. **Expected Output** - Expected response structure
4. **Actual behavior verification** - Assertions using `expect()`
5. **Mocked service functions** - Isolated backend responses using `jest.fn()` and `jest.spyOn()`

## Mocking Strategy

- `supabase` client is mocked to simulate Supabase Auth and Database responses
- Supabase methods (`signUp`, `signInWithPassword`, `updateUser`, `getUser`, `from().insert()`, etc.) are mocked
- All async operations are properly handled with `async/await`
- Tests isolate frontend Supabase logic without touching backend

## Requirements

- Jest 29.7.0+
- jest-expo 52.0.1+
- React Native testing environment
- @supabase/supabase-js (mocked in tests)

## Supabase Functions Tested

- `supabase.auth.signUp()` - User registration
- `supabase.auth.signInWithPassword()` - User login
- `supabase.auth.updateUser()` - Profile updates
- `supabase.auth.getUser()` - Get current user
- `supabase.from('users').insert()` - Insert user into database
- `supabase.from('users').upsert()` - Update user in database
- `supabase.from('lost_item_posts').insert()` - Create lost item post
- `supabase.from('claims').insert()` - Submit claim

