# Steam Deck Flatpak Updater Plugin
A [decky-loader](https://github.com/SteamDeckHomebrew/deckly-loader) plugin for managing flatpak updates.

![screenshot](https://steamuserimages-a.akamaihd.net/ugc/1885347294331325509/8098EECB8DA11691B9151B1B7A815821F80D53B2/?imw=1200&imh=600 "Screenshot of plugin checking for updates")
### Dependencies

This template relies on the user having `pnpm` installed on their system.  
This can be downloaded from `npm` itself which is recommended. 

#### Linux

```bash
sudo npm i -g pnpm
pnpm i
pnpm run build
```

#### Other important information

Everytime you change the frontend code (`index.tsx` etc) you will need to rebuild using the commands from step 2 above or the build task if you're using vscode or a derivative.

Note: If you are receiving build errors due to an out of date library, you should run this command inside of your repository:

```bash
pnpm update decky-frontend-lib --latest
```
