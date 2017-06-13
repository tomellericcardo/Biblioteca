nuovo = {
    
    init: function() {
        nuovo.init_home();
        nuovo.init_seleziona_copertina();
        nuovo.init_leggi_copertina();
        nuovo.init_conferma();
    },
    
    copertina_selezionata: false,
    sorgente_copertina: '',
    
    init_home: function() {
        $('#home').on('click', function() {
            window.location.href = '/home';
        });
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
                nuovo.ridimensiona_mostra(e.target.result, 200);
            };
            lettore.readAsDataURL(evento.target.files[0]);
        });
    },
    
    ridimensiona_mostra: function(sorgente, dimensione_massima) {
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
            nuovo.mostra_immagine(canvas.toDataURL('image/png'));
        };
        immagine.src = sorgente;
    },
    
    mostra_immagine: function(sorgente) {
        $('#caricamento').css('display', 'none');
        $('#conferma').css('bottom', '20px');
        $('#copertina').html('<img src="' + sorgente + '" id="immagine_copertina">');
        nuovo.copertina_selezionata = true;
        nuovo.sorgente_copertina = sorgente;
    },
    
    init_conferma: function() {
        $('#conferma').on('click', function() {
            nuovo.conferma();
        });
        $('#nome, #descrizione').on('keyup', function(e) {
            if (e.keyCode == 13) {
                nuovo.conferma();
            }
        });
    },
    
    conferma: function() {
        $('#nome').css('border-color', '#757575');
        var nome = $('#nome').val();
        var descrizione = $('#descrizione').val();
        if (!descrizione) {
            descrizione = '';
        }
        if (nome.length == 0) {
            $('#nome').css('border-color', 'red');
            errore.messaggio('Devi inserire il nome dell\'album!');
        } else if (!nuovo.copertina_selezionata) {
            errore.messaggio('Devi selezionare una copertina per l\'album!');
        } else {
            $.ajax({
                url: 'nuovo_album',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    nome: nome,
                    descrizione: descrizione,
                    copertina: nuovo.sorgente_copertina
                }),
                success: function(risposta) {
                    if (risposta.nome_presente) {
                        errore.messaggio('Nome album gi&agrave; presente!');
                    } else if (risposta.successo) {
                        window.location.href = '/album?nome=' + nome;
                    }
                },
                error: function() {
                    errore.messaggio('Errore del server!');
                }
            });
        }
    }
    
};


$(document).ready(nuovo.init());
