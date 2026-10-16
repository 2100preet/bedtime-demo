-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CheckoutSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "returnPath" TEXT NOT NULL DEFAULT '/',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CheckoutSession" ("amountCents", "createdAt", "description", "email", "id", "kind", "paidAt", "payload", "provider", "returnPath", "status", "stripeSessionId", "userId") SELECT "amountCents", "createdAt", "description", "email", "id", "kind", "paidAt", "payload", "provider", "returnPath", "status", "stripeSessionId", "userId" FROM "CheckoutSession";
DROP TABLE "CheckoutSession";
ALTER TABLE "new_CheckoutSession" RENAME TO "CheckoutSession";
CREATE TABLE "new_ComicOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL DEFAULT '',
    "childFirstName" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "interests" TEXT NOT NULL DEFAULT '',
    "nickname" TEXT NOT NULL DEFAULT '',
    "occasion" TEXT NOT NULL DEFAULT 'birthday',
    "birthdayDate" TEXT,
    "deliverOn" TEXT,
    "narratorChoice" TEXT NOT NULL,
    "photoConsent" BOOLEAN NOT NULL DEFAULT false,
    "photoConsentAt" DATETIME,
    "photoPaths" TEXT NOT NULL DEFAULT '[]',
    "photosDeletedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "shareToken" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "narration" TEXT NOT NULL DEFAULT '',
    "panelsJson" TEXT NOT NULL DEFAULT '[]',
    "characterJson" TEXT NOT NULL DEFAULT '{}',
    "audioPath" TEXT,
    "audioMode" TEXT NOT NULL DEFAULT 'browser',
    "pdfPath" TEXT,
    "voiceLabel" TEXT NOT NULL DEFAULT '',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "checkoutId" TEXT,
    "deliveredAt" DATETIME,
    "error" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComicOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ComicOrder" ("ageRange", "amountCents", "audioMode", "audioPath", "birthdayDate", "buyerEmail", "buyerName", "characterJson", "checkoutId", "childFirstName", "createdAt", "deliverOn", "deliveredAt", "error", "id", "interests", "language", "narration", "narratorChoice", "nickname", "occasion", "panelsJson", "pdfPath", "photoConsent", "photoConsentAt", "photoPaths", "photosDeletedAt", "shareToken", "status", "title", "userId", "voiceLabel") SELECT "ageRange", "amountCents", "audioMode", "audioPath", "birthdayDate", "buyerEmail", "buyerName", "characterJson", "checkoutId", "childFirstName", "createdAt", "deliverOn", "deliveredAt", "error", "id", "interests", "language", "narration", "narratorChoice", "nickname", "occasion", "panelsJson", "pdfPath", "photoConsent", "photoConsentAt", "photoPaths", "photosDeletedAt", "shareToken", "status", "title", "userId", "voiceLabel" FROM "ComicOrder";
DROP TABLE "ComicOrder";
ALTER TABLE "new_ComicOrder" RENAME TO "ComicOrder";
CREATE UNIQUE INDEX "ComicOrder_shareToken_key" ON "ComicOrder"("shareToken");
CREATE TABLE "new_GiftPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerUserId" TEXT,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL DEFAULT '',
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "redeemCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "redeemedByUserId" TEXT,
    "redeemedAt" DATETIME,
    "checkoutId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftPurchase_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GiftPurchase_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GiftPurchase" ("amountCents", "buyerEmail", "buyerName", "buyerUserId", "checkoutId", "createdAt", "id", "plan", "recipientEmail", "recipientName", "redeemCode", "redeemedAt", "redeemedByUserId", "status") SELECT "amountCents", "buyerEmail", "buyerName", "buyerUserId", "checkoutId", "createdAt", "id", "plan", "recipientEmail", "recipientName", "redeemCode", "redeemedAt", "redeemedByUserId", "status" FROM "GiftPurchase";
DROP TABLE "GiftPurchase";
ALTER TABLE "new_GiftPurchase" RENAME TO "GiftPurchase";
CREATE UNIQUE INDEX "GiftPurchase_redeemCode_key" ON "GiftPurchase"("redeemCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
