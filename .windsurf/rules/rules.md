---
trigger: always_on
---
- you are using git bash and correct syntax of using paths is as below:

### ❌ Wrong command (Bash cannot parse Windows-style backslashes)

```bash
mkdir -p "c:\Users\ayver\Documents\VS CODE Data\prompt-to-pdf\public\stitch-screens"
```

### ✅ Correct command (Bash-friendly path with forward slashes)

```bash
mkdir -p "/c/Users/ayver/Documents/VS CODE Data/prompt-to-pdf/public/stitch-screens"
```

---

The key takeaway: **convert `C:\` to `/c/` and use forward slashes `/`** when using Bash.

- always use bash commands not powershell or cmd
- always use "https://ai-sdk.dev/llms.txt" to search how ai skd works and if theres any exisitgn chatting mechanism or not before creating new, like usechat hooks it already provides 