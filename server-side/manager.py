# -*- coding: utf-8 -*-

from os.path import realpath, dirname, join
from sqlite3 import connect
from re import compile


class Manager:
    
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
            CREATE TABLE IF NOT EXISTS posizione (
                libro TEXT PRIMARY KEY,
                stato TEXT NOT NULL,
                testo TEXT NOT NULL
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS recensione (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                libro TEXT NOT NULL,
                valore INT NOT NULL,
                autore TEXT NOT NULL,
                testo TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE VIEW IF NOT EXISTS galleria AS
            SELECT codice, titolo, autore, copertina
            FROM libro
            ORDER BY data_ora DESC
            LIMIT 20
        ''')
        database.commit()
        cursore.close()
        database.close()
    
    def apri_connessione(self):
        self.g.db = connect(self.percorso)
        self.g.db.text_factory = str
        self.g.db.create_function('REGEXP', 2, self.regexp)
    
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    def regexp(self, espressione, oggetto):
        reg = compile(espressione)
        return reg.search(oggetto) is not None
    
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
