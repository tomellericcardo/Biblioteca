# -*- coding: utf-8 -*-

from os.path import realpath, dirname, join
from sqlite3 import connect
from re import compile


class Manager:
    
    # Inizializzazione
    def __init__(self, g, database_filename):
        self.g = g
        posizione = dirname(realpath(__file__))
        self.percorso = join(posizione, database_filename)
        self.init_db()
    
    # Inizializzazione database
    def init_db(self):
        database = connect(self.percorso)
        cursore = database.cursor()
        
        # Tabella chiave
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS chiave (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                valore TEXT NOT NULL
            )
        ''')
        
        # Tabella libro
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS libro (
                codice TEXT PRIMARY KEY,
                titolo TEXT NOT NULL,
                autore TEXT NOT NULL,
                genere TEXT NOT NULL,
                descrizione TEXT NOT NULL,
                editore TEXT NOT NULL,
                anno INT NOT NULL,
                copertina TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabella recensione
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
        
        # Tabella posizione
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS posizione (
                libro TEXT PRIMARY KEY,
                stato TEXT NOT NULL,
                testo TEXT NOT NULL
            )
        ''')
        
        database.commit()
        cursore.close()
        database.close()
    
    
    ##### CONNESSIONI #####
    
    # Apertura
    def apri_connessione(self):
        self.g.db = connect(self.percorso)
        self.g.db.text_factory = str
        self.g.db.create_function('REGEXP', 2, self.regexp)
    
    # Chiusura
    def chiudi_connessione(self):
        db = getattr(self.g, 'db', None)
        if db is not None:
            db.close()
    
    # Espressioni regolari
    def regexp(self, espressione, oggetto):
        reg = compile(espressione)
        return reg.search(oggetto) is not None
    
    
    ##### LETTURA #####
    
    # Lettura righe
    def leggi_righe(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchall()
        cursore.close()
        return risultato
    
    # Lettura riga
    def leggi_riga(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        risultato = cursore.fetchone()
        cursore.close()
        return risultato
    
    # Lettura campo
    def leggi_dato(self, query, parametri = ()):
        return self.leggi_riga(query, parametri)[0]
    
    # Controllo presenza
    def leggi_presenza(self, query, parametri = ()):
        return len(self.leggi_righe(query, parametri)) > 0
    
    
    ##### SCRITTURA #####
    
    def scrivi(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        self.g.db.commit()
        cursore.close()
