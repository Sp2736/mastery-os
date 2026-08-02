What to do in case of another user? They would want the commits to their profile to be shown in their repo on their github profile, ofcourse! Following are the ways to enable this:

### Steps to Setup Mastery OS for a New User

1. **Fork the Repository**
   Fork this repository to your own GitHub account so you have full control over the codebase and commits.

2. **Add Your Username to the Source Code**
   To enforce security, Mastery OS strictly validates the `userId`. You will need to add your lowercase username (e.g., `johndoe`) to the allowlist in the following files:
   - `lib/storage/readJson.ts` (in the `validateUserId` function)
   - `lib/storage/writeJson.ts` (in the `writeUserJson` function)
   - `components/AccessGate.tsx` (in the `window.getAccess` event listener)
   - `app/api/auth/session/route.ts` (in the `z.enum([...])` validation array)

3. **Initialize Your Data Directory**
   - Copy the existing `data/users/swayam` folder.
   - Rename the copied folder to your exact username (e.g., `data/users/johndoe`).
   - Open every `.json` file inside your new folder and change the `"userId"` field to your username.

4. **Generate a GitHub Personal Access Token (PAT)**
   - Go to your GitHub Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens.
   - Generate a new token with **Read and Write access to Code/Contents** for your forked repository.

5. **Configure Environment Variables**
   In your hosting provider (e.g., Vercel), set up the following environment variables for your project:
   - `GITHUB_TOKEN`: Your newly generated fine-grained PAT.
   - `GITHUB_OWNER`: Your GitHub username.
   - `GITHUB_REPO`: The name of your forked repository (e.g., `mastery-os`).
   - `SESSION_SECRET`: A secure random string used to sign your session cookie.

6. **Deploy the Application**
   Deploy your application to production (Vercel). Make sure `NODE_ENV` is set to `production` so that file writes trigger GitHub API commits instead of local filesystem writes.

7. **Log In and Start Committing**
   - Open your deployed application. You will see an "Access Denied" shield.
   - Open your browser's Developer Tools (F12) and go to the Console.
   - Type `window.getAccess('your_username')` and hit Enter to authenticate.
   
Now, every time you complete a task, milestone, or journal entry, Mastery OS will use the GitHub REST API to securely commit the updated JSON file directly to your repository, creating a beautiful green contribution graph on your GitHub profile!