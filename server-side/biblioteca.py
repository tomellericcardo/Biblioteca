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
        return self.manager.leggi_riga('''
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
    
    def invia_recensione(self, libro, valore, autore, testo):
        self.manager.scrivi('''
            INSERT INTO recensione (libro, valore, autore, testo)
            VALUES (?, ?, ?, ?)
        ''', (libro, valore, autore, testo))
    
    def leggi_sommario(self, libro):
        return self.manager.leggi_riga('''
            SELECT l.titolo, l.autore, l.copertina, AVG(r.valore)
            FROM libro l
            INNER JOIN recensione r
            ON l.codice = r.libro
            WHERE r.libro = ?
            GROUP BY r.libro
        ''', (libro,))
    
    def leggi_recensioni(self, libro):
        return self.manager.leggi_righe('''
            SELECT id, valore, autore, testo
            FROM recensione
            WHERE libro = ?
            ORDER BY valore DESC
        ''', (libro,))
    
    def elimina_recensione(self, id_recensione):
        self.manager.scrivi('''
            DELETE
            FROM recensione
            WHERE id = ?
        ''', (id_recensione,))
