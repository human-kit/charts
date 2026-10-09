type ImportMetaWithEnv = ImportMeta & { readonly env?: { readonly DEV?: boolean } };

/** Whether the code runs in a development build. A production build removes the dev checks. */
export const dev = (import.meta as ImportMetaWithEnv).env?.DEV ?? false;
