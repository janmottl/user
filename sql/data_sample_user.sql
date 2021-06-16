DELETE FROM user;

INSERT INTO user (name, surname, email, phone, mobile, password)
VALUES
       ('Alfons', 'Mucha', 'alfons.mucha@seznam.cz', '', '666 666 666', '741238'),
       ('Jan', 'Zrzavý', 'jan.zrzavy@seznam.cz', '', '666 666 666', '741238'),
       ('Josef', 'Čapek', 'josef.capek@seznam.cz', '', '666 666 666', '741238'),
       ('Josef', 'Lada', 'josef.lada@seznam.cz', '', '666 666 666', '741238'),
       ('Max', 'Śvabinský', 'max.svabinsky@seznam.cz', '', '666 666 666', '741238'),
       ('Zdeněk', 'Burian', 'zdenek.burian@seznam.cz', '', '666 666 666', '741238'),
       ('Mikoláš', 'Aleš', 'mikolas.ales@seznam.cz', '', '666 666 666', '741238'),
       ('Adolf', 'Born', 'adolf.born@seznam.cz', '', '666 666 666', '741238'),
       ('Emil', 'Filla', 'emil.filla@seznam.cz', '', '666 666 666', '741238'),
       ('Luděk', 'Marold', 'ludek.marold@seznam.cz', '', '666 666 666', '741238');

INSERT INTO user_address (user_id, user_adresa, user_stat, user_obec_psc, user_obec_nazev)
VALUES
    (1, 'Zámecká 12', '', '664 61', 'Rebešovice'),
    (1, 'Hrázní 333/2D,', 'CZ', '635 00', 'Brno-Kníničky'),
    (1, 'Bezručova 2297/2', '', '678 01', 'Blansko'),
    (1, 'Via Aurelia 111', 'IT', '570 16', 'Castiglioncello'),
    (1, 'Museumsinsel', 'DE', '	10961', 'Berlin');

INSERT INTO user_address (user_id, user_adresa, user_stat, user_obec_psc, user_obec_nazev)
SELECT user.user_id, ua.user_adresa, ua.user_stat, ua.user_obec_psc, ua.user_obec_nazev
FROM user,
     (SELECT ua.user_adresa, ua.user_stat, ua.user_obec_psc, ua.user_obec_nazev
      FROM user
               LEFT JOIN user_address ua on user.user_id = ua.user_id
      WHERE user.user_id = 1) ua
WHERE user.user_id > 1
ORDER BY user.user_id;
