-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT,
    "stripeCustomerId" TEXT,
    "introPriceUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "interests" TEXT NOT NULL DEFAULT '',
    "nickname" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Narrator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "childId" TEXT,
    "comicOrderId" TEXT,
    "relationship" TEXT NOT NULL,
    "customLabel" TEXT NOT NULL DEFAULT '',
    "displayName" TEXT NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'english',
    "status" TEXT NOT NULL DEFAULT 'invited',
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentStatement" TEXT NOT NULL DEFAULT '',
    "consentedAt" DATETIME,
    "audioPath" TEXT,
    "voiceId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "Narrator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Narrator_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Narrator_comicOrderId_fkey" FOREIGN KEY ("comicOrderId") REFERENCES "ComicOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "narratorId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "audioPath" TEXT,
    "audioMode" TEXT NOT NULL DEFAULT 'browser',
    "voiceLabel" TEXT NOT NULL DEFAULT 'Preview voice',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Story_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Story_narratorId_fkey" FOREIGN KEY ("narratorId") REFERENCES "Narrator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "isGift" BOOLEAN NOT NULL DEFAULT false,
    "giftedByEmail" TEXT,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerUserId" TEXT,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL DEFAULT '',
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "redeemCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "redeemedByUserId" TEXT,
    "redeemedAt" DATETIME,
    "checkoutId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftPurchase_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GiftPurchase_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComicOrder" (
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
    "checkoutId" TEXT,
    "deliveredAt" DATETIME,
    "error" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComicOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL DEFAULT '',
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL DEFAULT '{}',
    "amountCents" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "returnPath" TEXT NOT NULL DEFAULT '/',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MagicLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "channel" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Narrator_inviteToken_key" ON "Narrator"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftPurchase_redeemCode_key" ON "GiftPurchase"("redeemCode");

-- CreateIndex
CREATE UNIQUE INDEX "ComicOrder_shareToken_key" ON "ComicOrder"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLink_token_key" ON "MagicLink"("token");
