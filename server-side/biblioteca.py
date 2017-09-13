# -*- coding: utf-8 -*-

from os.path import realpath, dirname, join
from sqlite3 import connect


class Biblioteca:
    
    def __init__(self, g, database_filename):
        self.g = g
        posizione = dirname(realpath(__file__))
        self.percorso = join(posizione, database_filename)
        self.init_db()
    
    def init_db(self):
        database = connect(self.percorso)
        cursore = database.cursor()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS libro (
                codice TEXT PRIMARY KEY,
                titolo TEXT NOT NULL,
                autore TEXT NOT NULL,
                genere TEXT NOT NULL,
                descrizione TEXT NOT NULL,
                editore TEXT NOT NULL,
                anno INT,
                copertina TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE VIEW IF NOT EXISTS galleria AS
            SELECT codice, titolo, autore, copertina
            FROM libro
            LIMIT 20
        ''')
        database.commit()
        cursore.close()
        database.close()
    
    def apri_connessione(self):
        self.g.db = connect(self.percorso)
        self.g.db.text_factory = str
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def leggi_righe(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchall()
        cursore.close()
        return risultato
    
    def leggi_riga(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchone()
        cursore.close()
        return risultato
    
    def leggi_dato(self, query, parametri = ()):
        return self.leggi_riga(query, parametri)[0]
    
    def leggi_presenza(self, query, parametri = ()):
        return len(self.leggi_righe(query, parametri)) > 0
    
    def scrivi(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        self.g.db.commit()
        cursore.close()
    
    def leggi_galleria(self):
        return self.leggi_righe('''
            SELECT *
            FROM galleria
        ''')
    
    def nuovo_libro(self, titolo, autore, genere, descrizione, editore, anno, copertina):
        codice = self.genera_codice(autore, titolo)
        self.scrivi('''
            INSERT INTO libro (codice, titolo, autore, genere, descrizione, editore, anno, copertina)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (codice, titolo, autore, genere, descrizione, editore, anno, copertina))
        return codice
    
    def genera_codice(self, autore, titolo):
        codice = ''
        autore = autore.replace(' ', '').upper()
        titolo = titolo.replace(' ', '').upper()
        if len(autore) > 3:
            codice += autore[:3]
        else:
            codice += autore
        if len(titolo) > 3:
            codice += titolo[:3]
        else:
            codice += titolo
        presente = True
        i = 0
        while presente:
            i += 1
            presente = self.leggi_presenza('''
                SELECT codice
                FROM libro
                WHERE codice = ?
            ''', (codice + str(i),))
        return codice + str(i)
    
    def leggi_scheda(self, codice):
        return self.leggi_righe('''
            SELECT codice, titolo, autore, genere, descrizione, editore, anno, copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
