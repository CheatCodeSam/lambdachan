CREATE TABLE IF NOT EXISTS "media" (
	"cuid" varchar PRIMARY KEY NOT NULL,
	"post_id" varchar,
	"mimetype" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"ip" varchar NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
