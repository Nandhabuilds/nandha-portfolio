# Nandha — Portfolio

Cinematic dark-theme portfolio built with React, Vite, Tailwind CSS v4, GSAP and Framer Motion.

## Run locally
```bash
npm install
npm run dev
```

## Things to set before publishing
1. **Photo:** put your photo at `src/assets/Portfolio/picture.png` (or .jpg/.webp). Until then a monogram is shown.
2. **LinkedIn:** replace `nandhakumar-s-818aa6269` in `src/components/Footer.jsx`.
3. **Contact form:** posts to your Cloudflare Worker's `/contact` route, which emails you through Resend (see `worker-index.js` in the download).
4. **AI assistant (Elina):** already points at your Worker. Override with `VITE_ASSISTANT_URL` only if the URL changes. Voice replies use ElevenLabs via `/speak`: set `speakByDefault: false` in `src/config/assistant.js` to save quota.

## Where content lives
| Section | File |
|---|---|
| Hero, credentials | `src/components/Hero.jsx` |
| About | `src/components/About.jsx` |
| Expertise cards | `expertiseData` in `Expertise.jsx` |
| Skills carousel | `skillCategories` in `Skills.jsx` |
| Projects | `projectsData` in `Projects.jsx` (add `url` to make a card clickable) |

## Deploy to GitHub Pages
See the steps in the chat. The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
`public/data/profile.json` is a copy of the file your AI Worker reads. If this site replaces `Nandhabuilds.github.io`, it must stay reachable at `/data/profile.json`.
