These bots were originally leaked. To ensure safety and transparency, I'm releasing a revised version directly on my GitHub. Feel free to examine the source code for your understanding.

Installation:

1. Install the Tampermonkey browser extension (https://www.tampermonkey.net/).
2. Add the "script.user.js" file to Tampermonkey as a new userscript.
3. Edit the "config.json" file (within the "files" folder) to customize bot behavior.
4. Add proxies you intend to use in "proxies.txt" (in the "files" folder).

Running the Bots

1. Double-click the "run.bat" file. This will install required dependencies if it's the first run.

config.json Options

-   maxBots: The maximum number of bots you want to run simultaneously.
-   name: A base name for your bots. (e.g., "MyBot").
-   useAccounts: (true/false) If true, bots will attempt to log in using accounts.
-   skinToUse: The numerical ID of the skin you want your bots to use. Find skin IDs in the game.
-   skinChanger: (true/false) If true, bots will cycle through available skins.
-   proxyType: The type of proxy to use (e.g., "socks4", "socks5", "http").
-   useProxies: (true/false) If true, bots will use proxies from the "proxies.txt" file.

Note: Game updates might cause the bots to break.
