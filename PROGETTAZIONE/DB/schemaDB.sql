-- Admin: Elio Magliari
BEGIN TRANSACTION;

-- -----------------------------------------------------
-- Table `pagesdb`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `User`;

CREATE TABLE IF NOT EXISTS `User` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` VARCHAR(45) UNIQUE NOT NULL,
  `hash` VARCHAR(255) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `role` BOOLEAN NOT NULL,
  `salt` VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------
-- Table `pagesdb`.`Image`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Image`;

CREATE TABLE IF NOT EXISTS `Image` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `src` VARCHAR(45) NOT NULL,
  `alt` VARCHAR(45) NOT NULL,
  `title` VARCHAR(45) NOT NULL,
  `website_name` VARCHAR(45) UNIQUE NOT NULL
);

-- -----------------------------------------------------
-- Table `pagesdb`.`Page`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Page`;

CREATE TABLE IF NOT EXISTS `Page` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `release_date` DATE NULL,
  `creation_date` DATE NOT NULL,
  `deleted` BOOLEAN NOT NULL,
  `user_id` INTEGER NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- -----------------------------------------------------
-- Table `pagesdb`.`Content`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Content`;

CREATE TABLE IF NOT EXISTS `Content` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `header` VARCHAR(45) NOT NULL,
  `paragraph` VARCHAR(45) NULL,
  `sort_number` INTEGER UNSIGNED NOT NULL,
  `page_id` INTEGER NOT NULL,
  `image_id` INTEGER NULL,
  FOREIGN KEY (`page_id`) REFERENCES `Page` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  FOREIGN KEY (`image_id`) REFERENCES `Image` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);


COMMIT;
PRAGMA foreign_keys = ON;