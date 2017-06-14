# -*- coding: utf-8 -*-

from flask import Flask, g, send_from_directory, request
from PicHub import PicHub
from json import dumps


# VARIABILI GLOBALI

app = Flask(__name__)
pichub = PicHub(g, 'database.db')


# OPERAZIONI DI SESSIONE

@app.before_request
def apri_connessione():
    pichub.apri_connessione()

@app.teardown_request
def chiudi_connessione(exception):
    pichub.chiudi_connessione()


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

@app.route('/leggi_album', methods = ['POST'])
def leggi_album():
    return dumps({'lista_album': pichub.leggi_album()})

@app.route('/nuovo_album', methods = ['POST'])
def nuovo_album():
    richiesta = request.get_json(force = True)
    nome = richiesta['nome']
    if (pichub.nome_presente(nome)):
        return dumps({'nome_presente': True})
    descrizione = richiesta['descrizione']
    copertina = richiesta['copertina']
    pichub.nuovo_album(nome, descrizione, copertina)
    return dumps({'successo': True})

@app.route('/leggi_foto', methods = ['POST'])
def leggi_foto():
    richiesta = request.get_json(force = True)
    album = richiesta['album']
    return dumps({'lista_foto': pichub.leggi_foto(album)})

@app.route('/carica_foto', methods = ['POST'])
def carica_foto():
    richiesta = request.get_json(force = True)
    sorgente = richiesta['sorgente']
    copertina = richiesta['copertina']
    album = richiesta['album']
    pichub.carica_foto(sorgente, copertina, album)
    return dumps({'successo': True})


# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(host = 'localhost', port = 80, threaded = True, debug = True)
