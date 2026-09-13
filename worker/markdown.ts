const pages: Record<string, string> = {
  '/': `---
title: Ethan Lally
description: Personal website and portfolio for Ethan Lally.
---

# Ethan Lally

- [About](https://lally.lol/about)
- [Links](https://lally.lol/links)
- [Activity](https://lally.lol/activity)
`,
  '/about': `---
title: About Ethan Lally
description: Projects and background for Ethan Lally.
---

# About Ethan Lally

## Education

### University of Dayton

Bachelor of Science in Computer Science | AUGUST 2025 - EXPECTED MAY 2028

- Concentration in Cybersecurity. Major GPA: 4.0/4.0.
- Entered with sophomore standing after earning 40 credits through high school AP exams.

### Cypress Creek High School

Graduate | AUGUST 2021 - MAY 2025

- Ranked 10th out of 837 students.
- Passed all 13 AP exams, including scores of 5 on Calculus BC and Physics 1.
- Served as an officer of National Honor Society.

## Technical Skills

- Languages: Java, C#, Python, TypeScript, JavaScript.
- Frameworks: .NET / ASP.NET Core, Angular, Entity Framework Core, .NET Aspire, NgRx Signals.
- Platforms & Tools: Git / GitHub, GitHub Actions, CodeQL, SQL Server, Cloudflare Workers, DBeaver, SSMS.

## Experience

### Software Development Intern

Dayton Freight Lines | MAY 2026 - PRESENT

- Develop backend services and REST APIs for enterprise web applications using C# and .NET Core.
- Build Angular and TypeScript interfaces and integrate them with backend systems.

Technologies: C#, .NET / ASP.NET Core, Angular, TypeScript.

### Technical Support Representative

UDit, University of Dayton | JANUARY 2026 - PRESENT

- Troubleshoot and resolve technical issues for students and faculty.
- Provide professional customer service while addressing technology support needs.

### Phishing Simulation & Training Associate

Cyber Flyers | SEPTEMBER 2025 - PRESENT

- Plan mock phishing campaigns modeled on attacker behavior, define test scope and cadence, and create email templates supporting campus cybersecurity awareness.
- Collaborate with a subsection of the Phishing Simulation and Training team to build the Cyber Flyers website.

### Code Sensei

Code Ninjas | JUNE 2025 - DECEMBER 2025

- Guided students through debugging and problem-solving.
- Collaborated with instructors to improve curriculum delivery and track student progress.

Technologies: C#, JavaScript.

## Projects

### [Personal Portfolio](https://github.com/ethanlally/ethanlally.github.io)

This website | JUNE 2026 - PRESENT

- Built an Angular and TypeScript portfolio with Cloudflare Worker endpoints for GitHub and Spotify integrations, edge caching, and token reuse.
- Automated dependency installation, testing, production builds, and deployment of the GitHub Pages static mirror with GitHub Actions.

Technologies: Angular, TypeScript, Cloudflare Workers, GitHub Actions.

### [ACM Meeting Records](https://github.com/acm-udayton/ACM-Meeting-Records)

Open-source contributor | OCTOBER 2025 - PRESENT

- Contributed nine merged pull requests to a Python, Flask, and PostgreSQL application for meeting attendance and notes.
- Added meeting-time corrections, fixed file and minutes formatting issues, and contributed documentation and code review.
- Reviewed MFA and access-control flows and documented reproducible CSRF and authorization weaknesses with remediation criteria.

Technologies: Python, Flask, PostgreSQL, Security Review.

### [FleetTracker](https://github.com/ethanlally/FleetTracker)

Fleet and rental management | MAY 2026 - JUNE 2026

- Developed a full-stack application with .NET 10, ASP.NET Core Minimal APIs, .NET Aspire, EF Core and SQL Server, and Angular with NgRx Signals.
- Implemented customer, vehicle, rental, availability, and maintenance workflows with database migrations and OpenAPI documentation.
- Configured linting and scheduled CodeQL scanning.

Technologies: C#, .NET Aspire, EF Core, SQL Server, Angular, NgRx Signals.

### [SkyBlock Nexus](https://github.com/ethanlally/skyblocknexus)

Hypixel SkyBlock profile explorer

- Build a Spring Boot API and React frontend for Minecraft username lookup and shareable SkyBlock profile URLs.
- Display skill levels, collection progress, currencies, and equipped armor and equipment using Hypixel game data.
- Handle private or missing profiles explicitly, cache successful API responses, and respect upstream rate limits.

Technologies: Java, Spring Boot, React, Hypixel API.

### [Cyber Flyers Website](https://github.com/ethanlally/cyber-flyers-website)

Collaborative club website project

- Working with the Cyber Flyers team to develop the club's website using Astro.

Technologies: Astro, CSS, Git.

### [Snake Game](https://github.com/ethanlally/snake)

CPS 150 project

- Built a Java Snake game as a computer science coursework project.

Technologies: Java.

### Code Golf

Programming challenges

- Collection of code golf solutions for the website code.golf.

Technologies: Java.

### Competitive Programming

HPE CodeWars & UIL

- Attended HPE CodeWars in Houston from 2023 to 2025, solving programming problems in teams.
- Competed in Computer Science UIL competitions throughout high school.

Technologies: Java.

## Leadership & Community

### Vice President

Circle K International | AUGUST 2026 - PRESENT

- Help plan the chapter's reestablishment and support the President on assigned organizational tasks.

### Vice President

Association for Computing Machinery | APRIL 2026 - PRESENT

- Previously served as Treasurer from September 2025 to April 2026, raising $1,500 for club projects.
- Support the President on assigned club initiatives.

### Community Service

250+ volunteer hours

- Completed more than 250 hours of volunteer service.

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
`,
};

export function markdownFor(pathname: string): string {
  return pages[pathname] ?? pages['/'];
}
