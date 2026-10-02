CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`learner` text NOT NULL,
	`day` text NOT NULL,
	`created` integer NOT NULL,
	`kind` text NOT NULL,
	`scene` text NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_day` ON `events` (`day`);--> statement-breakpoint
CREATE TABLE `learners` (
	`id` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`consent` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`learner` text NOT NULL,
	`day` text NOT NULL,
	`created` integer NOT NULL,
	`device` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visits_day` ON `visits` (`day`);--> statement-breakpoint
CREATE INDEX `visits_learner` ON `visits` (`learner`);