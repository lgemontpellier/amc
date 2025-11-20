

// === Liste CP ~30 km autour de Montpellier (évolutive) ===
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
  "34590":["Marsillargues"],
  "34730":["Prades-le-Lez"], "34270":["Saint-Mathieu-de-Tréviers","Les Matelles","Valflaunès","Vacquières","Saint-Jean-de-Cuculles"],
  "34770":["Gigean"], "34110":["Frontignan","Vic-la-Gardiole","Mireval"], "34540":["Balaruc-les-Bains","Balaruc-le-Vieux"],
  "34560":["Poussan","Montbazin"], "34200":["Sète"],
  "30240":["Le Grau-du-Roi"], "30220":["Aigues-Mortes","Saint-Laurent-d'Aigouze"], "30250":["Sommières","Villevieille","Junas"]
};

// === Ascenseur visible uniquement si étage !== RDC
(function(){
  const etageSel = document.getElementById('etageSelect');
  const ascField = document.getElementById('ascenseurField');
  function toggle(){
    if(!etageSel||!ascField) return;
    const isRdc = /Rez/.test(etageSel.value);
    ascField.style.display = isRdc ? 'none' : 'block';
    const isRequired = !isRdc;
    // Mettre à jour le * dans la légende
    const legend = ascField.querySelector('legend');
    if(legend){
      if(isRequired && !legend.textContent.includes('*')){
        legend.textContent = legend.textContent + ' *';
      } else if(!isRequired && legend.textContent.includes('*')){
        legend.textContent = legend.textContent.replace(/\s*\*\s*$/, '');
      }
    }
  }
  if(etageSel){ etageSel.addEventListener('change', toggle); toggle(); }
})();

// Capacité -> champ "Autre"
(function(){
  const sel = document.getElementById('capacite');
  const box = document.getElementById('autreCapacite');
  function t(){ box.style.display = (sel && sel.value==='Autre') ? 'block' : 'none'; }
  if(sel){ sel.addEventListener('change', t); t(); }
})();

// Orientation visible si "Suspendu au mur"
(function(){
  function isSuspendu(){
    const r=document.querySelector('input[name="implantation"][value="Suspendu au mur"]');
    return r && r.checked;
  }
  const orient=document.getElementById('orientationField');
  const radios=document.querySelectorAll('input[name="implantation"]');
  function toggleOrientation(){
    if(!orient) return;
    if(isSuspendu()){
      orient.style.display='block';
      orient.querySelectorAll('input[type="radio"]').forEach(inp=> inp.required = true);
      // Ajouter * à la légende
      const legend = orient.querySelector('legend');
      if(legend && !legend.textContent.includes('*')){
        legend.textContent = legend.textContent + ' *';
      }
    } else {
      orient.style.display='none';
      orient.querySelectorAll('input[type="radio"]').forEach(inp=>{inp.required=false; inp.checked=false;});
      // Retirer * de la légende
      const legend = orient.querySelector('legend');
      if(legend && legend.textContent.includes('*')){
        legend.textContent = legend.textContent.replace(/\s*\*\s*$/, '');
      }
    }
  }
  radios.forEach(r=> r.addEventListener('change', toggleOrientation));
  toggleOrientation();
})();
// === CP : attendre 5 chiffres + auto-ville + filet de sécurité ===
(function(){
  const form       = document.getElementById('formDevis');
  const cpInput    = document.getElementById('cp');
  const villeInput = document.getElementById('ville');
  const alertBox   = document.getElementById('cpAlert');
  const cpOverride = document.getElementById('cpOverride');
  const cpOverrideBox = document.getElementById('cpOverrideBox');
  const cpOverrideField = document.getElementById('cp_override');
  const cpSaisiField = document.getElementById('cp_saisi');

  function norm(v){ return String(v||'').replace(/\D/g,'').slice(0,5); }

  function onCP(){
    const raw = (cpInput && cpInput.value) || '';
    const cp  = norm(raw);
    if (cpSaisiField) cpSaisiField.value = raw;

    if (cp.length < 5){
      if (alertBox) alertBox.style.display = 'none';
      if (villeInput){ villeInput.removeAttribute('list'); }
      if (cpOverrideBox) cpOverrideBox.style.display='none';
      if (cpOverride) cpOverride.checked = false;
      if (cpOverrideField) cpOverrideField.value='0';
      return null;
    }
    const villes = (window.CP_VILLES||{})[cp];

    if (villes && villes.length){
      if (alertBox) alertBox.style.display = 'none';
      if (cpOverrideBox) cpOverrideBox.style.display='none';
      if (cpOverride) cpOverride.checked = false;
      if (cpOverrideField) cpOverrideField.value='0';

      if (villes.length === 1){
        villeInput.value = villes[0];
        villeInput.removeAttribute('list');
      } else {
        if (!villes.includes(villeInput.value)) villeInput.value = villes[0];
        let dl = document.getElementById('villesList');
        if (!dl){ dl = document.createElement('datalist'); dl.id = 'villesList'; document.body.appendChild(dl); }
        dl.innerHTML = villes.map(v => '<option value="'+v+'">').join('');
        villeInput.setAttribute('list','villesList');
      }
      return true;
    }else{
      if (alertBox) alertBox.style.display = 'block';
      if (villeInput){ villeInput.value=''; villeInput.removeAttribute('list'); }
      if (cpOverrideBox) cpOverrideBox.style.display='block';
      if (cpOverrideField) cpOverrideField.value = (cpOverride && cpOverride.checked) ? '1' : '0';
      return false;
    }
  }

  if (cpInput){
    cpInput.addEventListener('input', onCP);
    cpInput.addEventListener('blur', onCP);
  }

  if (form){
    form.addEventListener('submit', function(e){
      const ok = onCP();
      const allowed = ok === true || (cpOverride && cpOverride.checked);
      if (!allowed){ e.preventDefault(); if (cpInput) cpInput.reportValidity(); }
    }, true);
  }
})();



