/*
  Warnings:

  - Added the required column `displayOrder` to the `team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ProjectMethodology" AS ENUM ('SCRUM', 'KANBAN', 'SCRUMBAN', 'WATERFALL', 'HYBRID', 'CUSTOM');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('USER_STORY', 'TASK', 'SUBTASK', 'BUG', 'SPIKE', 'ENABLER');

-- CreateEnum
CREATE TYPE "IssuePriority" AS ENUM ('LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST');

-- CreateEnum
CREATE TYPE "Allergen" AS ENUM ('CEREALS_GLUTEN', 'CRUSTACEANS', 'EGGS', 'FISH', 'PEANUTS', 'SOYBEANS', 'MILK', 'NUTS', 'CELERY', 'MUSTARD', 'SESAME', 'SULPHITES', 'LUPIN', 'MOLLUSCS');

-- CreateEnum
CREATE TYPE "IngredientCategory" AS ENUM ('MEAT', 'FISH', 'SEAFOOD', 'VEGETABLE', 'FRUIT', 'DAIRY', 'EGG', 'CEREAL_STARCH', 'LEGUME', 'FAT_OIL', 'BEVERAGE', 'COMPOSITE_DISH', 'SPICE_SAUCE', 'ADDITIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "GrowthHabit" AS ENUM ('TREE', 'SHRUB', 'SUB_SHRUB', 'HERB', 'VINE', 'CLIMBER', 'CREEPER', 'GROUNDCOVER', 'BAMBOO', 'SUCCULENT', 'AQUATIC', 'PARASITE');

-- CreateEnum
CREATE TYPE "CulinaryUse" AS ENUM ('FRUIT_VEGETABLE', 'LEAF_VEGETABLE', 'ROOT_VEGETABLE', 'BULB_VEGETABLE', 'STEM_VEGETABLE', 'FLOWER_VEGETABLE', 'LEGUME', 'FRUIT', 'HERB', 'MEDICINAL', 'ORNAMENTAL', 'COVER_CROP', 'FORAGE');

-- CreateEnum
CREATE TYPE "PlantUse" AS ENUM ('CULINARY', 'HERBAL', 'ORNAMENTAL', 'MELLIFEROUS', 'MEDICINAL', 'AROMATIC', 'DYE', 'FIBER', 'FORAGE', 'COVER_CROP', 'REPELLENT', 'COMPANION', 'CONSERVATION', 'EDUCATIONAL');

-- AlterTable
ALTER TABLE "team" ADD COLUMN     "displayOrder" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "visibility" "ProjectVisibility" NOT NULL DEFAULT 'PRIVATE',
    "methodology" "ProjectMethodology" NOT NULL DEFAULT 'SCRUM',
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "settings" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "saveProject" JSONB,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" "IssueType" NOT NULL,
    "key" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'TODO',
    "priority" "IssuePriority" NOT NULL DEFAULT 'MEDIUM',
    "storyPoints" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "teamId" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "prepMinutes" INTEGER,
    "cookMinutes" INTEGER,
    "servings" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "allergen" "Allergen"[],
    "saverecipe" JSONB,

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredientCategory" "IngredientCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allergen" "Allergen"[],

    CONSTRAINT "recipe_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_step" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "durationMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_species" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "commonNameFr" TEXT NOT NULL,
    "commonNameEs" TEXT NOT NULL,
    "latinName" TEXT,
    "family" TEXT,
    "needs" JSONB NOT NULL,
    "growthHabit" "GrowthHabit" NOT NULL,
    "description" TEXT,
    "plantUse" "PlantUse"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_location" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" VARCHAR(128) NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'GARDEN',
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "culinaryUse" "CulinaryUse" NOT NULL,

    CONSTRAINT "plant_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "teamId" TEXT,
    "speciesId" TEXT,
    "locationId" TEXT,
    "label" VARCHAR(255) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    "plantedAt" TIMESTAMP(3),
    "expectedHarvestAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_care_log" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "userId" TEXT,
    "type" VARCHAR(32) NOT NULL,
    "notes" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_care_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_harvest" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "userId" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit" VARCHAR(16) NOT NULL DEFAULT 'kg',
    "quality" VARCHAR(32),
    "harvestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_media" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'IMAGE',
    "mimeType" VARCHAR(128),
    "alt" VARCHAR(255),
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "teamId" TEXT,
    "categoryId" TEXT,
    "tag" TEXT[],
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "status" VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "savePost" JSONB,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_category" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_author" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" VARCHAR(32) NOT NULL DEFAULT 'PRIMARY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_author_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "post_comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_media" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "mimeType" VARCHAR(128),
    "alt" VARCHAR(255),
    "caption" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaveReciepes" (
    "id" TEXT NOT NULL,
    "saveReciepes" JSONB,
    "workspaceId" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deltedAt" TIMESTAMP(3),

    CONSTRAINT "SaveReciepes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavePlantes" (
    "id" TEXT NOT NULL,
    "savePlantes" JSONB,
    "workspaceId" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deltedAt" TIMESTAMP(3),

    CONSTRAINT "SavePlantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavePosts" (
    "id" TEXT NOT NULL,
    "savePosts" JSONB,
    "workspaceId" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deltedAt" TIMESTAMP(3),

    CONSTRAINT "SavePosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToPostTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToPostTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "project_workspaceId_status_idx" ON "project"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "project_workspaceId_createdAt_idx" ON "project"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "project_startDate_targetDate_idx" ON "project"("startDate", "targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "project_workspaceId_key_key" ON "project"("workspaceId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "project_workspaceId_slug_key" ON "project"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "issue_projectId_type_idx" ON "issue"("projectId", "type");

-- CreateIndex
CREATE INDEX "issue_projectId_status_idx" ON "issue"("projectId", "status");

-- CreateIndex
CREATE INDEX "issue_projectId_priority_idx" ON "issue"("projectId", "priority");

-- CreateIndex
CREATE INDEX "issue_parentId_idx" ON "issue"("parentId");

-- CreateIndex
CREATE INDEX "issue_projectId_position_idx" ON "issue"("projectId", "position");

-- CreateIndex
CREATE INDEX "issue_createdAt_idx" ON "issue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "issue_projectId_key_key" ON "issue"("projectId", "key");

-- CreateIndex
CREATE INDEX "recipe_workspaceId_status_idx" ON "recipe"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "recipe_teamId_idx" ON "recipe"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_workspaceId_slug_key" ON "recipe"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "recipe_ingredient_recipeId_idx" ON "recipe_ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "recipe_step_recipeId_position_idx" ON "recipe_step"("recipeId", "position");

-- CreateIndex
CREATE INDEX "plant_species_workspaceId_idx" ON "plant_species"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "plant_species_workspaceId_commonNameFr_key" ON "plant_species"("workspaceId", "commonNameFr");

-- CreateIndex
CREATE INDEX "plant_location_workspaceId_parentId_idx" ON "plant_location"("workspaceId", "parentId");

-- CreateIndex
CREATE INDEX "plant_location_workspaceId_type_idx" ON "plant_location"("workspaceId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "plant_location_workspaceId_parentId_name_key" ON "plant_location"("workspaceId", "parentId", "name");

-- CreateIndex
CREATE INDEX "plant_workspaceId_status_idx" ON "plant"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "plant_workspaceId_locationId_idx" ON "plant"("workspaceId", "locationId");

-- CreateIndex
CREATE INDEX "plant_speciesId_idx" ON "plant"("speciesId");

-- CreateIndex
CREATE INDEX "plant_teamId_idx" ON "plant"("teamId");

-- CreateIndex
CREATE INDEX "plant_care_log_plantId_performedAt_idx" ON "plant_care_log"("plantId", "performedAt");

-- CreateIndex
CREATE INDEX "plant_care_log_userId_idx" ON "plant_care_log"("userId");

-- CreateIndex
CREATE INDEX "plant_harvest_plantId_harvestedAt_idx" ON "plant_harvest"("plantId", "harvestedAt");

-- CreateIndex
CREATE INDEX "plant_harvest_userId_idx" ON "plant_harvest"("userId");

-- CreateIndex
CREATE INDEX "plant_media_plantId_position_idx" ON "plant_media"("plantId", "position");

-- CreateIndex
CREATE INDEX "post_workspaceId_status_idx" ON "post"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "post_workspaceId_publishedAt_idx" ON "post"("workspaceId", "publishedAt");

-- CreateIndex
CREATE INDEX "post_teamId_idx" ON "post"("teamId");

-- CreateIndex
CREATE INDEX "post_categoryId_idx" ON "post"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "post_workspaceId_slug_key" ON "post"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "post_category_workspaceId_position_idx" ON "post_category"("workspaceId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "post_category_workspaceId_slug_key" ON "post_category"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "post_tag_workspaceId_idx" ON "post_tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "post_tag_workspaceId_slug_key" ON "post_tag"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "post_author_userId_idx" ON "post_author"("userId");

-- CreateIndex
CREATE INDEX "post_author_postId_order_idx" ON "post_author"("postId", "order");

-- CreateIndex
CREATE INDEX "post_comment_postId_createdAt_idx" ON "post_comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_comment_authorId_idx" ON "post_comment"("authorId");

-- CreateIndex
CREATE INDEX "post_media_postId_position_idx" ON "post_media"("postId", "position");

-- CreateIndex
CREATE INDEX "_PostToPostTag_B_index" ON "_PostToPostTag"("B");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_step" ADD CONSTRAINT "recipe_step_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_species" ADD CONSTRAINT "plant_species_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_location" ADD CONSTRAINT "plant_location_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_location" ADD CONSTRAINT "plant_location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "plant_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant" ADD CONSTRAINT "plant_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant" ADD CONSTRAINT "plant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant" ADD CONSTRAINT "plant_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "plant_species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant" ADD CONSTRAINT "plant_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "plant_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_care_log" ADD CONSTRAINT "plant_care_log_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_care_log" ADD CONSTRAINT "plant_care_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_harvest" ADD CONSTRAINT "plant_harvest_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_harvest" ADD CONSTRAINT "plant_harvest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_media" ADD CONSTRAINT "plant_media_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "post_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_category" ADD CONSTRAINT "post_category_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tag" ADD CONSTRAINT "post_tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_author" ADD CONSTRAINT "post_author_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_author" ADD CONSTRAINT "post_author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveReciepes" ADD CONSTRAINT "SaveReciepes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaveReciepes" ADD CONSTRAINT "SaveReciepes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavePlantes" ADD CONSTRAINT "SavePlantes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavePlantes" ADD CONSTRAINT "SavePlantes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavePosts" ADD CONSTRAINT "SavePosts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavePosts" ADD CONSTRAINT "SavePosts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_A_fkey" FOREIGN KEY ("A") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToPostTag" ADD CONSTRAINT "_PostToPostTag_B_fkey" FOREIGN KEY ("B") REFERENCES "post_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
