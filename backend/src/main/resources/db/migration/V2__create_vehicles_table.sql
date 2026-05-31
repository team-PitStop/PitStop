CREATE TABLE vehicles (
                          id            BIGSERIAL PRIMARY KEY,
                          make          VARCHAR(255) NOT NULL,
                          model         VARCHAR(255) NOT NULL,
                          year          INT NOT NULL,
                          mileage       INT NOT NULL,
                          nickname      VARCHAR(255),
                          license_plate VARCHAR(255)
);