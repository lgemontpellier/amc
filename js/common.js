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


// Gestion du champ profilSelect : champs locataire, détail profil, téléphone et email obligatoires
(function(){
  const sel = document.getElementById('profilSelect');
  if(!sel) return;

  // Éléments du DOM
  const locataireFields = document.getElementById('locataireFields');
  const telLocataire = document.getElementById('telephone_locataire');
  const nomLocataire = document.getElementById('nom_locataire');
  const det = document.getElementById('profilDetail');
  const tel = document.getElementById('telephone');
  const email = document.getElementById('email');

  function handleProfilChange(){
    const value = sel.value;
    const isBailleurOuGestionnaire = value === 'Propriétaire bailleur' || value === 'Gestionnaire';
    const isGestionnaire = value === 'Gestionnaire';

    // 1. Champs locataire (Propriétaire bailleur ou Gestionnaire)
    if(locataireFields){
      locataireFields.style.display = isBailleurOuGestionnaire ? 'block' : 'none';

      if(!isBailleurOuGestionnaire){
        if(telLocataire) telLocataire.value = '';
        if(nomLocataire) nomLocataire.value = '';
      }
    }

    // 2. Champ détail profil (Gestionnaire uniquement)
    if(det){
      if(isGestionnaire){
        det.classList.remove('hidden');
      } else {
        det.classList.add('hidden');
        det.value = '';
      }
    }

    // 3. Téléphone obligatoire (non obligatoire si Propriétaire bailleur ou Gestionnaire)
    if(tel){
      const telLabel = document.querySelector('label[for="telephone"]');

      if(isBailleurOuGestionnaire){
        tel.removeAttribute('required');
        // Retirer l'astérisque du label si présent
        if(telLabel){
          telLabel.textContent = telLabel.textContent.replace(/\s*\*\s*$/, '');
        }
      } else {
        tel.setAttribute('required', 'required');
        // Ajouter l'astérisque au label si absent
        if(telLabel && !telLabel.textContent.includes('*')){
          telLabel.textContent = telLabel.textContent.trim() + ' *';
        }
      }
    }

    // 4. Email obligatoire (non obligatoire si Gestionnaire uniquement)
    if(email){
      const emailLabel = document.querySelector('label[for="email"]');

      if(isGestionnaire){
        email.removeAttribute('required');
        // Retirer l'astérisque du label si présent
        if(emailLabel){
          emailLabel.textContent = emailLabel.textContent.replace(/\s*\*\s*$/, '');
        }
      } else {
        email.setAttribute('required', 'required');
        // Ajouter l'astérisque au label si absent
        if(emailLabel && !emailLabel.textContent.includes('*')){
          emailLabel.textContent = emailLabel.textContent.trim() + ' *';
        }
      }
    }
  }
  
  sel.addEventListener('change', handleProfilChange);
  handleProfilChange(); // Initialisation
})();

// === Validation et prévisualisation des fichiers image ===
(function(){
  
  function showFileError(input, message) {
    // Supprimer les erreurs précédentes
    const existingError = input.parentElement.querySelector('.file-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Créer le message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'file-error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
    
    // Réinitialiser l'input
    input.value = '';
    
    // Mettre à jour le nom du fichier
    const fileNameId = input.id.replace('fichier_', 'file-name-fichier_').replace('photo', 'file-name-photo');
    const fileName = document.getElementById(fileNameId);
    if (fileName) {
      fileName.textContent = '';
      fileName.classList.remove('has-file');
    }
  }
  
  function setupFilePreview(inputId, previewId, fileNameId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const fileName = document.getElementById(fileNameId);
    
    if (!input || !preview) return;
    
    function updateFileName(file) {
      if (fileName) {
        if (file) {
          fileName.textContent = file.name;
          fileName.classList.add('has-file');
        } else {
          fileName.textContent = '';
          fileName.classList.remove('has-file');
        }
      }
    }
    
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      
      // Supprimer les erreurs précédentes
      const existingError = input.parentElement.querySelector('.file-error');
      if (existingError) {
        existingError.remove();
      }
      
      if (!file) {
        preview.innerHTML = '';
        updateFileName(null);
        return;
      }
      
      // Afficher la prévisualisation
      updateFileName(file);
      const reader = new FileReader();
      
      reader.onload = function(e) {
        preview.innerHTML = `
          <div class="preview-container">
            <img src="${e.target.result}" alt="Preview" class="preview-image">
            <button type="button" class="preview-remove" aria-label="Supprimer l'image">×</button>
          </div>
        `;
        
        // Bouton pour supprimer la prévisualisation
        const removeBtn = preview.querySelector('.preview-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', function() {
            input.value = '';
            preview.innerHTML = '';
            updateFileName(null);
            const existingError = input.parentElement.querySelector('.file-error');
            if (existingError) {
              existingError.remove();
            }
          });
        }
      };
      
      reader.onerror = function() {
        showFileError(input, '❌ Erreur lors de la lecture du fichier');
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  // Initialiser les prévisualisations pour tous les inputs file
  // Formulaire autres_devis
  setupFilePreview('fichier_1', 'preview_fichier_1', 'file-name-fichier_1');
  setupFilePreview('fichier_2', 'preview_fichier_2', 'file-name-fichier_2');
  
  // Formulaire questionnaire
  setupFilePreview('photo1', 'preview_photo1', 'file-name-photo1');
  setupFilePreview('photo2', 'preview_photo2', 'file-name-photo2');
  setupFilePreview('photo3', 'preview_photo3', 'file-name-photo3');
  
})();

// === Initialisation du timestamp du formulaire ===
(function(){
  const timestampField = document.getElementById('formTimestamp');
  if (timestampField) {
    timestampField.value = Date.now();
  }
})();

// === Génération du numéro de référence au format YYYYMMDDHHmmss ===
(function(){
  function generateReferenceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return year + month + day + hours + minutes + seconds;
  }
  
  // Formulaire autres_devis
  const autresDevisSubject = document.getElementById('emailSubject');
  if (autresDevisSubject && autresDevisSubject.value.includes('[Autres devis]')) {
    const referenceNumber = generateReferenceNumber();
    autresDevisSubject.value = '[Autres devis] Nouvelle demande (élec/plomb) - ' + referenceNumber;
  }
  
  // Formulaire questionnaire Allo Mon Cumulus
  const questionnaireSubject = document.getElementById('emailSubject');
  if (questionnaireSubject && questionnaireSubject.value.includes('Allo Mon Cumulus')) {
    const referenceNumber = generateReferenceNumber();
    questionnaireSubject.value = 'Nouvelle demande – Allo Mon Cumulus - ' + referenceNumber;
  }
})();
