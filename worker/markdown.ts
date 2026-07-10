const pages: Record<string, string> = {
  '/': `---
title: Ethan Lally
description: Personal website and portfolio for Ethan Lally.
---

# Ethan Lally

Personal portfolio and contact links.

- [About](https://lally.lol/about)
- [Links](https://lally.lol/links)
- [Activity](https://lally.lol/activity)
`,
  '/about': `---
title: About Ethan Lally
description: Projects and background for Ethan Lally.
---

# About Ethan Lally

Visit [Ethan's links](https://lally.lol/links) or view [recent activity](https://lally.lol/activity).
`,
  '/links': `---
title: Ethan Lally links
description: Contact and social links for Ethan Lally.
---

# Ethan Lally links

- [GitHub](https://github.com/ethanlally)
- [LinkedIn](https://linkedin.com/in/ethanlally)
`,
  '/activity': `---
title: Ethan Lally activity
description: Recent public GitHub activity for Ethan Lally.
---

# Recent activity

Recent public repositories are available from [the GitHub API](https://lally.lol/api/github).
`
};

export function markdownFor(pathname: string): string {
  return pages[pathname] ?? pages['/'];
}
