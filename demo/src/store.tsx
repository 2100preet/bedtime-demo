import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Currency } from "./logic";

const KEY = "lorikins-demo-v1";

export type Child = {
  id: string;
  firstName: string;
  ageRange: string;
  language: string;
  interests: string;
  nickname: string;
};

export type Narrator = {
  id: string;
  childId: string;
  relationship: string;
  displayName: string;
  token: string;
  status: "invited" | "ready";
  consent: boolean;
  audioDataUrl: string;
  practice: boolean;
};

export type Story = {
  id: string;
  childId: string;
  narratorName: string;
  sampleId: string;
  title: string;
  body: string;
  audio: string;
  createdAt: number;
};

export type Comic = {
  id: string;
  childName: string;
  ageRange: string;
  language: string;
  interests: string;
  occasion: string;
  narratorName: string;
  deliverOn: string;
  photoCount: number;
  characterVariant: number;
  paid: boolean;
  consent: boolean;
};

export type DemoState = {
  user: { name: string; email: string; password: string } | null;
  currency: Currency;
  subscribed: boolean;
  introUsed: boolean;
  children: Child[];
  narrators: Narrator[];
  stories: Story[];
  comics: Comic[];
};

const EMPTY: DemoState = {
  user: null,
  currency: "USD",
  subscribed: false,
  introUsed: false,
  children: [],
  narrators: [],
  stories: [],
  comics: [],
};

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as DemoState;
    return { ...EMPTY, ...parsed, currency: parsed.currency === "INR" ? "INR" : "USD" };
  } catch {
    return EMPTY;
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type Api = {
  ready: boolean;
  state: DemoState;
  signup: (input: { name: string; email: string; password: string }) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  setCurrency: (currency: Currency) => void;
  addChild: (input: Omit<Child, "id">) => string;
  addNarrator: (input: Omit<Narrator, "id" | "token" | "status" | "consent" | "audioDataUrl" | "practice">) => Narrator;
  saveRecording: (token: string, audioDataUrl: string, practice: boolean) => string | null;
  addStory: (story: Omit<Story, "id" | "createdAt">) => string;
  startComic: (input: Omit<Comic, "id" | "paid" | "characterVariant">) => string;
  regenerateCharacter: (id: string) => void;
  completeCheckout: (kind: "monthly" | "yearly" | "birthday", comicId?: string) => void;
  reset: () => void;
};

const DemoContext = createContext<Api | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      const slim = {
        ...state,
        narrators: state.narrators.map((item) =>
          item.audioDataUrl.startsWith("data:") ? { ...item, audioDataUrl: "", practice: true } : item,
        ),
      };
      localStorage.setItem(KEY, JSON.stringify(slim));
    }
  }, [state, ready]);

  const api = useMemo<Api>(
    () => ({
      ready,
      state,
      signup: (input) => {
        if (state.user && state.user.email !== input.email.trim().toLowerCase()) {
          return "This browser already has a demo family. Reset the demo to start another.";
        }
        setState((current) => ({
          ...current,
          user: {
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            password: input.password,
          },
        }));
        return null;
      },
      login: (email, password) => {
        const user = state.user;
        if (!user || user.email !== email.trim().toLowerCase() || user.password !== password) {
          return "That email and password are not the demo account in this browser.";
        }
        return null;
      },
      logout: () => setState((current) => ({ ...current, user: null })),
      setCurrency: (currency) => setState((current) => ({ ...current, currency })),
      addChild: (input) => {
        const id = uid();
        setState((current) => ({ ...current, children: [...current.children, { ...input, id }] }));
        return id;
      },
      addNarrator: (input) => {
        const narrator: Narrator = {
          ...input,
          id: uid(),
          token: uid() + uid(),
          status: "invited",
          consent: false,
          audioDataUrl: "",
          practice: false,
        };
        setState((current) => ({ ...current, narrators: [...current.narrators, narrator] }));
        return narrator;
      },
      saveRecording: (token, audioDataUrl, practice) => {
        const found = state.narrators.some((item) => item.token === token);
        if (!found) return "This invite is not in this browser.";
        setState((current) => ({
          ...current,
          narrators: current.narrators.map((item) =>
            item.token === token
              ? { ...item, status: "ready", consent: true, audioDataUrl, practice }
              : item,
          ),
        }));
        return null;
      },
      addStory: (story) => {
        const id = uid();
        setState((current) => ({
          ...current,
          stories: [{ ...story, id, createdAt: Date.now() }, ...current.stories],
        }));
        return id;
      },
      startComic: (input) => {
        const id = uid();
        setState((current) => ({
          ...current,
          comics: [...current.comics, { ...input, id, paid: false, characterVariant: 0 }],
        }));
        return id;
      },
      regenerateCharacter: (id) => {
        setState((current) => ({
          ...current,
          comics: current.comics.map((item) =>
            item.id === id ? { ...item, characterVariant: (item.characterVariant || 0) + 1 } : item,
          ),
        }));
      },
      completeCheckout: (kind, comicId) => {
        setState((current) => ({
          ...current,
          subscribed: kind === "birthday" ? current.subscribed : true,
          introUsed: kind === "monthly" ? true : current.introUsed,
          comics: current.comics.map((item) => (item.id === comicId ? { ...item, paid: true } : item)),
        }));
      },
      reset: () => {
        localStorage.removeItem(KEY);
        setState(EMPTY);
      },
    }),
    [state, ready],
  );

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider missing");
  return value;
}
