const MODULE_RETURN_KEY = "fotoia:module-return";

type ModuleReturnState = { panelPath: string; scrollY: number };

export function rememberModuleReturn(panelPath: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(MODULE_RETURN_KEY, JSON.stringify({ panelPath, scrollY: window.scrollY } satisfies ModuleReturnState));
  } catch {
    // A navegação continua funcionando mesmo se o armazenamento estiver indisponível.
  }
}

export function takeModuleReturn(panelPath: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MODULE_RETURN_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(MODULE_RETURN_KEY);
    const state = JSON.parse(raw) as Partial<ModuleReturnState>;
    return state.panelPath === panelPath && typeof state.scrollY === "number" ? state.scrollY : null;
  } catch {
    return null;
  }
}

export function restoreModuleScroll(scrollY: number) {
  const deadline = Date.now() + 2500;
  const restore = () => {
    window.scrollTo(0, scrollY);
    if (Math.abs(window.scrollY - scrollY) > 2 && Date.now() < deadline) {
      window.setTimeout(restore, 100);
    }
  };
  window.requestAnimationFrame(restore);
}
