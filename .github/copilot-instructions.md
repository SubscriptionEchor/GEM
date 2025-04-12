# GitHub Copilot Instructions

This React TypeScript project uses Tailwind CSS and Supabase. Follow these custom guidelines for code suggestions.

## Custom Coding Rules
- Avoid semicolons at line ends
- Add comments only for complex or non-obvious logic
- Write concise, readable code with clear names
- Use arrow functions for components/hooks
- Prefer functional components over class components

## Styling
- Use Tailwind CSS classes in JSX
- Group classes by purpose (layout, spacing, typography)
- Use responsive prefixes (e.g., `sm:`, `md:`)

## Supabase
- Use `@supabase/supabase-js` for backend
- Place queries/mutations in `src/utils/` or `src/contexts/`
- Type responses with TypeScript
- Use `import.meta.env` for Supabase URL/anon key

## Directory Structure
```
.
├── src
│   ├── assets
│   │   ├── animations/*.json
│   │   └── fonts/*.ttf
│   ├── components
│   │   ├── Analytics.tsx
│   │   ├── HomePage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   ├── Navigation.tsx
│   │   ├── ReferralPage.tsx
│   │   ├── SpinPage.tsx
│   │   ├── SplashScreen.tsx
│   │   └── UpgradePage.tsx
│   ├── contexts
│   │   ├── AuthContext.tsx
│   │   ├── BoostContext.tsx
│   │   └── MiningContext.tsx
│   ├── styles
│   │   ├── fonts.css
│   │   ├── global.css
│   │   └── theme.css
│   ├── utils
│   │   ├── numberUtils.ts
│   │   ├── telegramUtils.ts
│   │   └── timeUtils.ts
│   ├── App.tsx
│   ├── main.tsx
├── supabase
│   └── migrations/*.sql
```

## Example
```tsx
interface UserCardProps {
  name: string
  email: string
}

const UserCard = ({ name, email }: UserCardProps) => {
  const handleClick = () => console.log(`Clicked ${name}`)

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-sm">
      <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
      <p className="text-gray-600">{email}</p>
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleClick}
      >
        View
      </button>
    </div>
  )
}

export default UserCard
```