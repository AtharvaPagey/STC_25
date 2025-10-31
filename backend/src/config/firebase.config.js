import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set!");
    process.exit(1);
  }

  console.log("Parsing Firebase service account key...");
  const serviceAccount = JSON.parse(serviceAccountKey);

  console.log("Service account project_id:", serviceAccount.project_id);

  // Fix escaped newlines in private key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n"
    );
  }

  console.log("Initializing Firebase Admin SDK...");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization failed:");
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  process.exit(1);
}

export default admin;
