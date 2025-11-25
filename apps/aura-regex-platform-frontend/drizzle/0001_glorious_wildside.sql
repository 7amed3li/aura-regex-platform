CREATE TABLE `folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`input` text NOT NULL,
	`output` text,
	`userFeedback` varchar(20),
	`ruleId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`folderId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`pattern` text NOT NULL,
	`naturalLanguageInput` text,
	`flags` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`userId` int NOT NULL,
	`input` text NOT NULL,
	`expectedMatches` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testCases_id` PRIMARY KEY(`id`)
);
