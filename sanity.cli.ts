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
   * Cross-repo query typing for the site is wired later — see
   * ../lvhomesbygigi/docs/adr/0002-i18n.md (TypeGen section).
   */
  typegen: {
    enabled: true,
  },
})
