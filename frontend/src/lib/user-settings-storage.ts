export const USER_SETTINGS_STORAGE_KEY = "route53.user.settings";

/** Runs before hydration so `data-theme` matches localStorage on first paint. */
export const THEME_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem("${USER_SETTINGS_STORAGE_KEY}");var s=raw?JSON.parse(raw):{};var mode=s.visualMode==="light"||s.visualMode==="dark"||s.visualMode==="browser"?s.visualMode:"browser";var lang=typeof s.language==="string"?s.language:"en-US";var dark=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=mode==="light"?"light":mode==="dark"?"dark":dark?"dark":"light";var el=document.documentElement;el.dataset.theme=theme;el.style.colorScheme=theme;if(lang)el.lang=lang;}catch(e){}})();`;
