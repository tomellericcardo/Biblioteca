var aggiungi = {
    
    init: function() {
        aggiungi.sorgente_copertina = '';
        aggiungi.init_home();
        aggiungi.init_mostra_carica();
        aggiungi.init_chiudi_carica();
        aggiungi.init_carica_foto();
        aggiungi.init_carica_informazioni();
        aggiungi.init_seleziona_copertina();
        aggiungi.init_leggi_copertina();
        aggiungi.init_conferma();
    },
    
    
    // Bottone home
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
    },
    
    
    // Bottone mostra caricamento informazioni
    
    init_mostra_carica: function() {
        $('#mostra_carica').on('click', function() {
            $('#carica').css('display', 'block');
        });
    },
    
    
    // Bottone chiudi caricamento informazioni
    
    init_chiudi_carica: function() {
        $('#chiudi_carica, #sfondo_carica').on('click', function() {
            $('#carica').css('display', 'none');
        });
    },
    
    
    // Bottone caricamento codice
    
    init_carica_foto: function() {
        $('#carica_foto').on('click', function() {
            $('#file_input').click();
        });
    },
    
    
    // Bottone caricamento informazioni
    
    init_carica_informazioni: function() {
        $('#carica_informazioni').on('click', function() {
            aggiungi.carica_informazioni();
        });
        $('#titolo_carica, #autore_carica, #codice_isbn').on('keyup', function(e) {
            if (e.keyCode == 13) {
                aggiungi.carica_informazioni();
            }
        });
    },
    
    
    // Settore seleziona informazioni
    
    init_seleziona_copertina: function() {
        $('#copertina').on('click', function() {
            $('#seleziona').click();
        });
    },
    
    
    // Input leggi copertina
    
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
    
    
    // Bottone conferma aggiunta
    
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
    
    
    // Carica informazioni
    
    carica_informazioni: function() {
        var titolo = $('#titolo_carica').val();
        var autore = $('#autore_carica').val();
        if ((titolo.length == 0) || (autore.length == 0)) {
            var isbn = $('#codice_isbn').val();
            if (isbn.length == 0) {
                $('#isbn').css('display', 'none');
                var messaggio = 'Devi inserire il titolo e l\'autore oppure il codice ISBN del libro!';
                errore.messaggio(messaggio);
            } else {
                var url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn;
                aggiungi.ottieni_informazioni(url);
            }
        } else {
            var url = 'https://www.googleapis.com/books/v1/volumes?q=intitle:' + titolo + '+inauthor:' + autore;
            aggiungi.ottieni_informazioni(url);
        }
    },
    
    
    // Ottieni informazioni
    
    ottieni_informazioni: function(url) {
        $('#attesa').css('display', 'inline');
        $.ajax({
            url: url,
            method: 'GET',
            success: function(risposta) {
                if (risposta.totalItems == 0) {
                    $('#carica').css('display', 'none');
                    errore.messaggio('Libro non trovato nel registro!');
                } else {
                    var libro = risposta.items[0].volumeInfo;
                    var titolo = libro.title;
                    var autore = libro.authors[0];
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
                    $('#carica').css('display', 'none');
                }
                $('#titolo_carica').val('');
                $('#autore_carica').val('');
                $('#codice_isbn').val('');
            },
            error: function() {
                $('#isbn').css('display', 'none');
                errore.messaggio('Errore durante il caricamento delle informazioni!');
            }
        }).then(function() {
            $('#attesa').css('display', 'none');
        });
    },
    
    
    // Ridimensionamento copertina
    
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
    
    
    // Visualizzazione immagine
    
    mostra_immagine: function(sorgente) {
        $('#caricamento').css('display', 'none');
        $('#conferma').css('bottom', '20px');
        $('#copertina').html('<img src="' + sorgente + '" id="immagine_copertina">');
        aggiungi.sorgente_copertina = sorgente;
    },
    
    
    // Aggiunta libro
    
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
            errore.messaggio('Devi inserire il titolo del libro per poterlo catalogare!');
        } else if (autore.length == 0) {
            $('#autore').css('border-color', 'red');
            errore.messaggio('Devi inserire l\'autore del libro per poterlo catalogare!');
        } else {
            $('#conferma').html('<i class="material-icons w3-spin">refresh</i>');
            $.ajax({
                url: 'nuovo_libro',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    chiave: chiave.chiave,
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
                    $('#conferma').html('<i class="material-icons">done</i>');
                }
            });
        }
    }
    
};


$(document).ready(aggiungi.init());
