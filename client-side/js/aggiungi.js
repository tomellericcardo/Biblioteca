aggiungi = {
    
    init: function() {
        aggiungi.sorgente_copertina = '';
        aggiungi.init_home();
        aggiungi.init_mostra_isbn();
        aggiungi.init_chiudi_isbn();
        aggiungi.init_carica_isbn();
        aggiungi.init_seleziona_copertina();
        aggiungi.init_leggi_copertina();
        aggiungi.init_conferma();
    },
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    init_mostra_isbn: function() {
        $('#mostra_isbn').on('click', function() {
            $('#isbn').css('display', 'block');
        });
    },
    
    init_chiudi_isbn: function() {
        $('#chiudi_isbn, #sfondo_isbn').on('click', function() {
            $('#isbn').css('display', 'none');
        });
    },
    
    init_carica_isbn: function() {
        $('#carica_isbn').on('click', function() {
            aggiungi.carica_isbn();
        });
        $('#codice_isbn').on('keyup', function(e) {
            if (e.keyCode == 13) {
                aggiungi.carica_isbn();
            }
        });
    },
    
    carica_isbn: function() {
        var isbn = $('#codice_isbn').val();
        if (isbn.length == 0) {
            $('#isbn').css('display', 'none');
            errore.messaggio('Devi inserire un codice ISBN!');
        } else {
            var url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn;
            $.ajax({
                url: url,
                method: 'GET',
                success: function(risposta) {
                    var libro = risposta.items[0].volumeInfo;
                    var titolo = libro.title;
                    var autore = libro.authors[0];
                    $('#titolo').val(titolo);
                    $('#autore').val(autore);
                    $('#isbn').css('display', 'none');
                },
                error: function() {
                    $('#isbn').css('display', 'none');
                    errore.messaggio('Errore durante il caricamento delle informazioni!');
                }
            });
        }
    },
    
    init_seleziona_copertina: function() {
        $('#copertina').on('click', function() {
            $('#seleziona').click();
        });
    },
    
    init_leggi_copertina: function() {
        $('#seleziona').change(function(evento) {
            var lettore = new FileReader();
            lettore.onload = function(e) {
                $('#caricamento').css('display', 'block');
                $('#conferma').css('bottom', '65px');
                aggiungi.ridimensiona_mostra(e.target.result, 200);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    ridimensiona_mostra: function(sorgente, dimensione) {
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
            aggiungi.mostra_immagine(canvas.toDataURL('image/png'));
        };
        immagine.src = sorgente;
    },
    
    mostra_immagine: function(sorgente) {
        $('#caricamento').css('display', 'none');
        $('#conferma').css('bottom', '20px');
        $('#copertina').html('<img src="' + sorgente + '" id="immagine_copertina">');
        aggiungi.sorgente_copertina = sorgente;
    },
    
    init_conferma: function() {
        $('#conferma').on('click', function() {
            aggiungi.conferma();
        });
        $('#titolo, #autore, #descrizione').on('keyup', function(e) {
            if (e.keyCode == 13) {
                aggiungi.conferma();
            }
        });
    },
    
    conferma: function() {
        $('#titolo, #autore').css('border-color', '#757575');
        var titolo = $('#titolo').val();
        var autore = $('#autore').val();
        var descrizione = $('#descrizione').val();
        var copertina = aggiungi.sorgente_copertina;
        if (titolo.length == 0) {
            $('#titolo').css('border-color', 'red');
            errore.messaggio('Devi inserire il titolo del libro!');
        } else if (autore.length == 0) {
            $('#autore').css('border-color', 'red');
            errore.messaggio('Devi inserire l\'autore del libro!');
        } else {
            $.ajax({
                url: 'nuovo_libro',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    titolo: titolo,
                    autore: autore,
                    descrizione: descrizione,
                    copertina: copertina
                }),
                success: function(risposta) {
                    if (risposta.codice) {
                        window.location.href = '/libro?codice=' + risposta.codice;
                    }
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        }
    }
    
};


$(document).ready(aggiungi.init());
