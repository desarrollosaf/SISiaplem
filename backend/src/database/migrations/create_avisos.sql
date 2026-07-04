CREATE TABLE IF NOT EXISTS `avisos` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `titulo`      VARCHAR(255)  NOT NULL,
  `descripcion` TEXT          NOT NULL,
  `tipo`        ENUM('info','curso','evento','urgente') NOT NULL DEFAULT 'info',
  `pdf_path`    VARCHAR(500)  NULL,
  `activo`      TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
