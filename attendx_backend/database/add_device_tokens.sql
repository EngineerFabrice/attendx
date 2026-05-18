-- Migration: add device_tokens table for FCM push notification tokens
CREATE TABLE IF NOT EXISTS device_tokens (
  id          VARCHAR(36)                       NOT NULL,
  user_id     VARCHAR(36)                       NOT NULL,
  token       TEXT                              NOT NULL,
  platform    ENUM('android', 'ios', 'web')     NOT NULL DEFAULT 'android',
  created_at  TIMESTAMP                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP                         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_dt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_platform (user_id, platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
