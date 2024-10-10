CREATE TABLE `model_swipes`
(
    `model_id`   INT                                    NOT NULL,
    `like`       BOOLEAN                                NOT NULL,
    `ip`         VARCHAR(15) COLLATE utf8mb4_unicode_ci NOT NULL,
    `session_id` varchar(255)                           NOT NULL,
    `date`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP    NOT NULL,
    UNIQUE KEY `ip` (`ip`, `model_id`, `date`),
    KEY `model_id` (`model_id`, `like`),
    FOREIGN KEY (`model_id`) REFERENCES `of_users` (`id`)
)
