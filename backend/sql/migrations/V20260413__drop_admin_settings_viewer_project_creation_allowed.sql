-- Purpose:
--   Remove deprecated admin setting column that is no longer used after role model simplification.
--
-- Target:
--   admin_settings.viewer_project_creation_allowed
--
-- Safety:
--   This script is idempotent. If the column does not exist, it performs a no-op.

SET @schema_name = DATABASE();

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @schema_name
      AND TABLE_NAME = 'admin_settings'
      AND COLUMN_NAME = 'viewer_project_creation_allowed'
);

SET @ddl = IF(
    @column_exists > 0,
    'ALTER TABLE admin_settings DROP COLUMN viewer_project_creation_allowed',
    'SELECT ''viewer_project_creation_allowed already removed'' AS migration_status'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
