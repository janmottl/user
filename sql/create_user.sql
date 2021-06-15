DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_address;

CREATE TABLE user (
    user_id     INT(11) NOT NULL AUTO_INCREMENT,
    email       VARCHAR(100) NOT NULL,
    password    VARCHAR(100),

    name        VARCHAR(30) NOT NULL,
    surname     VARCHAR(30) NOT NULL,
    phone       VARCHAR(20),
    mobile      VARCHAR(20),

    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),
    UNIQUE(email)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;


CREATE TABLE user_address (
    user_address_id INT(11) NOT NULL AUTO_INCREMENT,
    user_id         INT(11) NOT NULL,
    
    user_adresa           VARCHAR(100),
    user_stat             VARCHAR(5),
    user_obec_psc         VARCHAR(15),
    user_obec_nazev       VARCHAR(100),

    created_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_address_id),
    CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_czech_ci;
