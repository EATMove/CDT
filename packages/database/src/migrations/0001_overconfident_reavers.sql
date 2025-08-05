DO $$ BEGIN
 CREATE TYPE "image_usage" AS ENUM('content', 'cover', 'diagram', 'illustration');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "handbook_images" ALTER COLUMN "usage" SET DATA TYPE image_usage;--> statement-breakpoint
ALTER TABLE "handbook_images" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_chapter_usage" ON "handbook_images" ("chapter_id","usage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_section_usage" ON "handbook_images" ("section_id","usage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_chapter_order" ON "handbook_images" ("chapter_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_section_order" ON "handbook_images" ("section_id","order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_created_at" ON "handbook_images" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_handbook_images_uploaded_by" ON "handbook_images" ("uploaded_by");