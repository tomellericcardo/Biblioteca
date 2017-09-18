# -*- coding: utf-8 -*-

from manager import Manager


class Biblioteca:
    
    def __init__(self, g, database_filename):
        self.manager = Manager(g, database_filename)
        self.alfabeto = 'abcdefghijklmnopqrstuvwxyz'
    
    def leggi_galleria(self):
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, copertina
            FROM libro
            ORDER BY data_ora DESC
            LIMIT 6
        ''')
    
    def leggi_classifica(self):
        classifica = self.manager.leggi_righe('''
            SELECT l.codice, l.titolo, l.autore, l.copertina, AVG(r.valore) AS voto
            FROM libro l
            INNER JOIN recensione r
            ON l.codice = r.libro
            GROUP BY l.codice
            ORDER BY voto DESC
            LIMIT 6
        ''')
        if classifica == [(None, None, None, None, None)]:
            return []
        return classifica
    
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
        self.manager.scrivi('''
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
        lista_nomi = autore.split(' ')
        if (len(lista_nomi) > 1):
            autore = lista_nomi[len(lista_nomi) - 1]
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
    
    def modifica_copertina(self, codice, copertina):
        self.manager.scrivi('''
            UPDATE libro
            SET copertina = ?
            WHERE codice = ?
        ''', (copertina, codice))
    
    def esegui_ricerca(self, filtro, richiesta):
        richiesta = richiesta.lower()
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, copertina
            FROM libro
            WHERE LOWER(''' + filtro + ''')
            REGEXP ?
        ''', (richiesta,))
    
    def leggi_lista_titolo(self):
        dizionario = {}
        for lettera in self.alfabeto:
            espressione = '^' + lettera
            lista = self.manager.leggi_righe('''
                SELECT codice, titolo, autore
                FROM libro
                WHERE LOWER(titolo)
                REGEXP ?
            ''', (espressione,))
            if len(lista) > 0:
                dizionario[lettera] = lista
        return dizionario
    
    def leggi_lista_autore(self):
        dizionario = {}
        lista_autori = self.manager.leggi_righe('''
            SELECT DISTINCT(autore)
            FROM libro
        ''')
        for autore in lista_autori:
            autore = autore[0]
            lista = self.manager.leggi_righe('''
                SELECT codice, titolo
                FROM libro
                WHERE autore = ?
            ''', (autore,))
            if len(lista) > 0:
                dizionario[autore] = lista
        return dizionario
    
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
    
    def elimina_recensioni(self, libro):
        self.manager.scrivi('''
            DELETE
            FROM recensione
            WHERE libro = ?
        ''', (libro,))
    
    def aggiorna_recensioni(self, libro, nuovo_libro):
        self.manager.scrivi('''
            UPDATE recensione
            SET libro = ?
            WHERE libro = ?
        ''', (nuovo_libro, libro))
    
    def nuova_posizione(self, codice):
        self.manager.scrivi('''
            INSERT INTO posizione (libro, stato, testo)
            VALUES (?, '', '')
        ''', (codice,))
    
    def leggi_posizione(self, libro):
        return self.manager.leggi_riga('''
            SELECT l.codice, l.titolo, l.autore, l.copertina, p.stato, p.testo
            FROM libro l
            INNER JOIN posizione p
            ON l.codice = p.libro
            WHERE l.codice = ?
        ''', (libro,))
    
    def modifica_posizione(self, libro, stato, testo):
        self.manager.scrivi('''
            UPDATE posizione
            SET stato = ?, testo = ?
            WHERE libro = ?
        ''', (stato, testo, libro))
    
    def elimina_posizione(self, libro):
        self.manager.scrivi('''
            DELETE
            FROM posizione
            WHERE libro = ?
        ''', (libro,))
    
    def aggiorna_posizione(self, libro, nuovo_libro):
        self.manager.scrivi('''
            UPDATE posizione
            SET libro = ?
            WHERE libro = ?
        ''', (nuovo_libro, libro))
