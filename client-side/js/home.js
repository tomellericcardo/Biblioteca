home = {
    
    init: function() {
        home.init_nuovo();
        home.carica_album();
    },
    
    init_nuovo: function() {
        $('#nuovo').on('click', function() {
            window.location.href = '/nuovo';
        });
    },
    
    carica_album: function() {
        $.ajax({
            url: 'carica_album',
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            success: function(risposta) {
                risposta.lista_album = home.formatta_album(risposta.lista_album);
                $.get('/html/templates.html', function(contenuto) {
                    var template = $(contenuto).filter('#carica_album').html();
                    $('#galleria').html(Mustache.render(template, risposta));
                });
            },
            error: function() {
                errore.messaggio('Errore del server!');
            }
        });
    },
    
    formatta_album: function(lista_album) {
        if (lista_album) {
            var nuova_lista = [];
            var i, album;
            for (i = 0; i < lista_album.length; i++) {
                album = lista_album[i];
                nuova_lista[i] = {
                    nome: album[0],
                    copertina: album[1]
                };
            }
            return nuova_lista;
        }
        return [];
    },
    
    apri_album: function(nome) {
        window.location.href = '/album?nome=' + nome;
    }
    
};


$(document).ready(home.init());
