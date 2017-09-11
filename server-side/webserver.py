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
    biblioteca.apri_connessione()

@app.teardown_request
def chiudi_connessione(exception):
    biblioteca.chiudi_connessione()


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

@app.route('/nuovo_libro', methods = ['POST'])
def nuovo_libro():
    richiesta = request.get_json(force = True)
    titolo = richiesta['titolo']
    autore = richiesta['autore']
    descrizione = richiesta['descrizione']
    copertina = richiesta['copertina']
    return dumps({'codice': biblioteca.nuovo_libro(titolo, autore, descrizione, copertina)})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(host = '192.168.1.24', port = 80)
