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
    (1, 'U potoka', '', '641 00', 'Brno'),
    (1, 'U rybníka', '', '641 00', 'Brno');