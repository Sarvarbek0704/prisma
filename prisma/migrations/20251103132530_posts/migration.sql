/*
  Warnings:

  - You are about to alter the column `title` on the `Posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - Added the required column `content` to the `Posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "content" TEXT NOT NULL,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(50);

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
