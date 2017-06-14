album = {
    
    init: function() {
        album.init_nome();
        album.init_home();
        album.leggi_foto();
        album.init_seleziona_immagini();
        album.init_leggi_immagini();
    },
    
    leggi_parametro: function(parametro) {
        var indirizzo_pagina = decodeURIComponent(window.location.search.substring(1));
        var variabili = indirizzo_pagina.split('&');
        var nome_parametro, i;
        for (i = 0; i < variabili.length; i++) {
            nome_parametro = variabili[i].split('=');
            if (nome_parametro[0] === parametro) {
                return nome_parametro[1] === undefined ? true : nome_parametro[1];
            }
        }
    },
    
    init_nome: function() {
        album.nome_album = album.leggi_parametro('nome');
        $('title').html(album.nome_album + ' - PicHub');
        $('header h1').html(album.nome_album);
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    leggi_foto: function() {
        $.ajax({
            url: 'leggi_foto',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                album: album.nome_album
            }),
            success: function(risposta) {
                risposta = album.formatta_foto(risposta);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#carica_foto').html();
                    $('#galleria').html(Mustache.render(template, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_foto: function(risposta) {
        var lista_foto = risposta.lista_foto;
        if (lista_foto) {
            var nuova_lista = [];
            var i, foto;
            for (i = 0; i < lista_foto.length; i++) {
                foto = lista_foto[i];
                nuova_lista[i] = {
                    id: foto[0],
                    copertina: foto[1]
                };
            }
            risposta.lista_foto = nuova_lista;
            risposta.spazio = true;
            return risposta;
        }
        return [];
    },
    
    init_seleziona_immagini: function() {
        $('#carica').on('click', function() {
            $('#seleziona').click();
        });
    },
    
    init_leggi_immagini: function() {
        $('#seleziona').change(function(evento) {
            var lista_files = evento.target.files;
            var lista_lettori = [];
            for (var i = 0; i < lista_files.length; i++) {
                lista_lettori[i] = new FileReader();
                lista_lettori[i].onload = function(e) {
                    album.elabora_carica(e.target.result, 150);
                };
                lista_lettori[i].readAsDataURL(lista_files[i]);
            }
        });
    },
    
    elabora_carica: function(sorgente, dimensione_massima) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var larghezza_immagine = immagine.width;
            var altezza_immagine = immagine.height;
            var dimensione_canvas = dimensione_massima;
            var dimensione_taglio = 0;
            if (larghezza_immagine >= altezza_immagine) {
                if (altezza_immagine < dimensione_massima) {
                    dimensione_canvas = altezza_immagine;
                }
                dimensione_taglio = altezza_immagine;
            } else if (altezza_immagine > larghezza_immagine) {
                if (larghezza_immagine < dimensione_massima) {
                    dimensione_canvas = larghezza_immagine;
                }
                dimensione_taglio = larghezza_immagine;
            }
            canvas.width = dimensione_canvas;
            canvas.height = dimensione_canvas;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0, dimensione_taglio, dimensione_taglio, 0, 0, dimensione_canvas, dimensione_canvas);
            var copertina = canvas.toDataURL('image/png');
            album.carica_foto(sorgente, copertina);
        };
        immagine.src = sorgente;
    },
    
    carica_foto: function(sorgente, copertina) {
        $.ajax({
            url: 'carica_foto',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                sorgente: sorgente,
                copertina: copertina,
                album: album.nome_album
            }),
            success: function(risposta) {
                if (risposta.successo) {
                    album.leggi_foto();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    }
    
};


$(document).ready(album.init());
