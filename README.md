# Lorikins

Personalized bedtime stories for children aged 2–7, narrated in the voice of a grandparent, maushi, bua, mama, chachi, parent, sibling, or anyone the family chooses. Stories are in Hindi, Telugu, Kannada, English, and the mixed home languages Hinglish, Tenglish, and Kanglish.

The working name lives in one place: `BRAND_NAME` in `src/lib/brand.ts`. Prices live next to it. Outside India: `$4.99` / month, `$1.99` first month, `$39` / year, `$29` birthday comic. In India: `₹399` / month, `₹99` first month, `₹2,999` / year, `₹1,999` birthday comic (`INR_PRICING`).

There is also a one-time birthday comic: a parent or gift buyer pays once, uploads 1–3 photos, and receives a private 10-panel picture book (web viewer + PDF) with an audio narration. Photos are deleted after the book is drawn. They are not used for training and are not shown in any gallery.

## Run it locally

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

The seed parent is `demo@bedtime.test` / `bedtime-demo`. That account already has a child (Aarav), a ready Dadi voice, one sample story, and a birthday comic at `/c/demo-aarav-birthday`.

No API keys are required. Stories, voices, pictures, and checkout all run in practice mode on this machine.

## Walk through practice mode

1. Sign up with email and password, or request a magic link. There is no mail server, so the link is shown on the sign-in page.
2. Add a child: first name, age, language, interests, and a family nickname. Nothing else is collected.
3. Invite a narrator. Copy the WhatsApp link, open it, check the consent line, and choose **No microphone? Save a practice reading** (only offered when `ELEVENLABS_API_KEY` is empty).
4. Write tonight’s story. The first story for each child is free. It shows up in the library with audio.
5. Open **Plan** and complete the practice checkout. The first month is `$1.99` (or `₹99` when prices are in INR). A second story can then be written.
6. From the home page, open **Birthday book**. Enter the child, upload 1–3 photos, check the parent/guardian consent box, pick a stock voice or invite someone, and complete the `$29` practice payment (`₹1,999` in India). The order page then shows **Preview your character**. Approve it, or choose **Draw again**, before the ten panels are created. The private comic link can be copied to WhatsApp or email. A subscription upsell sits under the book.
7. Gift a month or a year from **Gift**, finish practice checkout, and open the redeem link while signed in.

`npm test` covers pricing, currency selection, the free-sample gate, photo deletion, consent copy, story length (400–500 words), comic panel count, and the static demo’s sample picker.

## Static demo (GitHub Pages)

GitHub Pages cannot run the Next.js server, the database, or checkout. `demo/` is a separate Vite app that reuses the prices in `src/lib/brand.ts` and keeps the family, recordings, stories, and practice payments in `localStorage` (`lorikins-demo-v1`). A clay banner at the top reads **Demo - no real payments**.

```bash
npm run demo
```

Open [http://127.0.0.1:43124](http://127.0.0.1:43124). The visitor path is landing, signup, add a child, narrator invite and browser recording (or a bundled practice reading), generate a story from the prebuilt samples, library, practice checkout with a USD/INR toggle, birthday gift form, a character preview with **Draw again**, and the comic viewer. The demo comic uses the bundled picture-book panels in `content/comics/sample`.

`npm run demo:build` writes `demo/dist`. With `GITHUB_PAGES=true`, the base path is `/<repo>/` from `GITHUB_REPOSITORY`, or `/` when the repository is `<owner>.github.io`. The build copies `index.html` to `404.html` and adds `.nojekyll` so client-side routes survive Pages.

`.github/workflows/pages.yml` installs `demo/`, builds with `GITHUB_PAGES=true`, and deploys the artifact on every push to `main`. In the GitHub repo, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

To publish under the GitHub account `2100preet`:

1. Create an empty public repository `https://github.com/2100preet/bedtime-demo` with no README, license, or .gitignore.
2. Push this project’s `main` branch to that repository. The workflow file has to be on the default branch.
3. The first run may ask you to approve the `github-pages` environment.
4. The site is `https://2100preet.github.io/bedtime-demo/`. A repository named `2100preet.github.io` is served at `https://2100preet.github.io/` instead.

Sample narration mp3 files in `demo/public/audio/` are pre-generated with Microsoft Edge neural voices (`edge-tts`, rate `-10%`) from `demo/narration/`: `en-IN-NeerjaNeural`, `hi-IN-SwaraNeural`, `te-IN-ShrutiNeural`, and `kn-IN-SapnaNeural`. Run `python3 demo/scripts/narrate.py` when a story changes. They are committed so the Pages build does not need a speech synthesizer. The password in the demo never leaves the browser.

On the full app, add `?currency=INR` or `?currency=USD` to any page to preview that list. The choice is remembered for 30 days. Without the query, India is detected from the Vercel `x-vercel-ip-country` or Cloudflare `cf-ipcountry` header, then from `Accept-Language` (for example `en-IN` or `hi`), then from the browser timezone `Asia/Kolkata`. India visitors see “Prices shown in INR”. Checkout stays on the in-app practice page until `STRIPE_SECRET_KEY` is set; the stored charge is already in cents or paise, so Stripe INR prices or a later Razorpay adapter can use the same amount without changing the pages.

`npm run job:weekly` writes a new story for each child with an active plan who has not had one in six days, and logs birthday-share reminders whose date has arrived. In production, call `POST /api/cron/weekly` with `Authorization: Bearer $CRON_SECRET`.

## Environment

Copy `.env.example` to `.env`. Leave the provider keys empty for practice mode.

| Variable | Practice mode | Real mode |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file. Prisma resolves it from `prisma/`, so the default `file:../data/app.db` is the project `data/` folder | Same, or point at another SQLite file |
| `SESSION_SECRET` | Any long string | A random secret |
| `NEXT_PUBLIC_APP_URL` | `http://127.0.0.1:43123` | The public origin, used in share links and Stripe return URLs |
| `CRON_SECRET` | Any long string | Required for the weekly HTTP job |
| `PHOTO_DELETE_AFTER_GENERATION` | `true` | Set to `false` only to keep photos for a short retry window |
| `OPENAI_API_KEY` | Empty: built-in storyteller | OpenAI-compatible chat completions. Optional `OPENAI_BASE_URL`, `OPENAI_MODEL` |
| `ELEVENLABS_API_KEY` | Empty: recording is stored and speech is a local preview voice (`espeak-ng`) | Clones the recording and narrates with it. Optional `ELEVENLABS_STOCK_VOICE_ID` |
| `IMAGE_API_KEY` | Empty: the bundled sample picture book (same toddler on every page) | Photo-referenced cartoons. `IMAGE_PROVIDER` is `openai` (gpt-image edits), `replicate` (InstantID, PhotoMaker, or IP-Adapter), or `fal`. The child’s photo is the reference for one character sheet; that sheet is the reference for every panel. Optional `IMAGE_API_BASE_URL`, `IMAGE_MODEL` |
| `STRIPE_SECRET_KEY` | Empty: in-app practice checkout, no card | Stripe Checkout in USD or INR. The monthly intro is a one-time coupon (`$3` or `₹300`). Birthday and gift are one-time payments. Razorpay can replace this rail later; the UI only follows the returned URL |
| `STRIPE_WEBHOOK_SECRET` | Unused | Sign `checkout.session.completed` posted to `/api/stripe/webhook` |
| `CHROME_PATH` | Optional | Headless Chrome used to print the comic PDF. Defaults to `google-chrome` |

`espeak-ng` (with Hindi, Telugu, and Kannada voices) and Google Chrome need to be on the machine for preview audio and PDFs. If speech synthesis fails, the library still offers a browser read-aloud button.

## Privacy notes baked into the product

- A narrator must check an explicit consent statement before a recording is saved. The voice can be deleted from the child page.
- A birthday book requires a parent or guardian checkbox. Photos are removed after generation when `PHOTO_DELETE_AFTER_GENERATION` is not `false`.
- Comic and invite links are unguessable and marked `noindex`. There is no public gallery.
- Child profiles store a first name, age range, language, interests, and a nickname. Birthday dates live only on the comic order, for the optional share reminder.
