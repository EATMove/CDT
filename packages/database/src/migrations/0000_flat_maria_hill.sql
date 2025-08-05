DO $$ BEGIN
 CREATE TYPE "chapter_status" AS ENUM('LOCKED', 'UNLOCKED', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "content_format" AS ENUM('HTML', 'MARKDOWN', 'PLAIN_TEXT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_type" AS ENUM('FREE', 'MEMBER_ONLY', 'TRIAL_INCLUDED', 'PREMIUM');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "publish_status" AS ENUM('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "login_method" AS ENUM('EMAIL', 'PHONE', 'GOOGLE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "province" AS ENUM('AB', 'BC', 'ON');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_type" AS ENUM('FREE', 'MEMBER', 'TRIAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "language" AS ENUM('ZH', 'EN', 'HYBRID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "question_type" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "quiz_type" AS ENUM('CHAPTER', 'SIMULATION', 'WRONG_QUESTIONS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "feedback_status" AS ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "feedback_type" AS ENUM('BUG', 'FEATURE', 'IMPROVEMENT', 'COMPLAINT', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmarks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"chapter_id" varchar(36) NOT NULL,
	"section_id" varchar(36),
	"province" "province" NOT NULL,
	"position" integer NOT NULL,
	"note" text,
	"highlighted_text" text,
	"color" varchar(20) DEFAULT 'yellow',
	"is_private" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handbook_chapters" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"title_en" varchar(200),
	"description" text NOT NULL,
	"description_en" text,
	"order" integer NOT NULL,
	"province" "province" NOT NULL,
	"content_format" "content_format" DEFAULT 'HTML' NOT NULL,
	"estimated_read_time" integer NOT NULL,
	"cover_image_url" varchar(500),
	"cover_image_alt" varchar(200),
	"payment_type" "payment_type" DEFAULT 'FREE' NOT NULL,
	"free_preview_sections" integer DEFAULT 0,
	"prerequisite_chapters" text[],
	"publish_status" "publish_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"author_id" varchar(36),
	"last_edited_by" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handbook_content_versions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"chapter_id" varchar(36),
	"section_id" varchar(36),
	"version" varchar(20) NOT NULL,
	"version_note" text,
	"content_snapshot" json NOT NULL,
	"change_type" varchar(50) NOT NULL,
	"change_description" text,
	"created_by" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handbook_images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"chapter_id" varchar(36),
	"section_id" varchar(36),
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" varchar(200),
	"caption" text,
	"caption_en" text,
	"usage" varchar(50) DEFAULT 'content' NOT NULL,
	"order" integer DEFAULT 0,
	"uploaded_by" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "handbook_sections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"chapter_id" varchar(36) NOT NULL,
	"title" varchar(200) NOT NULL,
	"title_en" varchar(200),
	"order" integer NOT NULL,
	"content" text NOT NULL,
	"content_en" text,
	"is_free" boolean DEFAULT true NOT NULL,
	"required_user_type" text[],
	"word_count" integer DEFAULT 0,
	"estimated_read_time" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"chapter_id" varchar(36) NOT NULL,
	"section_id" varchar(36),
	"province" "province" NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"current_position" integer DEFAULT 0 NOT NULL,
	"total_length" integer NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"last_read_at" timestamp NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"reading_language" varchar(10) DEFAULT 'ZH'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"width" integer,
	"height" integer,
	"file_size" integer NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"alt" varchar(200),
	"caption" text,
	"is_active" boolean DEFAULT true,
	"uploaded_by" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"google_id" varchar(100),
	"password_hash" text,
	"primary_login_method" "login_method" NOT NULL,
	"province" "province" NOT NULL,
	"user_type" "user_type" DEFAULT 'FREE' NOT NULL,
	"trial_end_date" timestamp,
	"membership_end_date" timestamp,
	"invite_code" varchar(10),
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"google_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"last_login_method" "login_method",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_codes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"code" varchar(6) NOT NULL,
	"type" varchar(20) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_options" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"question_id" varchar(36) NOT NULL,
	"text" text NOT NULL,
	"text_en" text,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"chapter_id" varchar(36) NOT NULL,
	"province" "province" NOT NULL,
	"type" "question_type" NOT NULL,
	"title" varchar(300) NOT NULL,
	"title_en" varchar(300),
	"content" text NOT NULL,
	"content_en" text,
	"image_url" varchar(500),
	"explanation" text NOT NULL,
	"explanation_en" text,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" "quiz_type" NOT NULL,
	"chapter_id" varchar(36),
	"province" "province" NOT NULL,
	"language" "language" DEFAULT 'HYBRID' NOT NULL,
	"question_ids" text[] NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"is_passed" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_answers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"question_id" varchar(36) NOT NULL,
	"selected_options" text[] NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"answered_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter_progress" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"chapter_id" varchar(36) NOT NULL,
	"province" "province" NOT NULL,
	"reading_progress" integer DEFAULT 0 NOT NULL,
	"is_reading_completed" boolean DEFAULT false NOT NULL,
	"practice_count" integer DEFAULT 0 NOT NULL,
	"best_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"average_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"last_practice_at" timestamp,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learning_stats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"province" "province" NOT NULL,
	"total_study_time" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"correct_questions" integer DEFAULT 0 NOT NULL,
	"chapters_completed" integer DEFAULT 0 NOT NULL,
	"simulation_attempts" integer DEFAULT 0 NOT NULL,
	"simulation_passed" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_study_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wrong_questions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"question_id" varchar(36) NOT NULL,
	"province" "province" NOT NULL,
	"wrong_answers" varchar(500)[] NOT NULL,
	"correct_answers" varchar(500)[] NOT NULL,
	"wrong_count" integer DEFAULT 1 NOT NULL,
	"last_wrong_at" timestamp NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_configs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" varchar(500),
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_versions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"version" varchar(20) NOT NULL,
	"build_number" integer NOT NULL,
	"platform" varchar(20) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"download_url" varchar(500),
	"release_notes" text,
	"release_notes_en" text,
	"min_os_version" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_versions_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"type" "feedback_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"email" varchar(255),
	"device_info" text,
	"app_version" varchar(50),
	"image_urls" text[],
	"status" "feedback_status" DEFAULT 'PENDING' NOT NULL,
	"admin_notes" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invite_codes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"created_by" varchar(36),
	"used_by" varchar(36),
	"trial_days" integer DEFAULT 3 NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"action_url" varchar(500),
	"data" text,
	"expires_at" timestamp,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_section_id_handbook_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "handbook_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_chapters" ADD CONSTRAINT "handbook_chapters_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_chapters" ADD CONSTRAINT "handbook_chapters_last_edited_by_users_id_fk" FOREIGN KEY ("last_edited_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_content_versions" ADD CONSTRAINT "handbook_content_versions_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_content_versions" ADD CONSTRAINT "handbook_content_versions_section_id_handbook_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "handbook_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_content_versions" ADD CONSTRAINT "handbook_content_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_images" ADD CONSTRAINT "handbook_images_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_images" ADD CONSTRAINT "handbook_images_section_id_handbook_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "handbook_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_images" ADD CONSTRAINT "handbook_images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "handbook_sections" ADD CONSTRAINT "handbook_sections_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reading_records" ADD CONSTRAINT "reading_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reading_records" ADD CONSTRAINT "reading_records_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reading_records" ADD CONSTRAINT "reading_records_section_id_handbook_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "handbook_sections"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_chapter_id_handbook_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "handbook_chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "learning_stats" ADD CONSTRAINT "learning_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wrong_questions" ADD CONSTRAINT "wrong_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wrong_questions" ADD CONSTRAINT "wrong_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_configs" ADD CONSTRAINT "app_configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_used_by_users_id_fk" FOREIGN KEY ("used_by") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
