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




# AVVIO DEL SERVER

if __name__ == '__main__':
    app.run(host = "localhost", port = 80, threaded = True, debug = True)
