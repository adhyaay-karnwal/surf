# Security on the web

Breeze contains browsing — the ability to open web pages. We have to assume that you will encounter untrusted content and therefore Breeze should protect what’s important to you — other web pages you visit, your data in Breeze, and your computer — from potentially malicious actors.

Breeze’s core browsing engine is [Chromium](https://www.chromium.org/Home/), which is an open-source browsing engine that powers Google Chrome, Microsoft Edge and other notable browsers (Brave, Vivaldi, etc). We ship Breeze alongside Chromium’s extended stable release channel (via the [Electron project](https://www.electronjs.org/)). If there is an important fix in Chromium, the fix needs to be shipped as soon as possible.

Isolation is a core tenet of Breeze’s architecture to ensure security. Any website loaded is sandboxed — so even if the website is malicious, other websites you access, other parts of Breeze and your system are protected. Similarly, we design other systems within Breeze to be isolated.

Because Breeze is at an early stage, we have not yet implemented certain measures that are present in many browsers.

- Breeze does not yet automatically detect if the website you are visiting is potentially malicious or phishing → please proceed with caution if you are visiting untrusted websites.
- Breeze does not yet automatically detect and block potentially malicious downloads → please only download files from trusted sources.
- For the technically minded: certificate transparency is not supported.

If you find a vulnerability, report it here: [https://github.com/breeze/breeze/security/policy](https://github.com/breeze/breeze/security/policy)
