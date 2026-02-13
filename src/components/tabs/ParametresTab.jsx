import React, { useState } from 'react';

const ParametresTab = ({
  productivite,
  defaultProductivite,
  handleProductiviteChange,
  parametres,
  defaultParametres,
  handleParametresChange,
  setParametres,
  competencesActivites,
  couleursActivites,
  modifierCreneau,
  ajouterCreneau,
  supprimerCreneau,
  toggleActiviteCreneau,
  activiteParentSelectionnee,
  setActiviteParentSelectionnee,
  nouvelleSousActivite,
  setNouvelleSousActivite,
  ajouterSousActivite,
  supprimerSousActivite,
  toggleHeritageCompetence,
  toggleCreneauSousActivite,
  toggleMemePersonne,
  sauvegarderParametres
}) => {

  const [nouvelleActiviteRec, setNouvelleActiviteRec] = useState('');
  const [sectionActive, setSectionActive] = useState('productivite');

  const ajouterActiviteRecurrente = () => {
    if (!nouvelleActiviteRec.trim()) return;
    const nom = nouvelleActiviteRec.trim().toUpperCase();
    
    setParametres(prev => ({
      ...prev,
      activitesRecurrentes: [...(prev.activitesRecurrentes || []), { nom, creneaux: [] }]
    }));
    setNouvelleActiviteRec('');
    setTimeout(() => sauvegarderParametres(), 500);
  };

  const supprimerActiviteRecurrente = (index) => {
    setParametres(prev => ({
      ...prev,
      activitesRecurrentes: prev.activitesRecurrentes.filter((_, i) => i !== index)
    }));
    setTimeout(() => sauvegarderParametres(), 500);
  };

  const modifierNombrePersonnes = (actIndex, creneauId, nombre) => {
    setParametres(prev => {
      const updated = { ...prev };
      const act = updated.activitesRecurrentes[actIndex];
      const creneauExist = act.creneaux.find(c => c.creneauId === creneauId);
      
      if (creneauExist) {
        creneauExist.nombrePersonnes = parseInt(nombre) || 0;
      } else {
        act.creneaux.push({ creneauId, nombrePersonnes: parseInt(nombre) || 0 });
      }
      
      act.creneaux = act.creneaux.filter(c => c.nombrePersonnes > 0);
      
      return updated;
    });
    setTimeout(() => sauvegarderParametres(), 500);
  };

  const getSousActiviteNom = (sousActivite) => {
    return typeof sousActivite === 'string' ? sousActivite : sousActivite.nom;
  };

  const getSousActiviteCreneaux = (sousActivite) => {
    if (typeof sousActivite === 'string') {
      return parametres.creneauxPersonnalises?.map(c => c.id) || [];
    }
    return sousActivite.creneauxAutorises || [];
  };

  // Navigation sections
  const sections = [
    { id: 'productivite', label: '📊 Productivité', color: 'from-blue-500 to-blue-600' },
    { id: 'dimensionnement', label: '⚙️ Dimensionnement', color: 'from-purple-500 to-purple-600' },
    { id: 'creneaux', label: '🕒 Créneaux horaires', color: 'from-green-500 to-green-600' },
    { id: 'sous-activites', label: '📋 Sous-activités', color: 'from-orange-500 to-orange-600' },
    { id: 'recurrentes', label: '🔄 Activités récurrentes', color: 'from-pink-500 to-pink-600' },
    { id: 'contraintes', label: '⚖️ Contraintes de répartition', color: 'from-red-500 to-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🎛️ Paramétrages</h1>
        <p className="text-teal-100">Configuration complète de l'application</p>
      </div>

      {/* Navigation par sections */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSectionActive(section.id)}
              className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                sectionActive === section.id
                  ? `bg-gradient-to-r ${section.color} text-white shadow-md transform scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Productivité */}
      {sectionActive === 'productivite' && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
            📊 Productivité par activité
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'frigo', label: '❄️ Picking Frigo', unit: 'lignes/h', color: 'blue' },
              { key: 'controle', label: '✓ Contrôle', unit: 'boites/h', color: 'yellow' },
              { key: 'pickingTrad', label: '📦 Picking Trad', unit: 'lignes/h', color: 'orange' },
              { key: 'eo', label: '🎯 EO', unit: 'lignes/h', color: 'cyan' },
              { key: 'remplissageAuto', label: '🤖 Rempl. Automates', unit: 'unités/h', color: 'purple' },
              { key: 'rangement', label: '📥 Rangement', unit: 'lignes/h', color: 'gray' },
            ].map(({ key, label, unit, color }) => (
              <div key={key} className={`bg-white rounded-lg p-4 shadow-md border-l-4 border-${color}-500 hover:shadow-xl transition-shadow`}>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  {label}
                  <span className="text-xs text-gray-500 ml-2">({unit})</span>
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={productivite[key]} 
                    onChange={(e) => handleProductiviteChange(key, e.target.value)}
                  />
                  <div className={`bg-${color}-100 px-3 py-2 rounded-lg text-${color}-800 font-semibold text-sm whitespace-nowrap`}>
                    Défaut: {defaultProductivite[key]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Dimensionnement */}
      {sectionActive === 'dimensionnement' && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
            ⚙️ Paramètres de dimensionnement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'tauxEjection', label: '🚫 Taux éjections contrôle', unit: '%', color: 'red' },
              { key: 'conversionLignesBacs', label: '📊 Conversion lignes → bacs', unit: '', color: 'indigo' },
              { key: 'conversionUnitesLignes', label: '📈 Conversion unités → lignes', unit: '', color: 'indigo' },
              { key: 'pourcentageAutomates', label: '🤖 % produits automates', unit: '%', color: 'purple' },
              { key: 'pourcentageFrigo', label: '❄️ % produits frigo', unit: '%', color: 'blue' },
              { key: 'pourcentageEO', label: '🎯 % produits EO', unit: '%', color: 'cyan' },
              { key: 'lignesRangement', label: '📥 Lignes/jour rangement', unit: '', color: 'gray' },
              { key: 'pourcentagePickingTrad', label: '📦 % picking traditionnel', unit: '%', color: 'orange' },
              { key: 'facteurHeuresPersonne', label: '⏱️ Facteur heures/personne', unit: 'h', color: 'teal', step: '0.01' },
              { key: 'productiviteCible', label: '🎯 Productivité cible', unit: 'lignes/h', color: 'green' },
            ].map(({ key, label, unit, color, step }) => (
              <div key={key} className={`bg-white rounded-lg p-4 shadow-md border-l-4 border-${color}-500 hover:shadow-xl transition-shadow`}>
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  {label}
                  {unit && <span className="text-xs text-gray-500 ml-2">({unit})</span>}
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    step={step || "1"}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    value={parametres[key]} 
                    onChange={(e) => handleParametresChange(key, e.target.value)}
                  />
                  <div className={`bg-${color}-100 px-3 py-2 rounded-lg text-${color}-800 font-semibold text-sm whitespace-nowrap`}>
                    Défaut: {defaultParametres[key]}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-purple-100 border-l-4 border-purple-500 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>💡 Info :</strong> Seuils de couleur: Vert (≥ cible), Orange (≥ cible -5%), Rouge (&lt; cible -10%)
            </p>
          </div>
        </div>
      )}

      {/* Section Créneaux */}
      {sectionActive === 'creneaux' && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
            🕒 Configuration des créneaux horaires
          </h2>
          <p className="text-sm text-green-700 mb-6 bg-green-100 p-3 rounded-lg">
            📝 Personnalisez les horaires de travail et les activités autorisées pour chaque créneau.
          </p>
          
          <div className="space-y-4">
            {parametres.creneauxPersonnalises && parametres.creneauxPersonnalises.map((creneau, index) => (
              <div key={creneau.id} className="bg-white rounded-xl p-5 shadow-lg border-2 border-green-200 hover:shadow-2xl transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl text-green-800 flex items-center gap-2">
                    🕐 Créneau {index + 1}
                    <span className="text-sm font-normal text-gray-500">({creneau.label})</span>
                  </h4>
                  {parametres.creneauxPersonnalises.length > 1 && (
                    <button
                      onClick={() => supprimerCreneau(creneau.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">⏰ Heure début</label>
                    <input
                      type="time"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      value={creneau.heureDebut}
                      onChange={(e) => modifierCreneau(creneau.id, 'heureDebut', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">⏰ Heure fin</label>
                    <input
                      type="time"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                      value={creneau.heureFin}
                      onChange={(e) => modifierCreneau(creneau.id, 'heureFin', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">⏱️ Durée</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg bg-gray-100 font-bold text-green-700"
                        value={`${creneau.duree}h`}
                        disabled
                      />
                      <div className="bg-green-500 text-white px-3 py-2 rounded-lg font-bold">
                        ✓
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2 text-gray-700">👥 Équipe</label>
                  <select
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    value={creneau.equipe}
                    onChange={(e) => modifierCreneau(creneau.id, 'equipe', e.target.value)}
                  >
                    <option value="matin">🌅 Matin uniquement</option>
                    <option value="apresMidi">🌆 Après-midi uniquement</option>
                    <option value="both">🌐 Les deux (matin et après-midi)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-700">✅ Activités autorisées</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {competencesActivites.map(activite => (
                      <label key={activite} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-2 border-transparent hover:border-green-300">
                        <input
                          type="checkbox"
                          checked={creneau.activitesAutorisees.includes(activite)}
                          onChange={() => toggleActiviteCreneau(creneau.id, activite)}
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-sm font-medium">{activite}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={ajouterCreneau}
              className="w-full py-4 border-3 border-dashed border-green-400 rounded-xl text-green-700 font-bold hover:border-green-600 hover:bg-green-50 transition-all text-lg"
            >
              ➕ Ajouter un nouveau créneau
            </button>
          </div>
        </div>
      )}

      {/* Section Sous-activités */}
      {sectionActive === 'sous-activites' && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border-2 border-orange-200">
          <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
            📋 Configuration des sous-activités
          </h2>
          <p className="text-sm text-orange-700 mb-6 bg-orange-100 p-3 rounded-lg">
            🔧 Définissez les sous-activités pour chaque activité principale. Les sous-activités peuvent hériter des compétences de leur activité parent.
          </p>
          
          <div className="space-y-6">
            {competencesActivites.map(activite => (
              <div key={activite} className="bg-white rounded-xl p-5 shadow-lg border-2 border-orange-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl" style={{color: '#007F61'}}>
                    📌 {activite}
                  </h4>
                  <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-bold">
                    {(parametres.sousActivites[activite] || []).length} sous-activité(s)
                  </span>
                </div>
                
                {parametres.sousActivites[activite] && parametres.sousActivites[activite].length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {parametres.sousActivites[activite].map(sousAct => {
                      const nomSousAct = getSousActiviteNom(sousAct);
                      const creneauxAutorises = getSousActiviteCreneaux(sousAct);
                      
                      return (
                        <div key={nomSousAct} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col gap-2">
                              <span className="font-bold text-lg">{nomSousAct}</span>
                              <div className="flex items-center gap-4 flex-wrap">
                                <label className="flex items-center gap-2 text-sm cursor-pointer bg-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                  <input
                                    type="checkbox"
                                    checked={parametres.heritageCompetences[nomSousAct] || false}
                                    onChange={() => toggleHeritageCompetence(nomSousAct)}
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className={parametres.heritageCompetences[nomSousAct] ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                                    {parametres.heritageCompetences[nomSousAct] ? '✓ Hérite des compétences' : 'Compétences spécifiques'}
                                  </span>
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer bg-white px-3 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                  <input
                                    type="checkbox"
                                    checked={typeof sousAct === 'object' && sousAct.memepersonne || false}
                                    onChange={() => toggleMemePersonne(activite, nomSousAct)}
                                    className="w-4 h-4 rounded"
                                  />
                                  <span className={typeof sousAct === 'object' && sousAct.memepersonne ? 'text-blue-600 font-bold' : 'text-gray-500'}>
                                    {typeof sousAct === 'object' && sousAct.memepersonne ? '📌 Même personne sur la journée' : '📌 Même personne'}
                                  </span>
                                </label>
                              </div>
                            </div>
                            <button
                              onClick={() => supprimerSousActivite(activite, nomSousAct)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                          
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              🕒 Créneaux horaires autorisés:
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {parametres.creneauxPersonnalises?.map(creneau => {
                                const estAutoriseActivitePrincipale = creneau.activitesAutorisees.includes(activite);
                                
                                return (
                                  <label 
                                    key={creneau.id} 
                                    className={`flex items-center gap-2 p-2 rounded-lg border-2 ${
                                      estAutoriseActivitePrincipale 
                                        ? 'bg-white hover:bg-orange-50 cursor-pointer border-gray-200 hover:border-orange-300' 
                                        : 'bg-gray-200 cursor-not-allowed opacity-60 border-gray-300'
                                    }`}
                                    title={!estAutoriseActivitePrincipale 
                                      ? `Ce créneau n'est pas autorisé pour l'activité ${activite}` 
                                      : ''
                                    }
                                  >
                                    <input
                                      type="checkbox"
                                      checked={creneauxAutorises.includes(creneau.id)}
                                      onChange={() => toggleCreneauSousActivite(activite, nomSousAct, creneau.id)}
                                      disabled={!estAutoriseActivitePrincipale}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className={`text-sm ${!estAutoriseActivitePrincipale ? 'text-gray-500' : 'font-medium'}`}>
                                      {creneau.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              ℹ️ Les créneaux grisés ne sont pas autorisés pour l'activité <strong>{activite}</strong>.
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mb-4 italic bg-gray-50 p-4 rounded-lg text-center">
                    Aucune sous-activité définie
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom de la sous-activité"
                    value={activiteParentSelectionnee === activite ? nouvelleSousActivite : ''}
                    onChange={(e) => {
                      setActiviteParentSelectionnee(activite);
                      setNouvelleSousActivite(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && activiteParentSelectionnee === activite) {
                        ajouterSousActivite();
                      }
                    }}
                    className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    onClick={() => {
                      setActiviteParentSelectionnee(activite);
                      ajouterSousActivite();
                    }}
                    className="px-6 py-3 text-white rounded-lg hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all font-bold"
                    style={{ backgroundColor: "#007F61" }}
                  >
                    ➕ Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Note :</strong> Les sous-activités avec héritage de compétences utilisent automatiquement 
              les compétences de l'activité principale. Les sous-activités sans héritage nécessiteront 
              une définition de compétences spécifiques dans la matrice de compétences.
            </p>
          </div>
        </div>
      )}

      {/* Section Contraintes de répartition */}
      {sectionActive === 'contraintes' && (
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-lg p-6 border-2 border-red-200">
          <h2 className="text-2xl font-bold mb-4 text-red-800 flex items-center gap-2">
            ⚖️ Contraintes de répartition par activité
          </h2>
          <p className="text-sm text-red-700 mb-6 bg-red-100 p-3 rounded-lg">
            🎯 Définissez des limites min/max de personnes par activité et créneau pour éviter les déséquilibres dans la répartition du personnel.
          </p>
          
          <div className="space-y-6">
            {competencesActivites.map(activite => {
              // Compter les contraintes actives pour cette activité
              const contraintesActivite = parametres.contraintesRepartition?.[activite] || {};
              const nombreContraintesActives = Object.values(contraintesActivite).filter(c => c.actif).length;
              
              return (
                <div key={activite} className="bg-white rounded-xl p-5 shadow-lg border-2 border-red-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-xl" style={{color: '#007F61'}}>
                      📌 {activite}
                    </h4>
                    <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">
                      {nombreContraintesActives} contrainte{nombreContraintesActives > 1 ? 's' : ''} active{nombreContraintesActives > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {parametres.creneauxPersonnalises?.map(creneau => {
                      // Ne montrer que les créneaux où l'activité est autorisée
                      if (!creneau.activitesAutorisees.includes(activite)) {
                        return null;
                      }
                      
                      const contrainte = contraintesActivite[creneau.id] || { min: 0, max: 10, actif: false };
                      
                      return (
                        <div key={creneau.id} className={`p-4 rounded-lg border-2 ${
                          contrainte.actif 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={contrainte.actif || false}
                                  onChange={(e) => {
                                    setParametres(prev => ({
                                      ...prev,
                                      contraintesRepartition: {
                                        ...prev.contraintesRepartition,
                                        [activite]: {
                                          ...prev.contraintesRepartition[activite],
                                          [creneau.id]: {
                                            ...contrainte,
                                            actif: e.target.checked
                                          }
                                        }
                                      }
                                    }));
                                    setTimeout(() => sauvegarderParametres(), 500);
                                  }}
                                  className="w-5 h-5 rounded"
                                />
                                <span className="font-bold text-sm">
                                  {contrainte.actif ? '✓ Activé' : 'Désactivé'}
                                </span>
                              </label>
                              <span className="text-sm font-medium text-gray-700">
                                {creneau.label} ({creneau.duree}h)
                              </span>
                            </div>
                          </div>
                          
                          {contrainte.actif && (
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                  Minimum de personnes
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={contrainte.max || 10}
                                  value={contrainte.min || 0}
                                  onChange={(e) => {
                                    const newMin = parseInt(e.target.value) || 0;
                                    const newMax = Math.max(newMin, contrainte.max || 0);
                                    setParametres(prev => ({
                                      ...prev,
                                      contraintesRepartition: {
                                        ...prev.contraintesRepartition,
                                        [activite]: {
                                          ...prev.contraintesRepartition[activite],
                                          [creneau.id]: {
                                            ...contrainte,
                                            min: newMin,
                                            max: newMax
                                          }
                                        }
                                      }
                                    }));
                                    setTimeout(() => sauvegarderParametres(), 500);
                                  }}
                                  className="w-full p-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                  Maximum de personnes
                                </label>
                                <input
                                  type="number"
                                  min={contrainte.min || 0}
                                  value={contrainte.max || 10}
                                  onChange={(e) => {
                                    const newMax = parseInt(e.target.value) || 10;
                                    setParametres(prev => ({
                                      ...prev,
                                      contraintesRepartition: {
                                        ...prev.contraintesRepartition,
                                        [activite]: {
                                          ...prev.contraintesRepartition[activite],
                                          [creneau.id]: {
                                            ...contrainte,
                                            max: Math.max(newMax, contrainte.min || 0)
                                          }
                                        }
                                      }
                                    }));
                                    setTimeout(() => sauvegarderParametres(), 500);
                                  }}
                                  className="w-full p-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:border-red-500 focus:ring-2 focus:ring-red-200"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Bouton pour désactiver toutes les contraintes de cette activité */}
                  {nombreContraintesActives > 0 && (
                    <button
                      onClick={() => {
                        setParametres(prev => {
                          const newContraintes = { ...prev.contraintesRepartition[activite] };
                          Object.keys(newContraintes).forEach(creneauId => {
                            newContraintes[creneauId] = { ...newContraintes[creneauId], actif: false };
                          });
                          return {
                            ...prev,
                            contraintesRepartition: {
                              ...prev.contraintesRepartition,
                              [activite]: newContraintes
                            }
                          };
                        });
                        setTimeout(() => sauvegarderParametres(), 500);
                      }}
                      className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-medium"
                    >
                      ✖️ Désactiver toutes les contraintes de {activite}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Fonctionnement :</strong> Les contraintes limitent le nombre de personnes affectées par activité et créneau lors de la génération automatique à l'Étape 4.
              Si les contraintes ne peuvent pas être respectées (manque de personnel), des alertes seront affichées.
            </p>
          </div>
        </div>
      )}

      {/* Section Activités récurrentes */}
      {sectionActive === 'recurrentes' && (
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-lg p-6 border-2 border-pink-200">
          <h2 className="text-2xl font-bold mb-4 text-pink-800 flex items-center gap-2">
            🔄 Activités récurrentes configurées
          </h2>
          <p className="text-sm text-pink-700 mb-6 bg-pink-100 p-3 rounded-lg">
            🎯 Définissez des activités qui se répètent avec un nombre fixe de personnes par créneau (ex: FORMATION, INVENTAIRE). 
            Ces activités seront créées automatiquement lors de l'affectation.
          </p>
          
          {(parametres.activitesRecurrentes || []).length > 0 && (
            <div className="space-y-4 mb-6">
              {(parametres.activitesRecurrentes || []).map((act, index) => (
                <div key={index} className="bg-white rounded-xl p-5 shadow-lg border-2 border-pink-200 hover:shadow-2xl transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-xl text-pink-800">🎓 {act.nom}</h4>
                    <button
                      onClick={() => supprimerActiviteRecurrente(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {parametres.creneauxPersonnalises?.map(creneau => {
                      const config = act.creneaux.find(c => c.creneauId === creneau.id);
                      const nombrePersonnes = config?.nombrePersonnes || 0;
                      return (
                        <div key={creneau.id} className={`flex items-center gap-2 p-3 rounded-lg border-2 ${nombrePersonnes > 0 ? 'bg-pink-50 border-pink-300' : 'bg-gray-50 border-gray-200'}`}>
                          <label className="text-xs flex-1 font-medium">{creneau.label}:</label>
                          <input
                            type="number"
                            min="0"
                            className="w-16 p-2 border-2 border-gray-300 rounded-lg text-center font-bold focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                            value={nombrePersonnes}
                            onChange={(e) => modifierNombrePersonnes(index, creneau.id, e.target.value)}
                          />
                          <span className="text-xs font-medium">👥</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="🎓 Nom de l'activité (ex: FORMATION, INVENTAIRE)"
              value={nouvelleActiviteRec}
              onChange={(e) => setNouvelleActiviteRec(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && ajouterActiviteRecurrente()}
              className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-lg"
            />
            <button
              onClick={ajouterActiviteRecurrente}
              className="px-6 py-4 text-white rounded-lg hover:bg-opacity-90 shadow-md hover:shadow-lg transition-all font-bold text-lg"
              style={{ backgroundColor: "#007F61" }}
            >
              ➕ Ajouter activité
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Info :</strong> Ces activités seront créées automatiquement lors de l'affectation à l'Étape 4, 
              avec le nombre de postes configuré par créneau.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParametresTab;
