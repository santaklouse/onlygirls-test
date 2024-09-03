CREATE TABLE IF NOT EXISTS model_swipes
(
    model_id int                       not null,
    `like`   boolean                   not null,
    ip       varchar(15)              not null,
    date     TIMESTAMP default CURRENT_TIMESTAMP not null,
    FOREIGN KEY (model_id) REFERENCES of_users(id)
);
