# -*- coding: utf-8 -*-

from manager import Manager


class Biblioteca:
    
    def __init__(self, g, database_filename):
        self.manager = Manager(g, database_filename)
    
    def leggi_galleria(self):
        return self.manager.leggi_righe('''
            SELECT *
            FROM galleria
        ''')
    
    def leggi_scheda(self, codice):
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, genere, descrizione, editore, anno, copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    def codice_presente(self, codice):
        return self.manager.leggi_presenza('''
            SELECT codice
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    def leggi_copertina(self, codice):
        return self.manager.leggi_dato('''
            SELECT copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    def elimina_scheda(self, codice):
        return self.manager.scrivi('''
            DELETE
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    def nuovo_libro(self, titolo, autore, genere, descrizione, editore, anno, copertina):
        codice = self.genera_codice(autore, titolo)
        self.manager.scrivi('''
            INSERT INTO libro (codice, titolo, autore, genere, descrizione, editore, anno, copertina)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (codice, titolo, autore, genere, descrizione, editore, anno, copertina))
        return codice
    
    def genera_codice(self, autore, titolo):
        codice = ''
        autore = self.formatta_stringa(autore)
        titolo = self.formatta_stringa(titolo)
        if len(autore) > 5:
            codice += autore[:5]
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
            presente = self.manager.leggi_presenza('''
                SELECT codice
                FROM libro
                WHERE codice = ?
            ''', (codice + str(i),))
        return codice + str(i)
    
    def formatta_stringa(self, stringa):
        stringa = stringa.upper();
        for carattere in ' \'.,':
            stringa = stringa.replace(carattere, '')
        return stringa
    
    def esegui_ricerca(self, filtro, richiesta):
        richiesta = richiesta.lower()
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, copertina
            FROM libro
            WHERE LOWER(''' + filtro + ''')
            REGEXP ?
        ''', (richiesta,))
