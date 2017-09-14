# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from biblioteca import Biblioteca
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
biblioteca = Biblioteca(g, 'database.db')


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


# CONTESTI

@app.route('/leggi_galleria', methods = ['POST'])
def leggi_galleria():
    return dumps({'lista_libri': biblioteca.leggi_galleria()})

@app.route('/leggi_scheda', methods = ['POST'])
def leggi_scheda():
    richiesta = request.get_json(force = True)
    codice = richiesta['codice']
    return dumps({'scheda': biblioteca.leggi_scheda(codice)})

@app.route('/elimina_scheda', methods = ['POST'])
def elimina_scheda():
    richiesta = request.get_json(force = True)
    codice = richiesta['codice']
    if biblioteca.codice_presente(codice):
        biblioteca.elimina_scheda(codice)
        return dumps({'successo': True})
    return dumps({'errore': True})

@app.route('/modifica_scheda', methods = ['POST'])
def modifica_scheda():
    richiesta = request.get_json(force = True)
    codice = richiesta['codice']
    titolo = richiesta['titolo']
    autore = richiesta['autore']
    genere = richiesta['genere']
    descrizione = richiesta['descrizione']
    editore = richiesta['editore']
    anno = richiesta['anno']
    if biblioteca.codice_presente(codice):
        copertina = biblioteca.leggi_copertina(codice)
        biblioteca.elimina_scheda(codice)
        return dumps({'codice': biblioteca.nuovo_libro(titolo, autore, genere, descrizione, editore, anno, copertina)})
    return dumps({'errore': True})

@app.route('/nuovo_libro', methods = ['POST'])
def nuovo_libro():
    richiesta = request.get_json(force = True)
    titolo = richiesta['titolo']
    autore = richiesta['autore']
    genere = richiesta['genere']
    descrizione = richiesta['descrizione']
    editore = richiesta['editore']
    anno = richiesta['anno']
    copertina = richiesta['copertina']
    return dumps({'codice': biblioteca.nuovo_libro(titolo, autore, genere, descrizione, editore, anno, copertina)})

@app.route('/esegui_ricerca', methods = ['POST'])
def esegui_ricerca():
    richiesta = request.get_json(force = True)
    filtro = richiesta['filtro']
    richiesta = richiesta['richiesta']
    return dumps({'lista_libri': biblioteca.esegui_ricerca(filtro, richiesta)})

@app.route('/invia_recensione', methods = ['POST'])
def invia_recensione():
    richiesta = request.get_json(force = True)
    libro = richiesta['libro']
    valore = richiesta['valore']
    autore = richiesta['autore']
    testo = richiesta['testo']
    biblioteca.invia_recensione(libro, valore, autore, testo)
    return dumps({'successo': True})

@app.route('/leggi_recensioni', methods = ['POST'])
def leggi_recensioni():
    richiesta = request.get_json(force = True)
    libro = richiesta['libro']
    return dumps({'sommario': biblioteca.leggi_sommario(libro), 'recensioni': biblioteca.leggi_recensioni(libro)})

@app.route('/elimina_recensione', methods = ['POST'])
def elimina_recensione():
    richiesta = request.get_json(force = True)
    id_recensione = richiesta['id']
    biblioteca.elimina_recensione(id_recensione)
    return dumps({'successo': True})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(host = '192.168.1.67', port = 80, threaded = True, debug = True)
