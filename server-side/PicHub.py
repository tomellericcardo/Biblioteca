# -*- coding: utf-8 -*-

from os.path import realpath, dirname, join
from sqlite3 import connect


class PicHub:
    
    def __init__(self, g, database_filename):
        self.g = g
        posizione = dirname(realpath(__file__))
        self.percorso = join(posizione, database_filename)
        self.init_db()
    
    def init_db(self):
        database = connect(self.percorso)
        cursore = database.cursor()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS album (
                nome TEXT PRIMARY KEY,
                descrizione TEXT NOT NULL,
                copertina TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        database.commit()
        cursore.execute('''
            CREATE TABLE IF NOT EXISTS foto (
                id TEXT PRIMARY KEY,
                sorgente TEXT NOT NULL,
                copertina TEXT NOT NULL,
                album TEXT NOT NULL,
                data_ora DATETIME DEFAULT CURRENT_TIMESTAMP
            )
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
    
    def scrivi(self, query, parametri = ()):
        cursore = self.g.db.cursor()
        cursore.execute(query, parametri)
        self.g.db.commit()
        cursore.close()
    
    def leggi_album(self):
        return self.leggi_righe('''
            SELECT nome, copertina
            FROM album
        ''')
    
    def nome_presente(self, nome):
        presente = self.leggi_dato('''
            SELECT COUNT(*)
            FROM album
            WHERE nome = ?
        ''', (nome,))
        return presente == 1
    
    def nuovo_album(self, nome, descrizione, copertina):
        self.scrivi('''
            INSERT INTO album (nome, descrizione, copertina)
            VALUES (?, ?, ?)
        ''', (nome, descrizione, copertina))
    
    def leggi_foto(self, album):
        return self.leggi_righe('''
            SELECT id, copertina
            FROM foto
            WHERE album = ?
        ''', (album,))
    
    def carica_foto(self, sorgente, copertina, album):
        self.scrivi('''
            INSERT INTO foto (sorgente, copertina, album)
            VALUES (?, ?, ?)
        ''', (sorgente, copertina, album))
