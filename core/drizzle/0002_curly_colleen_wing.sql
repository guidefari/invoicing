CREATE TABLE `bank_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`account_holder_name` text NOT NULL,
	`bank_name` text NOT NULL,
	`account_number` text NOT NULL,
	`branch_code` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `invoices` ADD `bank_account_id` integer REFERENCES bank_accounts(id);--> statement-breakpoint
ALTER TABLE `invoices` ADD `currency` text DEFAULT 'ZAR' NOT NULL;