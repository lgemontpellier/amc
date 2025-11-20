// --- CP 30 km Montpellier ---
window.CP_VILLES = {
  "34000":["Montpellier"], "34070":["Montpellier"], "34080":["Montpellier"], "34090":["Montpellier"],
  "34170":["Castelnau-le-Lez"], "34920":["Le Crès"], "34830":["Jacou","Clapiers"], "34980":["Saint-Gély-du-Fesc","Montferrier-sur-Lez"],
  "34790":["Grabels"], "34990":["Juvignac"], "34430":["Saint-Jean-de-Védas"], "34690":["Fabrègues"],
  "34570":["Pignan","Murviel-lès-Montpellier","Saint-Paul-et-Valmalle","Montarnaud","Vailhauquès"],
  "34880":["Lavérune"], "34750":["Villeneuve-lès-Maguelone"], "34660":["Cournonterral","Cournonsec"],
  "34970":["Lattes"], "34470":["Pérols","Mireval"], "34250":["Palavas-les-Flots"], "34280":["La Grande-Motte"],
  "34130":["Mauguio","Lansargues","Mudaison","Candillargues","Valergues"], "34740":["Vendargues"],
  "34670":["Baillargues","Saint-Brès"], "34160":["Castries","Montaud","Restinclières","Beaulieu","Boisseron","Saussines"],
  "34820":["Teyran","Assas","Guzargues"], "34400":["Lunel","Lunel-Viel","Saturargues","Villetelle","Saint-Nazaire-de-Pézan","Vérargues","Entre-Vignes"],
  "34590":["Marsillargues"], "34730":["Prades-le-Lez"], "34270":["Saint-Mathieu-de-Tréviers","Les Matelles","Valflaunès","Vacquières","Saint-Jean-de-Cuculles"],
  "34770":["Gigean"], "34110":["Frontignan","Vic-la-Gardiole","Mireval"], "34540":["Balaruc-les-Bains","Balaruc-le-Vieux"],
  "34560":["Poussan","Montbazin"], "34200":["Sète"]
};

(function(){ // CP auto + blocage hors zone (attend 5 chiffres)
  const form = document.getElementById('formAutres');
  const cpInput = document.getElementById('cp');
  const villeInput = document.getElementById('ville');
  const alertBox = document.getElementById('cpAlert');
  const cpOverride = document.getElementById('cpOverride');
  const cpOverrideBox = document.getElementById('cpOverrideBox');

  function norm(v){ return String(v||'').replace(/\D/g,'').slice(0,5); }

  function onCP() {
    const raw = cpInput.value || '';
    const cp = norm(raw);
    if (cp.length < 5){ alertBox.style.display='none'; villeInput.removeAttribute('list'); return null; }
    const villes = window.CP_VILLES[cp];
    if (villes && villes.length) {
      alertBox.style.display='none'; cpOverrideBox.style.display='none'; if (cpOverride) cpOverride.checked=false;
      if (villes.length===1){ villeInput.value=villes[0]; villeInput.removeAttribute('list'); }
      else {
        if (!villes.includes(villeInput.value)) villeInput.value = villes[0];
        let dl = document.getElementById('villesList'); if(!dl){ dl=document.createElement('datalist'); dl.id='villesList'; document.body.appendChild(dl); }
        dl.innerHTML = villes.map(v=>'<option value="'+v+'">').join(''); villeInput.setAttribute('list','villesList');
      }
      return true;
    } else {
      alertBox.style.display='block'; cpOverrideBox.style.display='block'; villeInput.value=''; villeInput.removeAttribute('list'); return false;
    }
  }

  if (cpInput){ cpInput.addEventListener('input', onCP); cpInput.addEventListener('blur', onCP); }
  if (form){ form.addEventListener('submit', function(e){ const ok = onCP(); const allowed = (ok===true) || (cpOverride && cpOverride.checked); if(!allowed) e.preventDefault(); }, true); }  
})();

// --- Affichage conditionnel pour Électricité : Panne / Travaux ---
(function(){
  function toggleElec() {
    var radios = document.querySelectorAll('input[name="domaine"]');
    var elec = Array.from(radios).some(r => r.checked && /Électricité|Electricite|électricité|electricite/.test(r.value));
    var extra = document.getElementById('elecExtra');
    if (!extra) return;
    extra.style.display = elec ? 'block' : 'none';
    // Manage required state of sub options
    var subs = extra.querySelectorAll('input[name="elec_nature"]');
    subs.forEach(function(s){ s.required = elec; if (!elec) s.checked = false; });
    // Mettre à jour le * dans la légende
    var legend = extra.querySelector('legend');
    if(legend){
      if(elec && !legend.textContent.includes('*')){
        legend.textContent = legend.textContent + ' *';
      } else if(!elec && legend.textContent.includes('*')){
        legend.textContent = legend.textContent.replace(/\s*\*\s*$/, '');
      }
    }
  }
  document.addEventListener('change', function(e){
    if (e.target && e.target.name === 'domaine') toggleElec();
  });
  // init on load
  toggleElec();
})();


// --- Affichage conditionnel pour Plomberie : catégorie d'équipement ---
(function(){
  function togglePlomb() {
    var radios = document.querySelectorAll('input[name="domaine"]');
    var isPlomb = Array.from(radios).some(function(r){ return r.checked && /Plomberie/i.test(r.value); });
    var extra = document.getElementById('plombExtra');
    if (!extra) return;
    extra.style.display = isPlomb ? 'block' : 'none';
    var subs = extra.querySelectorAll('input[name="plomb_categorie"]');
    subs.forEach(function(s){ s.required = isPlomb; if (!isPlomb) s.checked = false; });
    // Mettre à jour le * dans la légende
    var legend = extra.querySelector('legend');
    if(legend){
      if(isPlomb && !legend.textContent.includes('*')){
        legend.textContent = legend.textContent + ' *';
      } else if(!isPlomb && legend.textContent.includes('*')){
        legend.textContent = legend.textContent.replace(/\s*\*\s*$/, '');
      }
    }
  }
  document.addEventListener('change', function(e){
    if (e.target && e.target.name === 'domaine') togglePlomb();
  });
  // init on load
  togglePlomb();
})();


// --- Plomberie > WC : afficher les détails si 'Plomberie' + 'WC' ---
(function(){
  function toggleWC(){
    var domaine = document.querySelector('input[name="domaine"]:checked');
    var cat = document.querySelector('input[name="plomb_categorie"]:checked');
    var wcBlock = document.getElementById('plombWC');
    if (!wcBlock) return;
    var show = (domaine && /Plomberie/i.test(domaine.value)) && (cat && /WC/i.test(cat.value));
    wcBlock.style.display = show ? 'block' : 'none';
    var subs = wcBlock.querySelectorAll('input[name="plomb_wc_detail"]');
    subs.forEach(function(s){ s.required = show; if (!show) s.checked = false; });
  }
  document.addEventListener('change', function(e){
    if (e.target && (e.target.name === 'domaine' || e.target.name === 'plomb_categorie')) toggleWC();
  });
  // init
  toggleWC();
})();


// --- Plomberie : afficher bloc détaillé selon la catégorie choisie ---
(function(){
  function setRequired(blockId, inputName, on){
    var b = document.getElementById(blockId);
    if (!b) return;
    var subs = b.querySelectorAll('input[name="'+inputName+'"]');
    subs.forEach(function(s){ s.required = on; if (!on) s.checked = false; });
    // Mettre à jour le * dans la légende
    var legend = b.querySelector('legend');
    if(legend){
      if(on && !legend.textContent.includes('*')){
        legend.textContent = legend.textContent + ' *';
      } else if(!on && legend.textContent.includes('*')){
        legend.textContent = legend.textContent.replace(/\s*\*\s*$/, '');
      }
    }
  }
  function show(id, on){ var el = document.getElementById(id); if (el) el.style.display = on ? 'block' : 'none'; }

  function syncPlombDetails(){
    var domaine = document.querySelector('input[name="domaine"]:checked');
    var cat = document.querySelector('input[name="plomb_categorie"]:checked');
    var isPlomb = !!(domaine && /Plomberie/i.test(domaine.value));
    var c = cat ? cat.value : '';

    // Hide all by default
    ['plombWC','plombLavabo','plombEvier','plombBaignoire','plombDouche'].forEach(function(id){ show(id,false); });
    show('plombCumulusNote', false);
    setRequired('plombWC','plomb_wc_detail', false);
    setRequired('plombLavabo','plomb_lavabo_detail', false);
    setRequired('plombEvier','plomb_evier_detail', false);
    setRequired('plombBaignoire','plomb_baignoire_detail', false);
    setRequired('plombDouche','plomb_douche_detail', false);

    if (!isPlomb) return;

    if (/WC/i.test(c)){{ show('plombWC', true); setRequired('plombWC','plomb_wc_detail', true); return; }}
    if (/Lavabo/i.test(c)){{ show('plombLavabo', true); setRequired('plombLavabo','plomb_lavabo_detail', true); return; }}
    if (/Évier|Evier/i.test(c)){{ show('plombEvier', true); setRequired('plombEvier','plomb_evier_detail', true); return; }}
    if (/Baignoire/i.test(c)){{ show('plombBaignoire', true); setRequired('plombBaignoire','plomb_baignoire_detail', true); return; }}
    if (/Douche/i.test(c)){{ show('plombDouche', true); setRequired('plombDouche','plomb_douche_detail', true); return; }}
    if (/Cumulus/i.test(c)){{ show('plombCumulusNote', true); return; }}
    // "Autre problème" => rien de spécial
  }

  document.addEventListener('change', function(e){
    if (!e.target) return;
    if (e.target.name === 'domaine' || e.target.name === 'plomb_categorie') syncPlombDetails();
  });
  // init on load
  syncPlombDetails();
})();

// Gestionnaire -> champ détail (géré dans common.js)
