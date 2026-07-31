# Firebase Setup for eTracker

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com/
2. Click Create a project.
3. Enter a project name such as eTracker.
4. Follow the prompts to create the project.

## 2. Enable authentication providers

### Email/Password Authentication

1. Open Authentication in the Firebase console.
2. Go to the Sign-in method tab.
3. Enable Email/Password.

### Google Sign-In

1. In the same Sign-in method tab, enable Google.
2. Configure the OAuth consent screen if prompted.
3. Save the provider settings.

## 3. Obtain Firebase config values

1. In your Firebase project console, open Project settings.
2. Under Your apps, select the web app or create one.
3. Copy the config values:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

## 4. Create the environment file

Create a .env file in the project root with the following values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

You can also copy the provided .env.example file as a template.

## 5. Configure Vercel environment variables

1. Open your Vercel project dashboard.
2. Go to Settings > Environment Variables.
3. Add each VITE_FIREBASE_* variable.
4. Redeploy the project after saving the values.

## 6. Redeploy

After adding the environment values:

```bash
npm run build
```

Then redeploy via Vercel or your deployment platform.
