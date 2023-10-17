CREATE TABLE IF NOT EXISTS tuser (
    id        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email     VARCHAR(255) NOT NULL,
    password  VARCHAR(255) NOT NULL,
    username  VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tsession (
    session   CHAR(64) PRIMARY KEY,
    user_id   INT UNSIGNED,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES tuser(id)
);

CREATE TABLE IF NOT EXISTS tproject (
    id   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tprojectuser (
    id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id    INT UNSIGNED,
    project_id INT UNSIGNED,

    FOREIGN KEY (user_id)    REFERENCES tuser(id),
    FOREIGN KEY (project_id) REFERENCES tproject(id)
);

CREATE TABLE IF NOT EXISTS tprojectversion (
    id            INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id    INT UNSIGNED,
    versionNumber INT UNSIGNED NOT NULL,
    timestamp     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    songBPM       SMALLINT UNSIGNED,
    songKey       VARCHAR(10),

    FOREIGN KEY (project_id) REFERENCES tproject(id),
    UNIQUE (project_id, versionNumber)
);

CREATE TABLE IF NOT EXISTS tprojectversionfile (
    id                CHAR(128),
    projectversion_id INT UNSIGNED,
    type              CHAR(3),

    PRIMARY KEY (projectversion_id, id, type),
    FOREIGN KEY (projectversion_id) REFERENCES tprojectversion(id)
);

ALTER TABLE tprojectuser ADD role CHAR(1) NOT NULL;

CREATE TABLE IF NOT EXISTS tprojectchecklist (
    id                       INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    project_id               INT UNSIGNED,
    user_id                  INT UNSIGNED,
    timestamp                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    text                     VARCHAR(255) NOT NULL,
    checkedProjectversion_id INT UNSIGNED DEFAULT NULL,

    FOREIGN KEY (project_id)               REFERENCES tproject(id),
    FOREIGN KEY (user_id)                  REFERENCES tuser(id),
    FOREIGN KEY (checkedProjectversion_id) REFERENCES tprojectversion(id)
);

ALTER TABLE tprojectversionfile ADD duration INT UNSIGNED NOT NULL DEFAULT 0;

ALTER TABLE tuser ADD blocked BOOLEAN DEFAULT TRUE;
UPDATE tuser SET blocked=0 WHERE blocked IS NULL;
ALTER TABLE tuser MODIFY blocked BOOLEAN NOT NULL;

CREATE TABLE IF NOT EXISTS tusernotification (
    id                     INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id                INT UNSIGNED,
    notificationTemplateId SMALLINT UNSIGNED,
    timestamp              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRead                 BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tusernotificationparam (
    id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    notification_id INT UNSIGNED,
    paramKey        VARCHAR(100),
    paramValue      VARCHAR(255),

    FOREIGN KEY (notification_id) REFERENCES tusernotification(id)
);

CREATE TABLE IF NOT EXISTS tuserresetpassword (
    resetKey  CHAR(32) PRIMARY KEY,
    user_id   INT UNSIGNED,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES tuser(id)
);