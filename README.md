# Run and deploy your AI Studio app

This project is a full-stack application with a React frontend and an Express.js backend, ready to be deployed as a container on Google Cloud Run.

## Run Locally

**Prerequisites:**

*   Node.js
*   A MongoDB database URI. You can get one for free from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

### 1. Configure Environment Variables

Create a file named `.env` in the root directory of the project. This file will hold your secret keys.

Copy the contents of `.env.example` into your new `.env` file and fill in the values:

```
# Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# Your MongoDB connection string
MONGODB_URI=your_mongodb_connection_uri
MONGODB_DB=your_database_name
```

### 2. Install Dependencies

Install all the necessary packages for both the client and server:

```bash
npm install
```

### 3. Run the Development Servers

You need to run two processes in separate terminal windows:

*   **Terminal 1: Start the Backend Server**
    ```bash
    npm run dev:server
    ```
    This will start the Express API server on `http://localhost:8080` with hot-reloading.

*   **Terminal 2: Start the Frontend Vite Server**
    ```bash
    npm run dev
    ```
    This will start the React development server on `http://localhost:5173`. It is configured to proxy API requests to your backend server.

Once both are running, open **`http://localhost:5173`** in your browser.

## Deploy to Google Cloud Run

**Prerequisites:**

*   Google Cloud SDK (`gcloud`) installed and configured.
*   A Google Cloud project with billing enabled.
*   Enable the Cloud Run and Artifact Registry APIs.

1.  **Build the container image:**
    Use Google Cloud Build to build your container image from the `Dockerfile` and push it to Artifact Registry. Replace `PROJECT_ID` with your Google Cloud Project ID and `my-app` with your desired app name.

    ```bash
    gcloud builds submit --tag gcr.io/PROJECT_ID/my-app
    ```

2.  **Deploy to Cloud Run:**
    Deploy your container image to Cloud Run. This command will also set the necessary environment variables from your local `.env` file.

    ```bash
    gcloud run deploy my-app \
      --image gcr.io/PROJECT_ID/my-app \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars-from-file .env
    ```

After deployment, `gcloud` will provide you with a URL to access your live application.
