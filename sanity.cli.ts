import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'd4yh3822',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
  /**
   * Auto-generate schema.json + sanity.types.ts on `sanity dev` / `sanity build`.
   * Cross-repo per ADR 0002 (TypeGen section): schema.json stays local, but the
   * generated types land in the site repo so it can import them directly.
   */
  typegen: {
    enabled: true,
    path: '../lvhomesbygigi/src/**/*.{ts,tsx,astro}',
    schema: 'schema.json',
    generates: '../lvhomesbygigi/sanity.types.ts',
  },
})
