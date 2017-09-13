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
            $('#attesa').css('display', 'inline');
            var url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn;
            $.ajax({
                url: url,
                method: 'GET',
                success: function(risposta) {
                    if (risposta.totalItems == 0) {
                        $('#isbn').css('display', 'none');
                        errore.messaggio('Errore durante il caricamento delle informazioni!');
                    } else {
                        var libro = risposta.items[0].volumeInfo;
                        var titolo = libro.title;
                        var autore = aggiungi.formatta_autore(libro.authors[0]);
                        var genere = libro.categories[0];
                        var descrizione = libro.description;
                        var editore = libro.publisher;
                        var anno = libro.publishedDate;
                        var copertina = libro.imageLinks.thumbnail;
                        $('#titolo').val(titolo);
                        $('#autore').val(autore);
                        $('#genere').val(genere);
                        $('#descrizione').val(descrizione);
                        $('#editore').val(editore);
                        $('#anno').val(anno);
                        $('#copertina').html('<img src="' + copertina + '" id="immagine_copertina">');
                        aggiungi.sorgente_copertina = copertina;
                        $('#isbn').css('display', 'none');
                    }
                    $('#codice_isbn').val('');
                },
                error: function() {
                    $('#isbn').css('display', 'none');
                    errore.messaggio('Errore durante il caricamento delle informazioni!');
                }
            }).then(function() {
                $('#attesa').css('display', 'none');
            });
        }
    },
    
    formatta_autore: function(autore) {
        var lista = autore.split(' ');
        var nuovo_autore = lista[lista.length - 1];
        for (var i = 0; i < lista.length - 1; i++) {
            nuovo_autore += ' ' + lista[i];
        }
        return nuovo_autore;
    },
    
    init_seleziona_copertina: function() {
        $('#copertina').on('click', function() {
            $('#seleziona').click();
        });
    },
    
    init_leggi_copertina: function() {
        $('#seleziona').change(function(evento) {
            $('#caricamento').css('display', 'block');
            $('#conferma').css('bottom', '65px');
            var lettore = new FileReader();
            lettore.onload = function(e) {
                aggiungi.ridimensiona_mostra(e.target.result, 200, 350);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    ridimensiona_mostra: function(sorgente, larghezza_massima, altezza_massima) {
        var immagine = document.createElement('img');
        var canvas = document.createElement('canvas');
        immagine.onload = function() {
            var larghezza = immagine.width;
            var altezza = immagine.height;
            if (larghezza > altezza) {
                if (larghezza > larghezza_massima) {
                    altezza *= larghezza_massima / larghezza;
                    larghezza = larghezza_massima;
                }
            } else {
                if (altezza > altezza_massima) {
                    larghezza *= altezza_massima / altezza;
                    altezza = altezza_massima;
                }
            }
            canvas.width = larghezza;
            canvas.height = altezza;
            var contesto = canvas.getContext('2d');
            contesto.drawImage(immagine, 0, 0, larghezza, altezza);
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
        $('#titolo, #autore, #genere, #editore, #anno').on('keyup', function(e) {
            if (e.keyCode == 13) {
                aggiungi.conferma();
            }
        });
    },
    
    conferma: function() {
        $('#titolo, #autore').css('border-color', '#757575');
        var titolo = $('#titolo').val();
        var autore = $('#autore').val();
        var genere = $('#genere').val();
        var descrizione = $('#descrizione').val();
        var editore = $('#editore').val();
        var anno = $('#anno').val();
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
                    genere: genere,
                    descrizione: descrizione,
                    editore: editore,
                    anno: anno,
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
