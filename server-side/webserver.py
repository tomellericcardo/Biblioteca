# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from flask_sslify import SSLify
from biblioteca import Biblioteca
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
ssLify = SSLify(app)
biblioteca = Biblioteca(g, 'database.db', 'clorurodisodio')


# OPERAZIONI DI SESSIONE

@app.before_request
def apri_connessione():
    biblioteca.manager.apri_connessione()

@app.teardown_request
def chiudi_connessione(exception):
    biblioteca.manager.chiudi_connessione()


# INVIO FILES

@app.route('/')
@app.route('/home')
def home():
    return send_from_directory('../client-side/html/', 'home.html')

@app.route('/<nome_pagina>')
def invia_pagina(nome_pagina):
    return send_from_directory('../client-side/html/', nome_pagina + '.html')

@app.route('/<nome_cartella>/<nome_file>')
def invia_file(nome_cartella, nome_file):
    return send_from_directory('../client-side/' + nome_cartella + '/', nome_file)

@app.route('/img/copertine/<nome_file>')
def invia_copertina(nome_file):
    return send_from_directory('../client-side/img/copertine/', nome_file)


# CONTESTI

# Accedi

@app.route('/accedi', methods = ['POST'])
def accedi():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    hash_chiave = biblioteca.genera_hash(chiave)
    utente_valido = biblioteca.utente_autorizzato(hash_chiave)
    return dumps({'utente_valido': utente_valido, 'hash_chiave': hash_chiave})

# Utente autorizzato

@app.route('/utente_autorizzato', methods = ['POST'])
def utente_autorizzato():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    return dumps({'utente_valido': biblioteca.utente_autorizzato(chiave)})

# Leggi galleria

@app.route('/leggi_galleria', methods = ['POST'])
def leggi_galleria():
    lista_libri = biblioteca.leggi_galleria()
    classifica = biblioteca.leggi_classifica()
    return dumps({'lista_libri': lista_libri, 'classifica': classifica})

# Leggi lista

@app.route('/leggi_lista', methods = ['POST'])
def leggi_lista():
    richiesta = request.get_json(force = True)
    ordine = richiesta['ordine']
    if ordine == 'titolo':
        lista_libri = biblioteca.leggi_lista_titolo()
    elif ordine == 'autore':
        lista_libri = biblioteca.leggi_lista_autore()
    else:
        lista_libri = biblioteca.leggi_lista(ordine)
    return dumps({'lista_libri': lista_libri})

# Esegui ricerca

@app.route('/esegui_ricerca', methods = ['POST'])
def esegui_ricerca():
    richiesta = request.get_json(force = True)
    filtro = richiesta['filtro']
    richiesta = richiesta['richiesta']
    return dumps({'lista_libri': biblioteca.esegui_ricerca(filtro, richiesta)})

# Nuovo libro

@app.route('/nuovo_libro', methods = ['POST'])
def nuovo_libro():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    titolo = richiesta['titolo']
    autore = richiesta['autore']
    genere = richiesta['genere']
    descrizione = richiesta['descrizione']
    editore = richiesta['editore']
    anno = richiesta['anno']
    copertina = richiesta['copertina']
    codice = biblioteca.nuovo_libro(titolo, autore, genere, descrizione, editore, anno, copertina)
    biblioteca.nuova_posizione(codice)
    return dumps({'codice': codice})

# Leggi scheda

@app.route('/leggi_scheda', methods = ['POST'])
def leggi_scheda():
    richiesta = request.get_json(force = True)
    codice = richiesta['codice']
    return dumps({'scheda': biblioteca.leggi_scheda(codice)})

# Elimina scheda

@app.route('/elimina_scheda', methods = ['POST'])
def elimina_scheda():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    codice = richiesta['codice']
    biblioteca.elimina_copertina(codice)
    biblioteca.elimina_scheda(codice)
    biblioteca.elimina_recensioni(codice)
    biblioteca.elimina_posizione(codice)
    return dumps({'successo': True})

# Modifica scheda

@app.route('/modifica_scheda', methods = ['POST'])
def modifica_scheda():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    codice = richiesta['codice']
    titolo = richiesta['titolo']
    autore = richiesta['autore']
    genere = richiesta['genere']
    descrizione = richiesta['descrizione']
    editore = richiesta['editore']
    anno = richiesta['anno']
    copertina = biblioteca.leggi_copertina(codice)
    biblioteca.elimina_scheda(codice)
    nuovo_codice = biblioteca.aggiorna_libro(titolo, autore, genere, descrizione, editore, anno, copertina)
    if (codice != nuovo_codice):
        biblioteca.aggiorna_copertina(nuovo_codice, copertina)
        biblioteca.aggiorna_recensioni(codice, nuovo_codice)
        biblioteca.aggiorna_posizione(codice, nuovo_codice)
    return dumps({'codice': nuovo_codice})

# Modifica copertina

@app.route('/modifica_copertina', methods = ['POST'])
def modifica_copertina():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    codice = richiesta['codice']
    copertina = richiesta['copertina']
    biblioteca.modifica_copertina(codice, copertina)
    return dumps({'successo': True})

# Leggi recensioni

@app.route('/leggi_recensioni', methods = ['POST'])
def leggi_recensioni():
    richiesta = request.get_json(force = True)
    libro = richiesta['libro']
    sommario = biblioteca.leggi_sommario(libro)
    recensioni = biblioteca.leggi_recensioni(libro)
    return dumps({'sommario': sommario, 'recensioni': recensioni})

# Invia recensione

@app.route('/invia_recensione', methods = ['POST'])
def invia_recensione():
    richiesta = request.get_json(force = True)
    libro = richiesta['libro']
    valore = richiesta['valore']
    autore = richiesta['autore']
    testo = richiesta['testo']
    biblioteca.invia_recensione(libro, valore, autore, testo)
    return dumps({'successo': True})

# Elimina recensione

@app.route('/elimina_recensione', methods = ['POST'])
def elimina_recensione():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    id_recensione = richiesta['id']
    biblioteca.elimina_recensione(id_recensione)
    return dumps({'successo': True})

# Leggi posizione

@app.route('/leggi_posizione', methods = ['POST'])
def leggi_posizione():
    richiesta = request.get_json(force = True)
    libro = richiesta['libro']
    return dumps({'posizione': biblioteca.leggi_posizione(libro)})

# Modifica posizione

@app.route('/modifica_posizione', methods = ['POST'])
def modifica_posizione():
    richiesta = request.get_json(force = True)
    chiave = richiesta['chiave']
    if not biblioteca.utente_autorizzato(chiave):
        return dumps({'non_autorizzato': True})
    libro = richiesta['libro']
    stato = richiesta['stato']
    testo = richiesta['testo']
    biblioteca.modifica_posizione(libro, stato, testo)
    return dumps({'successo': True})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(threaded = True)
