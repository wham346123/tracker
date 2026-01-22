# Next.js Starter Site

A clean, modularized Next.js project with TypeScript and Tailwind CSS, ready to build your website.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
nextjs-site/
├── src/
│   ├── app/              # App router pages and layouts
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   └── components/       # Reusable components go here
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Features

- **Next.js 16** with App Router (latest stable)
- **React 19.2** (latest stable)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality
- **Turbopack** bundler (stable) - 2-5x faster builds
- Modular folder structure
- Dark mode support

## Build for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
