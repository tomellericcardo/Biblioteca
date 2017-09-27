var errore = {
    
    
    // Bottone chiudi errore
    
    init_chiudi_errore: function() {
        $('#chiudi_errore, #sfondo_errore').on('click', function() {
            $('#errore').css('display', 'none');
        });
    },
    
    
    // Messaggio errore
    
    messaggio: function(testo) {
        $('#messaggio').html(testo);
        $('#errore').css('display', 'block');
    }
    
};


$(document).ready(errore.init_chiudi_errore());
