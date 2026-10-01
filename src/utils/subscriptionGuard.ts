import axios, { type InternalAxiosRequestConfig } from "axios";
import axiosInstance from "@store/services/axiosInstance";
import type { Branch } from "@pages/auth/Authapi";
import { getBranchSubscription } from "@utils/subscription";

// An expired trial / subscription leaves the business in VIEW-ONLY mode: every
// read keeps working, every write (add / edit / delete / update / mark
// attendance ...) is refused and the "Subscription Expired" modal is shown.
//
// This module is the single source of truth. It is deliberately React- and
// Redux-free so the axios interceptors below can use it; <SubscriptionGuard>
// (mounted once at the app root) keeps `readOnly` in sync with the session.

type Listener = () => void;

interface GuardState {
  readOnly: boolean;
  modalOpen: boolean;
}

let state: GuardState = { readOnly: false, modalOpen: false };
const listeners = new Set<Listener>();

const setState = (patch: Partial<GuardState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const subscriptionGuardStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,
  setReadOnly: (readOnly: boolean) => {
    if (state.readOnly === readOnly) return;
    // Renewing (or switching to an active branch) must not leave a stale modal up.
    setState({ readOnly, modalOpen: readOnly ? state.modalOpen : false });
  },
  openModal: () => setState({ modalOpen: true }),
  closeModal: () => setState({ modalOpen: false }),
};

/**
 * Runs `action` unless the business is view-only, in which case the expired
 * modal opens instead. Returns whether the action ran.
 */
export function runIfSubscribed(action?: () => void): boolean {
  if (state.readOnly) {
    subscriptionGuardStore.openModal();
    return false;
  }
  action?.();
  return true;
}

/**
 * Call right after entering a branch (picker / login fast path), once the
 * dashboard has been navigated to: an expired branch still opens, view-only,
 * and the expired modal is shown once on arrival so the user knows why
 * changes are disabled.
 */
export function notifyIfBranchExpired(branch?: Branch | null) {
  if (getBranchSubscription(branch)?.expired) subscriptionGuardStore.openModal();
}

export class SubscriptionExpiredError extends Error {
  readonly isSubscriptionExpired = true;
  constructor() {
    super("Subscription expired. Renew to make changes.");
    this.name = "SubscriptionExpiredError";
  }
}

export const isSubscriptionExpiredError = (e: unknown): e is SubscriptionExpiredError =>
  !!e && typeof e === "object" && (e as SubscriptionExpiredError).isSubscriptionExpired === true;

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

// Session endpoints on the auth client must keep working on an expired business.
const SESSION_URL = /\/auth\/api\/(login|logout|refresh-token|create-account)/;

const blockWritesWhenReadOnly = (config: InternalAxiosRequestConfig) => {
  if (SESSION_URL.test(config.url ?? "")) return config;
  if (state.readOnly && WRITE_METHODS.has((config.method ?? "get").toLowerCase())) {
    subscriptionGuardStore.openModal();
    return Promise.reject(new SubscriptionExpiredError());
  }
  return config;
};

let installed = false;

/** Attaches the write-blocking interceptor to every axios client the app uses. */
export function installSubscriptionGuard() {
  if (installed) return;
  installed = true;
  // Many features call the default axios directly; the rest go through axiosInstance.
  // Login / refresh / logout are exempt (SESSION_URL) so sign-in still works.
  axios.interceptors.request.use(blockWritesWhenReadOnly);
  axiosInstance.interceptors.request.use(blockWritesWhenReadOnly);
  // Several modules build their own client with axios.create(); make every one
  // created from here on carry the guard too (see utils/installSubscriptionGuard).
  const create = axios.create.bind(axios);
  axios.create = (config) => {
    const instance = create(config);
    instance.interceptors.request.use(blockWritesWhenReadOnly);
    return instance;
  };
}
