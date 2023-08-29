CREATE TABLE IF NOT EXISTS tuser (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    username  VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname  VARCHAR(255),
    birthdate DATE
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