var chiave = {
    
    
    // Lettura chiave
    
    leggi_chiave: function() {
        chiave.chiave = localStorage.getItem('chiave');
        if (!chiave.chiave) {
            chiave.chiave = '';
        }
    },
    
    
    // Disconnessione
    
    disconnetti : function() {
        localStorage.clear();
        window.location.href = '/accedi';
    }
    
};


$(document).ready(chiave.leggi_chiave());
