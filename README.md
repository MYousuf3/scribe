# Scribe - AI-Powered Changelog Generator

Scribe is a modern Next.js application that automatically generates professional changelogs from Git commit history using AI. It features a cuneiform-inspired design theme and integrates with GitHub OAuth for authentication.

To use scribe, simply visit https://scribe-changelog-eosin.vercel.app/. You can search for an existing project, or link your GitHub and create a changelog yourself.

Additionally, you can run the project yourself by cloning the repo and running `npm run dev` in the `/scribe` directory, but you will have to provide a `.env` file with these API Keys:

```
MONGODB_CONNECTION_STRING=<mongodb-database-string>
GEMINI_API_KEY=<api-key>
GITHUB_TOKEN=<github-user-token>

GITHUB_CLIENT_ID=<github-client-id>

GITHUB_CLIENT_SECRET=<github-client-secret>
NEXTAUTH_URL=<localhost:3000>
NEXTAUTH_SECRET=<long-random-key>
```

Scribe is built with Typescript, MongoDB, Google Gemini, and deployed onto Vercel. 

MongoDB was chosen since projects are mostly independent of each other, making document-based non-relational storage work well. Information for projects can be stored in isolation of each other, and MongoDB is easy to integrate into a small application, which led to me using it. 

Vercel was chosen because its compatibility with Next.js, simple deployment, and instant CI/CD. This allowed me to catch and deal with bugs immediately, with Vercel displaying exactly where the bugs where. It also made it easy to store environment variables within the deployment, so I didn't have to worry about a separate server running. 

Google Gemini was (honestly) mostly used due to the availability of credits (Gemini Student Plan). The prompting and writing is not very compute intensive, and any SOTA LLM model would suffice. 

Specific Product Choices:
- I tried to keep the page minimal. There is a place to generate project logs, and a place to search for project logs. Users can quickly find what they're looking for and everything is centralized.

- GitHub Auth integration: It makes sense to link a GitHub account as a developer, since the project is based on GitHub repositories. GitLab would be something I would add in the future, but there is no need for too much account information, so linking GitHub is easy and relevant. It's also important that signing in isn't required to view logs, as the identity of a pure viewer is irrelevant. We don't want to add any friction in someone who simply wants to view logs, so I only require auth for the dev tool.

- Editing/Deleting Logs: Developers have the ability to edit the generated log before it is pushed, as LLMs will not always get it 100% right, or may miss out on a key detail. A hallucination could be very costly if it it misconstrues important changes or documentation! Developers can also delete logs if a commit gets reverted, so the logs are always accurate.

- Scribe Theme: The ancient theme of Scribe as noting down the repositories is a nice touch of simplicity to make the website more fun and appealing to viewers. We stare at black/white text on IDEs all day, a bit of color is nice to have. 

- Changelog Generation: Devs can specify how far they want to go back in terms of commits. The limit is 100, just so the API doesn't overload (since I'm using a relatively low context call). This allows devs to isolate a change based on a certain number of commits, and display that change. Additionally, generating a changelog for an existing project will automatically link back to that project, so the list of logs can grow with no worry of duplicate repositories. 

AI Tools:
This project was built with 2 main tools:
- Gemini 2.5 Flash: I used Gemini for the initial stages: Developing a high level overview, making sure all requirements were met, planning out a basic design, and validating all technical decisions. This served as my 'advisor', or a peer to review my work before I wrote any code. 
- Claude 4 Sonnet w/ Cursor: Much of the code was generated with Claude. I broke down features/steps into incremental changes and would work through it until it was complete. I would test the feature with `npm run dev`, review the code to ensure there were no blatant security issues or bad programming practices, and then move onto the next task. This made it so I could be in complete control of what was being done/built, but the rate of the code produced was much faster. 