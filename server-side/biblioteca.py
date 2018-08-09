# -*- coding: utf-8 -*-

from manager import Manager
from hashlib import sha256
from base64 import b64decode
from os import rename, remove
from os.path import realpath, dirname, join


class Biblioteca:
    
    # Inizializzazione
    def __init__(self, g, database_filename, sale):
        self.manager = Manager(g, database_filename)
        self.percorso = dirname(realpath(__file__))
        self.sale = sale
        self.alfabeto = u'0123456789abcdefghijklmnopqrstuvwxyz'
    
    # Genera hash
    def genera_hash(self, chiave):
        return sha256(chiave + self.sale).hexdigest()
    
    # Utente autorizzato
    def utente_autorizzato(self, chiave):
        return self.manager.leggi_presenza('''
            SELECT id
            FROM chiave
            WHERE valore = ?
        ''', (chiave,))
    
    
    ##### HOME #####
    
    # Leggi galleria
    def leggi_galleria(self):
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, copertina
            FROM libro
            ORDER BY data_ora DESC
            LIMIT 12
        ''')
    
    # Leggi classifica
    def leggi_classifica(self):
        classifica = self.manager.leggi_righe('''
            SELECT l.codice, l.titolo, l.autore, l.copertina, AVG(r.valore) AS voto
            FROM libro l
            INNER JOIN recensione r
            ON l.codice = r.libro
            GROUP BY l.codice
            ORDER BY voto DESC
            LIMIT 12
        ''')
        if classifica == [(None, None, None, None, None)]:
            return []
        return classifica
    
    
    ##### LISTE #####
    
    # Lista per titolo
    def leggi_lista_titolo(self):
        dizionario = {}
        for lettera in self.alfabeto:
            espressione = '^' + lettera
            lista = self.manager.leggi_righe('''
                SELECT codice, titolo, autore
                FROM libro
                WHERE LOWER(titolo)
                REGEXP ?
                ORDER BY titolo
            ''', (espressione,))
            if len(lista) > 0:
                dizionario[lettera] = lista
        return dizionario
    
    # Lista per autore
    def leggi_lista_autore(self):
        dizionario = {}
        lista_autori = self.manager.leggi_righe('''
            SELECT DISTINCT(autore)
            FROM libro
        ''')
        for autore in lista_autori:
            autore = autore[0]
            dizionario[autore] = self.manager.leggi_righe('''
                SELECT codice, titolo
                FROM libro
                WHERE autore = ?
                ORDER BY titolo
            ''', (autore,))
        return dizionario
    
    # Lista in altri ordini
    def leggi_lista(self, ordine):
        dizionario = {}
        lista_chiavi = self.manager.leggi_righe('''
            SELECT DISTINCT(''' + ordine + ''')
            FROM libro
        ''')
        for chiave in lista_chiavi:
            chiave = chiave[0]
            dizionario[chiave] = self.manager.leggi_righe('''
                SELECT codice, titolo, autore
                FROM libro
                WHERE ''' + ordine + ''' = ?
                ORDER BY titolo
            ''', (chiave,))
        return dizionario
    
    
    ##### RICERCA #####
    
    # Esegui ricerca
    def esegui_ricerca(self, filtro, richiesta):
        richiesta = richiesta.lower()
        return self.manager.leggi_righe('''
            SELECT codice, titolo, autore, copertina
            FROM libro
            WHERE LOWER(''' + filtro + ''')
            REGEXP ?
        ''', (richiesta,))
    
    
    ##### AGGIUNGI #####
    
    # Nuovo libro
    def nuovo_libro(self, titolo, autore, genere, descrizione, editore, anno, copertina):
        codice = self.genera_codice(autore, titolo)
        percorso = self.percorso_copertina(copertina)
        self.manager.scrivi('''
            INSERT INTO libro (codice, titolo, autore, genere, descrizione, editore, anno, copertina)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (codice, titolo, autore, genere, descrizione, editore, anno, percorso))
        return codice
    
    # Genera codice del libro
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
    
    # Formatta stringa
    def formatta_stringa(self, stringa):
        stringa = stringa.upper();
        for carattere in ' \'.,':
            stringa = stringa.replace(carattere, '')
        return ''.join(i for i in stringa if ord(i) < 128)
    
    # Percorso copertina
    def percorso_copertina(self, copertina):
        if copertina.split(':')[0] == 'data':
            return self.carica_copertina(copertina, codice)
        if len(copertina) > 0:
            return copertina
        return '/img/copertina.png'
    
    # Caricamento della copertina
    def carica_copertina(self, copertina, codice):
        nome_file = 'copertina_' + str(codice) + '.png'
        percorso = '/img/copertine/' + nome_file
        self.write_and_move(copertina, nome_file, percorso)
        self.manager.scrivi('''
            UPDATE libro
            SET copertina = ?
            WHERE codice = ?
        ''', (percorso, codice))
        return percorso
    
    # Salva l'immagine e la sposta
    def write_and_move(self, image, image_name, image_location):
        image_data = b64decode(image.split(',')[1])
        image_path = join(self.percorso, image_name)
        f = open(image_path, 'wb')
        f.write(image_data)
        f.close()
        upload_path = join(self.percorso, '../client-side' + image_location)
        rename(image_path, upload_path)
    
    
    ##### LIBRO #####    
    
    # Leggi scheda
    def leggi_scheda(self, codice):
        return self.manager.leggi_riga('''
            SELECT codice, titolo, autore, genere, descrizione, editore, anno, copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    # Elimina copertina
    def elimina_copertina(self, codice):
        percorso = self.manager.leggi_dato('''
            SELECT copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
        if percorso.split('/')[2] == 'copertine':
            remove(join(self.percorso, '../client-side' + percorso))
    
    # Elimina scheda
    def elimina_scheda(self, codice):
        self.manager.scrivi('''
            DELETE
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    # Elimina recensioni
    def elimina_recensioni(self, codice):
        self.manager.scrivi('''
            DELETE
            FROM recensione
            WHERE libro = ?
        ''', (codice,))
        
    # Elimina posizione
    def elimina_posizione(self, codice):
        self.manager.scrivi('''
            DELETE
            FROM posizione
            WHERE libro = ?
        ''', (codice,))
    
    # Modifica scheda
    def aggiorna_libro(self, titolo, autore, genere, descrizione, editore, anno, copertina):
        codice = self.genera_codice(autore, titolo)
        self.manager.scrivi('''
            INSERT INTO libro (codice, titolo, autore, genere, descrizione, editore, anno, copertina)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (codice, titolo, autore, genere, descrizione, editore, anno, copertina))
        return codice
    
    # Leggi copertina
    def leggi_copertina(self, codice):
        return self.manager.leggi_dato('''
            SELECT copertina
            FROM libro
            WHERE codice = ?
        ''', (codice,))
    
    # Aggiorna posizione copertina
    def aggiorna_copertina(self, codice, copertina):
        if copertina.split('/')[2] == 'copertine':
            nuovo_nome = 'copertina_' + str(codice) + '.png'
            percorso = join(self.percorso, '../client-side' + copertina)
            nuovo_percorso = join(self.percorso, '../client-side/img/copertine/' + nuovo_nome)
            rename(percorso, nuovo_percorso)
            self.manager.scrivi('''
                UPDATE libro
                SET copertina = ?
                WHERE codice = ?
            ''', ('/img/copertine/' + nuovo_nome, codice))
    
    # Aggiorna recensioni
    def aggiorna_recensioni(self, libro, nuovo_libro):
        self.manager.scrivi('''
            UPDATE recensione
            SET libro = ?
            WHERE libro = ?
        ''', (nuovo_libro, libro))
    
    # Aggiorna posizione
    def aggiorna_posizione(self, libro, nuovo_libro):
        self.manager.scrivi('''
            UPDATE posizione
            SET libro = ?
            WHERE libro = ?
        ''', (nuovo_libro, libro))
    
    # Modifica copertina
    def modifica_copertina(self, codice, copertina):
        self.elimina_copertina(codice)
        self.carica_copertina(copertina, codice)
    
    
    ##### RECENSIONI #####
    
    # Leggi sommario recensioni
    def leggi_sommario(self, libro):
        return self.manager.leggi_riga('''
            SELECT l.titolo, l.autore, l.copertina, AVG(r.valore)
            FROM libro l
            INNER JOIN recensione r
            ON l.codice = r.libro
            WHERE r.libro = ?
            GROUP BY r.libro
        ''', (libro,))
    
    # Leggi recensioni
    def leggi_recensioni(self, libro):
        return self.manager.leggi_righe('''
            SELECT id, valore, autore, testo
            FROM recensione
            WHERE libro = ?
            ORDER BY valore DESC
        ''', (libro,))
    
    # Invia recensione
    def invia_recensione(self, libro, valore, autore, testo):
        self.manager.scrivi('''
            INSERT INTO recensione (libro, valore, autore, testo)
            VALUES (?, ?, ?, ?)
        ''', (libro, valore, autore, testo))
    
    # Elimina recensione
    def elimina_recensione(self, id_recensione):
        self.manager.scrivi('''
            DELETE
            FROM recensione
            WHERE id = ?
        ''', (id_recensione,))
    
    
    ##### POSIZIONE #####
    
    # Inizializzazione posizione libro
    def nuova_posizione(self, codice):
        self.manager.scrivi('''
            INSERT INTO posizione (libro, stato, testo)
            VALUES (?, '', '')
        ''', (codice,))
    
    # Leggi posizione
    def leggi_posizione(self, libro):
        return self.manager.leggi_riga('''
            SELECT l.codice, l.titolo, l.autore, l.copertina, p.stato, p.testo
            FROM libro l
            INNER JOIN posizione p
            ON l.codice = p.libro
            WHERE l.codice = ?
        ''', (libro,))
    
    # Modifica posizione
    def modifica_posizione(self, libro, stato, testo):
        self.manager.scrivi('''
            UPDATE posizione
            SET stato = ?, testo = ?
            WHERE libro = ?
        ''', (stato, testo, libro))
