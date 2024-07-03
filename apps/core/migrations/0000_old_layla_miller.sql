CREATE TABLE IF NOT EXISTS "board" (
	"cuid" varchar PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	CONSTRAINT "board_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post" (
	"cuid" varchar PRIMARY KEY NOT NULL,
	"content" text,
	"tripcode" varchar,
	"created" timestamp DEFAULT now() NOT NULL,
	"ip" varchar NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"hidden_at" timestamp,
	"hidden_by" boolean,
	"explicit_ban" boolean DEFAULT false NOT NULL,
	"thread_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thread" (
	"cuid" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"pinned" boolean DEFAULT false NOT NULL,
	"board_id" varchar NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"hidden_at" timestamp,
	"hidden_by" varchar
);
