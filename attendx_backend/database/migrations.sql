-- AttendX migrations — run after schema.sql
USE attendx;

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id        VARCHAR(36) NOT NULL,
  session_start  TINYINT(1)  NOT NULL DEFAULT 1,
  absence_alert  TINYINT(1)  NOT NULL DEFAULT 1,
  low_attendance TINYINT(1)  NOT NULL DEFAULT 1,
  weekly_report  TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id),
  FOREIGN KEY fk_np_user (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         VARCHAR(36) NOT NULL,
  user_id    VARCHAR(36) NOT NULL,
  token      VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP   NOT NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_prt_token (token),
  FOREIGN KEY fk_prt_user (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
