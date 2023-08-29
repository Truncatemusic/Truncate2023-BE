CREATE TABLE IF NOT EXISTS tuser (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    email     VARCHAR(255) NOT NULL,
    password  VARCHAR(255) NOT NULL,
    username  VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tsession (
    session   CHAR(64) PRIMARY KEY,
    user_id   INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES tuser(id)
);

CREATE TABLE IF NOT EXISTS tproject (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tprojectuser (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT,
    project_id INT,

    FOREIGN KEY (user_id)    REFERENCES tuser(id),
    FOREIGN KEY (project_id) REFERENCES tproject(id)
);