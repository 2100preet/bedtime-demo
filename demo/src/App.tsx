import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router";
import { BRAND_NAME, priceLabels } from "../../src/lib/brand";
import { birthdayPanels, sampleCharacter, samplePanel } from "./comic";
import { SAMPLE_VOICE_NOTE, assetUrl, chargeLabel, personalize, pickSample, playerLabels, type Currency } from "./logic";
import { useDemo, type Narrator } from "./store";

const LANGUAGES = [
  ["english", "English"],
  ["hindi", "Hindi"],
  ["telugu", "Telugu"],
  ["kannada", "Kannada"],
  ["hinglish", "Hinglish"],
  ["tenglish", "Tenglish"],
  ["kanglish", "Kanglish"],
] as const;

const AGES = ["2–3", "4–5", "6–7"];
const RELATIONSHIPS = ["Dadi", "Dadu", "Nani", "Nana", "Maushi", "Bua", "Mama", "Chachi", "Parent", "Sibling"];

function CurrencyToggle({ currency, onChange }: { currency: Currency; onChange: (currency: Currency) => void }) {
  return (
    <div className="toggle" role="group" aria-label="Currency">
      {(["USD", "INR"] as const).map((code) => (
        <button key={code} type="button" className={currency === code ? "on" : ""} onClick={() => onChange(code)}>
          {code}
        </button>
      ))}
    </div>
  );
}

function InrNote({ currency }: { currency: Currency }) {
  if (currency !== "INR") return null;
  return <p className="note">Prices shown in INR</p>;
}

function Shell({ children }: { children: ReactNode }) {
  const { state, logout } = useDemo();
  return (
    <div className="page">
      <header className="wrap appbar">
        <Link className="brand" to={state.user ? "/home" : "/"}>
          {BRAND_NAME}
        </Link>
        <nav className="nav-links">
          {state.user ? (
            <>
              <Link to="/library">Library</Link>
              <Link to="/billing">Plan</Link>
              <Link to="/birthday">Birthday</Link>
              <button className="btn-secondary" type="button" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link className="btn" to="/signup">
                Start
              </Link>
            </>
          )}
        </nav>
      </header>
      {children}
      {state.user ? (
        <nav className="bottom-nav">
          <Link to="/home">Home</Link>
          <Link to="/library">Library</Link>
          <Link to="/billing">Plan</Link>
          <Link to="/birthday">Birthday</Link>
        </nav>
      ) : null}
    </div>
  );
}

function NeedAccount({ children }: { children: ReactNode }) {
  const { ready, state } = useDemo();
  if (!ready) return <p className="wrap">Opening the demo saved in this browser…</p>;
  if (!state.user) return <Navigate to="/login" replace />;
  return children;
}

function Landing() {
  const { state, setCurrency } = useDemo();
  const prices = priceLabels(state.currency);
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="nav">
            <Link className="brand" to="/">
              {BRAND_NAME}
            </Link>
            <div className="nav-links">
              <CurrencyToggle currency={state.currency} onChange={setCurrency} />
              <Link to="/login">Log in</Link>
              <Link className="btn" to="/signup">
                Start a story
              </Link>
            </div>
          </div>
          <h1>Bedtime, in the voice they already trust.</h1>
          <p className="lede">
            {BRAND_NAME} writes a short story for a child aged 2–7, then reads it in a grandparent’s voice, a maushi’s, a bua’s, or anyone the family invites. This public demo keeps every name, recording, and practice checkout in this browser.
          </p>
          <div className="row">
            <Link className="btn" to="/signup">
              Create a demo family
            </Link>
            <a className="btn-ghost" href="#pricing">
              See prices
            </a>
          </div>
        </div>
      </header>
      <section className="section wrap">
        <div className="grid-3">
          <article className="card">
            <h2>A child, not a profile</h2>
            <p>First name, age, language, interests, and a nickname. Hindi, Telugu, Kannada, English, Hinglish, Tenglish, or Kanglish.</p>
          </article>
          <article className="card">
            <h2>A voice they know</h2>
            <p>Send an invite, record in the browser, or save a practice reading. The clip never leaves this device.</p>
          </article>
          <article className="card">
            <h2>A story for tonight</h2>
            <p>The first story is free. After that, a practice checkout unlocks the library plan. No card is charged.</p>
          </article>
        </div>
      </section>
      <section className="section wrap" id="pricing">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2>Simple pricing</h2>
          <CurrencyToggle currency={state.currency} onChange={setCurrency} />
        </div>
        <InrNote currency={state.currency} />
        <div className="grid-3">
          <article className="card mark">
            <span className="pill">First month</span>
            <p className="price">{prices.introMonthly}</p>
            <p>Then {prices.monthly} each month. The first story for each child is free before you subscribe.</p>
          </article>
          <article className="card">
            <span className="pill">Year</span>
            <p className="price">{prices.yearly}</p>
            <p>Save {prices.savingsPercent}% compared with paying monthly.</p>
          </article>
          <article className="card">
            <span className="pill">Birthday book</span>
            <p className="price">{prices.birthday}</p>
            <p>A one-time 10-panel comic and a bedtime reading. Photos in this demo are discarded on the form.</p>
            <Link className="btn" to="/birthday">
              Order a birthday book
            </Link>
          </article>
        </div>
      </section>
      <footer className="footer">Stories and payments in this demo stay on your device.</footer>
    </>
  );
}

function Signup() {
  const { signup } = useDemo();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = signup({
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    });
    if (message) {
      setError(message);
      return;
    }
    navigate("/home");
  }
  return (
    <Shell>
      <form className="narrow stack" onSubmit={onSubmit}>
        <h1>Create your demo family</h1>
        <p className="muted">The password stays in this browser. It is not sent anywhere.</p>
        <label>
          Your name
          <input name="name" required autoComplete="name" placeholder="Priya" />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="username" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={6} autoComplete="new-password" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">
          Create account
        </button>
        <p>
          Already started? <Link to="/login">Log in</Link>
        </p>
      </form>
    </Shell>
  );
}

function Login() {
  const { login } = useDemo();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = login(String(data.get("email") || ""), String(data.get("password") || ""));
    if (message) {
      setError(message);
      return;
    }
    navigate("/home");
  }
  return (
    <Shell>
      <form className="narrow stack" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Use the email and password saved in this browser.</p>
        <label>
          Email
          <input name="email" type="email" required autoComplete="username" />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">
          Log in
        </button>
        <p>
          New here? <Link to="/signup">Create a demo family</Link>
        </p>
      </form>
    </Shell>
  );
}

function Home() {
  const { state, reset } = useDemo();
  const narrators = state.narrators;
  return (
    <Shell>
      <main className="wrap stack">
        <h1>Good evening, {state.user?.name}.</h1>
        <p className="muted">
          {state.subscribed ? "The practice plan is on for this browser." : "The first story for each child is free."}
        </p>
        {state.children.length === 0 ? (
          <article className="card">
            <h2>No children yet</h2>
            <p>Add a first name, age, language, and a few interests. That is the whole profile.</p>
            <Link className="btn" to="/children/new">
              Add a child
            </Link>
          </article>
        ) : (
          <div className="grid-2">
            {state.children.map((child) => {
              const voice = narrators.find((item) => item.childId === child.id && item.status === "ready");
              return (
                <article className="card" key={child.id}>
                  <h2>{child.firstName}</h2>
                  <p className="muted">
                    {child.ageRange} · {labelLanguage(child.language)}
                    {voice ? ` · ${voice.displayName} is ready` : " · no voice yet"}
                  </p>
                  <Link className="btn" to={`/children/${child.id}`}>
                    Open
                  </Link>
                </article>
              );
            })}
          </div>
        )}
        <div className="row">
          <Link className="btn" to="/children/new">
            Add a child
          </Link>
          <Link className="btn-secondary" to="/library">
            Library
          </Link>
          <Link className="btn-secondary" to="/birthday">
            Birthday book
          </Link>
        </div>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => {
            if (window.confirm("Erase the demo family, stories, and recordings in this browser?")) reset();
          }}
        >
          Reset demo
        </button>
      </main>
    </Shell>
  );
}

function labelLanguage(code: string) {
  return LANGUAGES.find((item) => item[0] === code)?.[1] ?? code;
}

function NewChild() {
  const { addChild } = useDemo();
  const navigate = useNavigate();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = addChild({
      firstName: String(data.get("firstName") || "").trim(),
      ageRange: String(data.get("ageRange") || "4–5"),
      language: String(data.get("language") || "english"),
      interests: String(data.get("interests") || "").trim(),
      nickname: String(data.get("nickname") || "").trim(),
    });
    navigate(`/children/${id}`);
  }
  return (
    <Shell>
      <form className="narrow stack" onSubmit={onSubmit}>
        <h1>Add a child</h1>
        <p className="muted">Only a first name, age, language, interests, and a family nickname.</p>
        <label>
          First name
          <input name="firstName" required placeholder="Aarav" />
        </label>
        <label>
          Age
          <select name="ageRange" defaultValue="4–5">
            {AGES.map((age) => (
              <option key={age}>{age}</option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select name="language" defaultValue="english">
            {LANGUAGES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Interests
          <input name="interests" required placeholder="trains, mangoes, the moon" />
        </label>
        <label>
          Nickname used at home
          <input name="nickname" placeholder="guddu" />
        </label>
        <button className="btn" type="submit">
          Save child
        </button>
      </form>
    </Shell>
  );
}

function ChildPage() {
  const { id } = useParams();
  const { state, addNarrator, addStory } = useDemo();
  const navigate = useNavigate();
  const child = state.children.find((item) => item.id === id);
  const voices = state.narrators.filter((item) => item.childId === child?.id);
  const readyVoice = [...voices].reverse().find((item) => item.status === "ready");
  const storyCount = state.stories.filter((item) => item.childId === child?.id).length;
  const locked = storyCount >= 1 && !state.subscribed;
  const [invite, setInvite] = useState<Narrator | null>(null);
  const [copied, setCopied] = useState(false);

  if (!child) {
    return (
      <Shell>
        <main className="narrow stack">
          <h1>That child is not in this browser</h1>
          <Link className="btn" to="/home">
            Back home
          </Link>
        </main>
      </Shell>
    );
  }

  function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!child) return;
    const data = new FormData(event.currentTarget);
    const narrator = addNarrator({
      childId: child.id,
      relationship: String(data.get("relationship") || "Dadi"),
      displayName: String(data.get("displayName") || "").trim(),
    });
    setInvite(narrator);
    setCopied(false);
  }

  function generate() {
    if (!child || !readyVoice) return;
    const sample = pickSample(child.language, child.id);
    const narratorName = readyVoice.displayName;
    const storyId = addStory({
      childId: child.id,
      narratorName,
      sampleId: sample.id,
      language: child.language,
      title: personalize(sample.title, child.firstName, narratorName),
      body: personalize(sample.body, child.firstName, narratorName),
      audio: sample.audio,
    });
    navigate(`/library/${storyId}`);
  }

  const link = invite ? `${window.location.origin}${import.meta.env.BASE_URL}invite/${invite.token}` : "";

  return (
    <Shell>
      <main className="wrap stack">
        <h1>{child.firstName}</h1>
        <p className="muted">
          {child.ageRange} · {labelLanguage(child.language)} · {child.interests}
          {child.nickname ? ` · called ${child.nickname}` : ""}
        </p>
        <section className="card stack">
          <h2>Invite a narrator</h2>
          <p>Share the link, then record on this same browser. The demo cannot text WhatsApp from a static page.</p>
          <form className="stack" onSubmit={onInvite}>
            <label>
              Who is this?
              <select name="relationship" defaultValue="Dadi">
                {RELATIONSHIPS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Name to use in the story
              <input name="displayName" required placeholder="Dadi" />
            </label>
            <button className="btn" type="submit">
              Create invite
            </button>
          </form>
          {invite ? (
            <div className="stack">
              <p className="script">{link}</p>
              <div className="row">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(link).then(() => setCopied(true));
                  }}
                >
                  {copied ? "Copied" : "Copy invite"}
                </button>
                <Link className="btn" to={`/invite/${invite.token}`}>
                  Open recorder
                </Link>
              </div>
            </div>
          ) : null}
          {voices.length > 0 ? (
            <ul>
              {voices.map((voice) => (
                <li key={voice.id}>
                  {voice.displayName} ({voice.relationship}) — {voice.status === "ready" ? (voice.practice ? "practice reading saved" : "recording saved on this device") : "waiting for a reading"}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <section className="card stack">
          <h2>Tonight’s story</h2>
          {locked ? (
            <>
              <p>{child.firstName} already has the free sample. A practice checkout unlocks another.</p>
              <Link className="btn" to="/billing">
                Practice checkout
              </Link>
            </>
          ) : readyVoice ? (
            <>
              <p>
                A prewritten {labelLanguage(child.language)} sample becomes {child.firstName}’s story. The page uses {readyVoice.displayName}’s name.
              </p>
              <p className="note">{SAMPLE_VOICE_NOTE}</p>
              <button className="btn" type="button" onClick={generate}>
                Generate story
              </button>
            </>
          ) : (
            <p>Save a recording or a practice reading before generating the story.</p>
          )}
        </section>
      </main>
    </Shell>
  );
}

function InvitePage() {
  const { token } = useParams();
  const { ready, state, saveRecording } = useDemo();
  const narrator = state.narrators.find((item) => item.token === token);
  const child = state.children.find((item) => item.id === narrator?.childId);
  const [consent, setConsent] = useState(false);
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!ready) return <p className="wrap">Opening the demo saved in this browser…</p>;
  if (!narrator || !token) {
    return (
      <Shell>
        <main className="narrow stack">
          <h1>Invite not on this device</h1>
          <p>Recordings live in this browser only. Create the invite here, then open the recorder on the same phone or computer.</p>
          <Link className="btn" to="/home">
            Home
          </Link>
        </main>
      </Shell>
    );
  }

  const script = `Good night, ${child?.firstName ?? "little one"}. Once upon a time a tiny clay lamp waited on the windowsill. It was not loud. It was not in a hurry. It glowed until the room felt safe, and then it rested. The end.`;

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser has no microphone API. Save a practice reading instead.");
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(media);
      recorder.current = rec;
      rec.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      rec.onstop = () => {
        media.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 1_200_000) {
          setPreview("");
          setError("That clip is too long for this browser’s storage. Record a shorter greeting, or save a practice reading.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => setPreview(String(reader.result || ""));
        reader.readAsDataURL(blob);
      };
      rec.start();
      setRecording(true);
      setPreview("");
    } catch {
      setError("The microphone was blocked. You can still save a practice reading.");
    }
  }

  function stop() {
    recorder.current?.stop();
    setRecording(false);
  }

  function save(audio: string, practice: boolean) {
    if (!consent) {
      setError("Check the consent line before saving a voice.");
      return;
    }
    const problem = saveRecording(token!, audio, practice);
    if (problem) {
      setError(problem);
      return;
    }
    setMessage(practice ? "Practice reading saved on this device." : "Recording saved on this device.");
    setError("");
  }

  return (
    <Shell>
      <main className="narrow stack">
        <h1>A reading for {child?.firstName}</h1>
        <p className="muted">
          {narrator.displayName}, this clip is stored only in this browser. It is not uploaded.
        </p>
        <p className="script">{script}</p>
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>I agree to record my voice for {child?.firstName}’s bedtime stories in this demo, and I can erase it with Reset demo.</span>
        </label>
        <div className="row">
          {recording ? (
            <button className="btn" type="button" onClick={stop}>
              Stop recording
            </button>
          ) : (
            <button className="btn" type="button" onClick={() => void start()}>
              Start recording
            </button>
          )}
          <button className="btn-secondary" type="button" onClick={() => save(assetUrl("audio/practice.mp3"), true)}>
            No microphone? Save a practice reading
          </button>
        </div>
        {recording ? <p className="note">Recording… read the script, then stop.</p> : null}
        {preview ? (
          <div className="player">
            <p>Listen, then keep it.</p>
            <audio controls src={preview} />
            <button className="btn" type="button" onClick={() => save(preview, false)}>
              Save recording on this device
            </button>
          </div>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        {message ? (
          <div className="card stack">
            <p>{message}</p>
            {child ? (
              <Link className="btn" to={`/children/${child.id}`}>
                Back to {child.firstName}
              </Link>
            ) : null}
          </div>
        ) : null}
      </main>
    </Shell>
  );
}

function Library() {
  const { state } = useDemo();
  return (
    <Shell>
      <main className="wrap stack">
        <h1>Library</h1>
        {state.stories.length === 0 ? (
          <article className="card">
            <h2>No stories yet</h2>
            <p>Add a child, save a voice, and generate the free sample.</p>
            <Link className="btn" to="/home">
              Go to the family
            </Link>
          </article>
        ) : (
          <div className="grid-2">
            {state.stories.map((story) => (
              <article className="card" key={story.id}>
                <h2>{story.title}</h2>
                <p className="muted">Read as {story.narratorName}</p>
                <Link className="btn" to={`/library/${story.id}`}>
                  Open
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </Shell>
  );
}

function StoryPage() {
  const { id } = useParams();
  const { state } = useDemo();
  const story = state.stories.find((item) => item.id === id);
  if (!story) {
    return (
      <Shell>
        <main className="narrow">
          <h1>That story is not in this browser</h1>
          <Link to="/library">Library</Link>
        </main>
      </Shell>
    );
  }
  return (
    <Shell>
      <main className="narrow stack">
        <p className="muted">{playerLabels(story.language).title}</p>
        <h1>{story.title}</h1>
        <div className="player">
          <p>{playerLabels(story.language).listen}</p>
          <audio controls src={assetUrl(story.audio)} />
          <p className="fine">{SAMPLE_VOICE_NOTE}</p>
        </div>
        <p className="muted">This sample reading uses the names Aarav and Dadi. The words below use the names you entered.</p>
        <article className="script">{story.body}</article>
      </main>
    </Shell>
  );
}

function Billing() {
  const { state, setCurrency } = useDemo();
  const prices = priceLabels(state.currency);
  return (
    <Shell>
      <main className="wrap stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>Plan</h1>
          <CurrencyToggle currency={state.currency} onChange={setCurrency} />
        </div>
        <InrNote currency={state.currency} />
        {state.subscribed ? <p className="note">Practice plan is active in this browser.</p> : null}
        <div className="grid-2">
          <article className="card mark">
            <h2>Monthly</h2>
            <p className="price">{state.introUsed ? prices.monthly : prices.introMonthly}</p>
            <p>{state.introUsed ? "Each month" : `First month, then ${prices.monthly}`}</p>
            <Link className="btn" to="/checkout?kind=monthly">
              Practice checkout
            </Link>
          </article>
          <article className="card">
            <h2>Yearly</h2>
            <p className="price">{prices.yearly}</p>
            <p>Save {prices.savingsPercent}%.</p>
            <Link className="btn" to="/checkout?kind=yearly">
              Practice checkout
            </Link>
          </article>
        </div>
      </main>
    </Shell>
  );
}

function Checkout() {
  const [params] = useSearchParams();
  const kindParam = params.get("kind");
  const comicId = params.get("comic") || undefined;
  const kind = kindParam === "yearly" || kindParam === "birthday" ? kindParam : kindParam === "monthly" ? "monthly" : null;
  const { state, setCurrency, completeCheckout } = useDemo();
  const navigate = useNavigate();
  if (!kind) return <Navigate to="/billing" replace />;
  const intro = kind === "monthly" && !state.introUsed;
  const label = chargeLabel(kind, state.currency, intro);
  const comic = state.comics.find((item) => item.id === comicId);
  return (
    <Shell>
      <main className="narrow stack">
        <h1>Practice checkout</h1>
        <CurrencyToggle currency={state.currency} onChange={setCurrency} />
        <InrNote currency={state.currency} />
        <article className="card">
          <p className="muted">{kind === "birthday" ? "Birthday book" : kind === "yearly" ? "Yearly plan" : "Monthly plan"}</p>
          <p className="price">{label}</p>
          <p>No card is charged. This button only marks the demo as paid inside this browser.</p>
          {kind === "birthday" && comic ? <p>For {comic.childName}’s {comic.occasion.toLowerCase()}.</p> : null}
        </article>
        <button
          className="btn"
          type="button"
          onClick={() => {
            completeCheckout(kind, comicId);
            if (kind === "birthday" && comicId) navigate(`/comic/${comicId}`);
            else navigate("/library");
          }}
        >
          Complete practice checkout
        </button>
      </main>
    </Shell>
  );
}

function Birthday() {
  const { state, setCurrency, startComic } = useDemo();
  const navigate = useNavigate();
  const prices = priceLabels(state.currency);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setError("A parent or guardian needs to confirm the photo line.");
      return;
    }
    if (files.length < 1 || files.length > 3) {
      setError("Choose 1 to 3 photos. They are discarded when you leave this form.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const stock = data.get("voice") === "stock";
    const narratorName = stock ? "Preview voice" : String(data.get("narratorName") || "").trim();
    if (!narratorName) {
      setError("Name the person who should appear in the book, or choose the preview voice.");
      return;
    }
    const id = startComic({
      childName: String(data.get("childName") || "").trim(),
      ageRange: String(data.get("ageRange") || "4–5"),
      language: String(data.get("language") || "english"),
      interests: String(data.get("interests") || "").trim(),
      occasion: String(data.get("occasion") || "Birthday").trim(),
      narratorName,
      deliverOn: String(data.get("deliverOn") || ""),
      photoCount: files.length,
      consent: true,
    });
    navigate(`/comic/${id}/preview`);
  }

  return (
    <Shell>
      <form className="narrow stack" onSubmit={onSubmit}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1>Birthday book</h1>
          <CurrencyToggle currency={state.currency} onChange={setCurrency} />
        </div>
        <p>
          One payment of <strong>{prices.birthday}</strong>. Next you preview the cartoon and can draw it again before the ten-panel book is opened. In this demo the likeness is a sample toddler. With a photo and an image key, the full app draws it from the child.
        </p>
        <InrNote currency={state.currency} />
        <label>
          Child’s first name
          <input name="childName" required placeholder="Aarav" />
        </label>
        <label>
          Age
          <select name="ageRange" defaultValue="4–5">
            {AGES.map((age) => (
              <option key={age}>{age}</option>
            ))}
          </select>
        </label>
        <label>
          Language
          <select name="language" defaultValue="english">
            {LANGUAGES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Interests
          <input name="interests" required placeholder="mangoes" />
        </label>
        <label>
          Occasion
          <input name="occasion" defaultValue="Birthday" required />
        </label>
        <label>
          Optional delivery date
          <input name="deliverOn" type="date" />
        </label>
        <fieldset className="stack">
          <legend>Voice in the book</legend>
          <label className="check">
            <input type="radio" name="voice" value="invite" defaultChecked />
            <span>Use a loved one’s name</span>
          </label>
          <label>
            Their name
            <input name="narratorName" placeholder="Dadi" />
          </label>
          <label className="check">
            <input type="radio" name="voice" value="stock" />
            <span>Use the preview voice</span>
          </label>
        </fieldset>
        <label>
          1–3 photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 3))}
          />
        </label>
        <p className="muted">
          {files.length === 0 ? "No photos chosen." : `${files.length} photo${files.length === 1 ? "" : "s"} noted: ${files.map((file) => file.name).join(", ")}. They stay in this tab and are not saved.`}
        </p>
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>I am the parent or guardian. These photos are only for this sample book, are deleted when I leave the form, and are not used to train anything.</span>
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">
          Preview your character
        </button>
      </form>
    </Shell>
  );
}

function CharacterPreviewPage() {
  const { id } = useParams();
  const { state, regenerateCharacter } = useDemo();
  const navigate = useNavigate();
  const comic = state.comics.find((item) => item.id === id);
  if (!comic || !id) {
    return (
      <Shell>
        <main className="narrow">
          <h1>That book is not in this browser</h1>
          <Link to="/birthday">Start a birthday book</Link>
        </main>
      </Shell>
    );
  }
  if (comic.paid) return <Navigate to={`/comic/${comic.id}`} replace />;
  const variant = comic.characterVariant || 0;
  return (
    <Shell>
      <main className="narrow stack">
        <p className="note">Preview your character</p>
        <h1>Does this look like {comic.childName}?</h1>
        <p>
          This sample keeps the same face shape, skin tone, hair, and eyes on every page. Draw again for another pose. In the full app, this sheet is generated from the uploaded photo and you approve it before the book is drawn.
        </p>
        <img className="portrait" src={assetUrl(sampleCharacter(variant))} alt={`Cartoon of ${comic.childName}`} />
        <div className="row">
          <button className="btn" type="button" onClick={() => navigate(`/checkout?kind=birthday&comic=${comic.id}`)}>
            Use this character
          </button>
          <button className="btn-secondary" type="button" onClick={() => regenerateCharacter(comic.id)}>
            Draw again
          </button>
        </div>
      </main>
    </Shell>
  );
}

function ComicPage() {
  const { id } = useParams();
  const { state } = useDemo();
  const comic = state.comics.find((item) => item.id === id);
  const [copied, setCopied] = useState(false);
  if (!comic || !id) {
    return (
      <Shell>
        <main className="narrow">
          <h1>That book is not in this browser</h1>
          <Link to="/birthday">Start a birthday book</Link>
        </main>
      </Shell>
    );
  }
  if (!comic.paid) {
    return (
      <Shell>
        <main className="narrow stack">
          <h1>{comic.childName}’s book is waiting</h1>
          <p>Finish the practice checkout to open the 10 panels. Nothing is charged.</p>
          <Link className="btn" to={`/checkout?kind=birthday&comic=${comic.id}`}>
            Practice checkout
          </Link>
        </main>
      </Shell>
    );
  }
  const panels = birthdayPanels(comic.childName, comic.narratorName, comic.interests);
  const reading = pickSample(comic.language, comic.id);
  const labels = playerLabels(comic.language);
  return (
    <Shell>
      <main className="wrap stack">
        <h1>{comic.childName}’s {comic.occasion.toLowerCase()}</h1>
        <p className="muted">
          The same cartoon face on every page. {comic.photoCount} photo{comic.photoCount === 1 ? "" : "s"} were discarded after you left the form. This page is private to this browser.
        </p>
        <p className="muted">{labels.title}</p>
        <h2>{personalize(reading.title, comic.childName, comic.narratorName)}</h2>
        <div className="player">
          <p>{labels.listen}</p>
          <audio controls src={assetUrl(reading.audio)} />
          <p className="fine">{SAMPLE_VOICE_NOTE}</p>
        </div>
        <article className="script">{personalize(reading.body, comic.childName, comic.narratorName)}</article>
        <div className="stack">
          {panels.map((panel) => (
            <article className="comic-card" key={panel.index}>
              <div className="comic-art">
                <img src={assetUrl(samplePanel(panel.index))} alt="" />
              </div>
              <p className="caption">
                <strong>{panel.index}.</strong> {panel.caption}
              </p>
            </article>
          ))}
        </div>
        <div className="row">
          <button
            className="btn"
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(window.location.href).then(() => setCopied(true));
            }}
          >
            {copied ? "Link copied" : "Copy share link"}
          </button>
          <Link className="btn-secondary" to="/billing">
            Keep stories coming — see the plan
          </Link>
        </div>
        {comic.deliverOn ? <p className="muted">Marked for {comic.deliverOn}. This demo does not send mail.</p> : null}
      </main>
    </Shell>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/home" element={<NeedAccount><Home /></NeedAccount>} />
      <Route path="/children/new" element={<NeedAccount><NewChild /></NeedAccount>} />
      <Route path="/children/:id" element={<NeedAccount><ChildPage /></NeedAccount>} />
      <Route path="/library" element={<NeedAccount><Library /></NeedAccount>} />
      <Route path="/library/:id" element={<NeedAccount><StoryPage /></NeedAccount>} />
      <Route path="/billing" element={<NeedAccount><Billing /></NeedAccount>} />
      <Route path="/checkout" element={<NeedAccount><Checkout /></NeedAccount>} />
      <Route path="/birthday" element={<NeedAccount><Birthday /></NeedAccount>} />
      <Route path="/comic/:id/preview" element={<NeedAccount><CharacterPreviewPage /></NeedAccount>} />
      <Route path="/comic/:id" element={<NeedAccount><ComicPage /></NeedAccount>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
