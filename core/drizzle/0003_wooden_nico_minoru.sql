PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bank_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`currency` text DEFAULT 'ZAR' NOT NULL,
	`account_holder_name` text NOT NULL,
	`bank_name` text NOT NULL,
	`account_number` text,
	`branch_code` text,
	`iban` text,
	`swift_bic` text,
	`bank_address` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_bank_accounts`("id", "label", "currency", "account_holder_name", "bank_name", "account_number", "branch_code", "iban", "swift_bic", "bank_address", "is_default", "created_at") SELECT "id", "label", "currency", "account_holder_name", "bank_name", "account_number", "branch_code", "iban", "swift_bic", "bank_address", "is_default", "created_at" FROM `bank_accounts`;--> statement-breakpoint
DROP TABLE `bank_accounts`;--> statement-breakpoint
ALTER TABLE `__new_bank_accounts` RENAME TO `bank_accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;