album = {
    
    init: function() {
        album.init_album();
        album.init_home();
        album.leggi_foto();
        album.init_seleziona_immagini();
        album.init_leggi_immagini();
        album.init_chiudi_mostra();
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
    
    init_album: function() {
        album.n_foto = 0;
        album.i_foto = 0;
        album.nome_album = album.leggi_parametro('nome');
        var nome = album.nome_album;
        if (nome.length > 18) {
            nome = nome.substring(0, 16) + '...';
        }
        $('title').html(album.nome_album + ' - PicHub');
        $('header h1').html(nome);
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
            var n = lista_files.length;
            if (n > 10) {
                errore.messaggio('Puoi caricare al massimo 10 foto alla volta!');
            } else {
                $('#carica').off('click');
                $('#progress_bar').css('width', '0');
                $('#carica').css('bottom', '70px');
                $('#caricamento').css('display', 'block');
                var lista_lettori = [];
                album.n_foto = n;
                album.i_foto = 0;
                for (var i = 0; i < n; i++) {
                    lista_lettori[i] = new FileReader();
                    lista_lettori[i].onload = function(e) {
                        album.elabora_carica(e.target.result, 150);
                    };
                    lista_lettori[i].readAsDataURL(lista_files[i]);
                }
            }
        });
    },
    
    elabora_carica: function(sorgente, dimensione) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var larghezza_immagine = immagine.width;
            var altezza_immagine = immagine.height;
            var dimensione_canvas = dimensione;
            var dimensione_taglio, x, y;
            if (larghezza_immagine >= altezza_immagine) {
                if (altezza_immagine < dimensione) {
                    dimensione_canvas = altezza_immagine;
                }
                dimensione_taglio = altezza_immagine;
                x = (larghezza_immagine - dimensione_taglio) / 2;
                y = 0;
            } else {
                if (larghezza_immagine < dimensione) {
                    dimensione_canvas = larghezza_immagine;
                }
                dimensione_taglio = larghezza_immagine;
                x = 0;
                y = (altezza_immagine - dimensione_taglio) / 2;
            }
            canvas.width = dimensione_canvas;
            canvas.height = dimensione_canvas;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, x, y, dimensione_taglio, dimensione_taglio, 0, 0, dimensione_canvas, dimensione_canvas);
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
            success: function() {
                album.i_foto += 1;
                $('#progress_bar').css('width', ((100 / album.n_foto) * album.i_foto) + '%');
                if (album.n_foto == album.i_foto) {
                    $('#caricamento').css('display', 'none');
                    $('#carica').css('bottom', '20px');
                    album.leggi_foto();
                    album.init_seleziona_immagini();
                }
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    apri_foto: function(id) {
        $.ajax({
            url: 'leggi_sorgente',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                id: id
            }),
            success: function(risposta) {
                $('#sorgente_foto').html('<img src="' + risposta.sorgente + '" id="foto_aperta">');
                $('#mostra_foto').css('display', 'block');
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    init_chiudi_mostra: function() {
        $('#chiudi_mostra, #sfondo_mostra').on('click', function() {
            $('#mostra_foto').css('display', 'none');
        });
    }
    
};


$(document).ready(album.init());
