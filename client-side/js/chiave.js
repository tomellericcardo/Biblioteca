var chiave = {
    
    init: function() {
        chiave.leggi_chiave();
        chiave.accesso_eseguito();
    },
    
    
    // Lettura chiave
    
    leggi_chiave: function() {
        chiave.chiave = localStorage.getItem('chiave');
    },
    
    
    // Controllo accesso
    
    accesso_eseguito: function() {
        if (chiave.chiave) {
            $.ajax({
                url: 'utente_autorizzato',
                method: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({chiave: chiave.chiave}),
                success: function(risposta) {
                    if (!risposta.utente_valido) {
                        localStorage.clear();
                        window.location.href = '/accedi';
                    }
                }
            });
        } else {
            window.location.href = '/accedi';
        }
    },
    
    
    // Disconnessione
    
    disconnetti : function() {
        localStorage.clear();
        window.location.href = '/accedi';
    }
    
};


$(document).ready(chiave.init());
