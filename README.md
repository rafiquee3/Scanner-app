# Smart Scanner AI 🧾✨

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Smart Scanner AI** is a Progressive Web Application (PWA) built to digitize and manage your physical receipts with ease. Powered by Google's **Gemini 2.5 Flash** model, it automatically extracts purchased items, prices, categories, and dates from receipt images.

🔗 **[Live Demo](https://scanner-app-flax.vercel.app)**

---

## 🔥 Features

- 📸 **Smart AI Extraction**: Snap a photo or upload an image of your receipt. The Gemini AI instantly parses the image to extract product names, prices, categories, and the purchase date.
- ✏️ **Receipt Editor**: Review, modify, or add items to your parsed receipt before securely saving it to your account.
- ☁️ **Cloud Storage & Sync**: All data is securely stored using Supabase (Auth & PostgreSQL). Access your receipts from anywhere.
- 📱 **Progressive Web App (PWA)**: Install the app directly on your iOS or Android device for a native-like, zero-install experience.
- 📊 **History & Filtering**: Browse your past receipts, view total spending, and filter your history by month and year.
- ✅ **Tested & Reliable**: Comprehensive test coverage using Playwright for E2E and Vitest for unit testing.

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend/Database/Auth**: [Supabase](https://supabase.com/)
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai)
- **State Management**: [React Query (TanStack)](https://tanstack.com/query/latest)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [MSW](https://mswjs.io/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v20+) and `npm` installed. You will also need:

- A [Supabase](https://supabase.com/) project (with `receipts` and `receipt_items` tables configured).
- A [Google Gemini API Key](https://aistudio.google.com/).

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/scanner-app.git
   cd scanner-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the following keys:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🛠 Database Schema

The application relies on two main tables in Supabase:

- `receipts`
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key to Auth)
  - `total` (Float)
  - `date` (Date)
  - `created_at` (Timestamp)

- `receipt_items`
  - `id` (UUID, Primary Key)
  - `receipt_id` (UUID, Foreign Key to `receipts`)
  - `name` (Text)
  - `price` (Float)
  - `category` (Text)

_(Note: Row Level Security (RLS) is used to ensure users can only access their own receipts)._

---

## 🧪 Testing

The repository uses Playwright for End-to-End testing and Vitest for unit/integration testing.

To run tests:

```bash
# Run Unit Tests
npm run test

# Run Unit Tests in Watch Mode
npm run test:watch

# Run E2E Tests (requires Playwright installation)
npx playwright test
```

---

## 📄 License

This project is licensed under the MIT License.
