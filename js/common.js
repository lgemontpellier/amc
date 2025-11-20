// === Détection PC/Mobile ===
function detectDeviceType(){
  // Détection basée sur plusieurs critères
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isSmallScreen = window.innerWidth <= 768;
  
  // Considérer comme mobile si : UA mobile OU (écran tactile ET petit écran)
  const isMobile = isMobileUA || (hasTouchScreen && isSmallScreen);
  
  return isMobile ? 'Mobile' : 'PC';
}

// --- Bouton "Contacter le technicien d'astreinte" (Lun–Sam, 8h–19h) ---
(function(){
  const btn = document.getElementById('callAstreinteBtn');
  const msg = document.getElementById('callMsg');
  if (!btn) return;
  function isOpen(now){
    const d = now.getDay(); // 0=dim, 1=lun, …, 6=sam
    const h = now.getHours();
    const m = now.getMinutes();
    const inDay = (d >= 1 && d <= 6);   // lundi..samedi
    const afterOpen  = (h > 8) || (h === 8 && m >= 0);
    const beforeClose= (h < 19) || (h === 19 && m === 0);
    return inDay && afterOpen && beforeClose;
  }
  btn.addEventListener('click', function(){
    const ok = isOpen(new Date());
    if (ok){
      if (detectDeviceType() === "Mobile") {
        window.location.href = 'tel:+33667648271';
      } else {
        btn.textContent = "📞  06 67 64 82 71"
      }
    }else{
      if (msg){
        msg.textContent = "Désolé, nos techniciens se reposent pour être en pleine forme pour vous servir durant les horaires d'ouverture (8h - 19h).";
        msg.style.display = 'block';
      }
    }
  });
})();


// Propriétaire bailleur ou Gestionnaire -> champs locataire
(function(){
  const sel = document.getElementById('profilSelect');
  const locataireFields = document.getElementById('locataireFields');
  const telLocataire = document.getElementById('telephone_locataire');
  const nomLocataire = document.getElementById('nom_locataire');
  
  function toggleLocataireFields(){
    if(!sel || !locataireFields) return;
    const isBailleurOuGestionnaire = sel.value === 'Propriétaire bailleur' || sel.value === 'Gestionnaire';
    
    locataireFields.style.display = isBailleurOuGestionnaire ? 'block' : 'none';
    
    if(telLocataire) telLocataire.required = isBailleurOuGestionnaire;
    if(nomLocataire) nomLocataire.required = isBailleurOuGestionnaire;
    
    if(!isBailleurOuGestionnaire){
      if(telLocataire) telLocataire.value = '';
      if(nomLocataire) nomLocataire.value = '';
    }
  }
  
  if(sel){
    sel.addEventListener('change', toggleLocataireFields);
    toggleLocataireFields();
  }
})();
