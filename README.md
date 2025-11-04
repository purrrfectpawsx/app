# PetCare - Pet Health Management Application

A modern web application for managing your pet's health records, built with React, Vite, and Supabase.

## Features Implemented

### Story 1.1: User Registration with Email/Password ✅

- User signup with email/password authentication
- Real-time form validation (email format, password strength)
- Password requirements: minimum 8 characters, 1 uppercase, 1 number
- Duplicate email detection with clear error messages
- Email verification flow
- Responsive design optimized for mobile and desktop

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Backend**: Supabase (Auth + PostgreSQL)
- **Database**: PostgreSQL with Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to Project Settings → API to find your:
   - Project URL
   - Anon/Public Key

### 3. Run Database Migrations

1. Open your Supabase project
2. Go to Database → SQL Editor
3. Copy and execute the SQL from `supabase/migrations/001_create_profiles_table.sql`

This will create:
- `profiles` table with user information
- Row Level Security (RLS) policies ensuring users can only access their own data

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit your `.env` file to version control!

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── card.tsx
│   └── auth/            # Authentication components
│       ├── SignupForm.tsx
│       └── AuthLayout.tsx
├── contexts/
│   └── AuthContext.tsx  # Global auth state management
├── lib/
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # Utility functions
├── pages/
│   ├── SignupPage.tsx
│   └── VerifyEmailPage.tsx
├── schemas/
│   └── auth.ts          # Zod validation schemas
├── App.tsx              # Root component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind
```

## Database Schema

### profiles Table

| Column            | Type        | Description                        |
|-------------------|-------------|------------------------------------|
| id                | UUID        | Primary key, references auth.users |
| email             | TEXT        | User email address                 |
| name              | TEXT        | User display name                  |
| created_at        | TIMESTAMPTZ | Account creation timestamp         |
| subscription_tier | TEXT        | 'free' or 'premium'               |

### Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data:

- Users can **read** their own profile
- Users can **insert** their own profile (during registration)
- Users can **update** their own profile

## Development Notes

### Email Verification

During development, you may want to disable email confirmation in Supabase:

1. Go to Authentication → Settings
2. Disable "Enable email confirmations"
3. This allows faster testing without checking emails

Re-enable for production!

### Testing the Signup Flow

1. Navigate to `/signup`
2. Fill in the form:
   - Name: Any name
   - Email: Valid email format
   - Password: At least 8 chars, 1 uppercase, 1 number
   - Confirm Password: Must match password
3. Submit the form
4. You should be redirected to the email verification page

### Common Issues

**"Missing Supabase environment variables"**
- Ensure your `.env` file exists and contains valid values
- Restart the dev server after adding environment variables

**"Profile creation error"**
- Ensure you've run the database migrations
- Check that RLS policies are properly configured
- Verify the profiles table exists in Supabase

**Build errors related to @types or TypeScript**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript version is 5.2.2 or compatible

## Next Steps

The following stories are planned for future implementation:

- **Story 1.2**: Email Verification Flow
- **Story 1.3**: User Login with Email/Password
- **Story 1.4**: Google OAuth Integration
- **Story 1.5**: Password Reset Flow
- **Story 1.6**: Protected Routes & Session Management

## Contributing

This project follows the BMad methodology for software development. See `docs/` for:

- Product Requirements Document (PRD)
- Epic breakdowns
- Story documentation
- Architecture decisions

## License

Copyright © 2025. All rights reserved.
