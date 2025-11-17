import React from 'react';

const ParametresTab = ({
  productivite,
  defaultProductivite,
  handleProductiviteChange,
  parametres,
  defaultParametres,
  handleParametresChange,
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
  toggleMemePersonne
}) => {

  // Helper pour obtenir le nom d'une sous-activité (compatibilité ancien/nouveau format)
  const getSousActiviteNom = (sousActivite) => {
    return typeof sousActivite === 'string' ? sousActivite : sousActivite.nom;
  };

  // Helper pour obtenir les créneaux autorisés d'une sous-activité
  const getSousActiviteCreneaux = (sousActivite) => {
    if (typeof sousActivite === 'string') {
      // Format ancien = tous les créneaux par défaut
      return parametres.creneauxPersonnalises?.map(c => c.id) || [];
    }
    return sousActivite.creneauxAutorises || [];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Productivité par activité</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité Frigo (lignes/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.frigo} 
                onChange={(e) => handleProductiviteChange('frigo', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.frigo}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité Contrôle (boites/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.controle} 
                onChange={(e) => handleProductiviteChange('controle', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.controle}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité Picking Traditionnel (lignes/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.pickingTrad} 
                onChange={(e) => handleProductiviteChange('pickingTrad', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.pickingTrad}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité EO (lignes/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.eo} 
                onChange={(e) => handleProductiviteChange('eo', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.eo}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité Remplissage Automates (unités/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.remplissageAuto} 
                onChange={(e) => handleProductiviteChange('remplissageAuto', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.remplissageAuto}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité Rangement (lignes/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={productivite.rangement} 
                onChange={(e) => handleProductiviteChange('rangement', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultProductivite.rangement}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Paramètres pour dimensionnement</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Taux d'éjections au contrôle (%)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.tauxEjection} 
                onChange={(e) => handleParametresChange('tauxEjection', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.tauxEjection}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Conversion de lignes en bacs
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.conversionLignesBacs} 
                onChange={(e) => handleParametresChange('conversionLignesBacs', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.conversionLignesBacs}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Conversion d'unités en ligne
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.conversionUnitesLignes} 
                onChange={(e) => handleParametresChange('conversionUnitesLignes', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.conversionUnitesLignes}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              % de produits automates
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.pourcentageAutomates} 
                onChange={(e) => handleParametresChange('pourcentageAutomates', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.pourcentageAutomates}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              % de produits frigo
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.pourcentageFrigo} 
                onChange={(e) => handleParametresChange('pourcentageFrigo', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.pourcentageFrigo}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              % de produits EO
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.pourcentageEO} 
                onChange={(e) => handleParametresChange('pourcentageEO', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.pourcentageEO}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Lignes par jour au rangement
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.lignesRangement} 
                onChange={(e) => handleParametresChange('lignesRangement', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.lignesRangement}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              % de picking traditionnel
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={parametres.pourcentagePickingTrad} 
                onChange={(e) => handleParametresChange('pourcentagePickingTrad', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.pourcentagePickingTrad}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Facteur heures par personne
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                step="0.01"
                className="w-full p-2 border rounded"
                value={parametres.facteurHeuresPersonne} 
                onChange={(e) => handleParametresChange('facteurHeuresPersonne', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.facteurHeuresPersonne}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Productivité cible (lignes/heure)
            </label>
            <div className="flex items-center">
              <input 
                type="number" 
                step="1"
                className="w-full p-2 border rounded"
                value={parametres.productiviteCible} 
                onChange={(e) => handleParametresChange('productiviteCible', e.target.value)}
              />
              <div className="ml-2 bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium text-sm">
                Défaut: {defaultParametres.productiviteCible}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seuils de couleur: Vert (≥ cible), Orange (≥ cible -5%), Rouge (&lt; cible -10%)
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Configuration des créneaux horaires</h2>
        <p className="text-sm text-gray-600 mb-4">
          Personnalisez les horaires de travail et les activités autorisées pour chaque créneau.
        </p>
        
        <div className="space-y-4">
          {parametres.creneauxPersonnalises && parametres.creneauxPersonnalises.map((creneau, index) => (
            <div key={creneau.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-lg">Créneau {index + 1}</h4>
                {parametres.creneauxPersonnalises.length > 1 && (
                  <button
                    onClick={() => supprimerCreneau(creneau.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Heure début</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded"
                    value={creneau.heureDebut}
                    onChange={(e) => modifierCreneau(creneau.id, 'heureDebut', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Heure fin</label>
                  <input
                    type="time"
                    className="w-full p-2 border rounded"
                    value={creneau.heureFin}
                    onChange={(e) => modifierCreneau(creneau.id, 'heureFin', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Durée calculée</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-100"
                    value={`${creneau.duree}h`}
                    disabled
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Équipe</label>
                <select
                  className="w-full p-2 border rounded"
                  value={creneau.equipe}
                  onChange={(e) => modifierCreneau(creneau.id, 'equipe', e.target.value)}
                >
                  <option value="matin">Matin uniquement</option>
                  <option value="apresMidi">Après-midi uniquement</option>
                  <option value="both">Les deux (matin et après-midi)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Activités autorisées</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {competencesActivites.map(activite => (
                    <label key={activite} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={creneau.activitesAutorisees.includes(activite)}
                        onChange={() => toggleActiviteCreneau(creneau.id, activite)}
                        className="rounded"
                      />
                      <span className="text-sm">{activite}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={ajouterCreneau}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Ajouter un créneau
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Configuration des sous-activités</h2>
        <p className="text-sm text-gray-600 mb-4">
          Définissez les sous-activités pour chaque activité principale. Les sous-activités peuvent hériter des compétences de leur activité parent.
        </p>
        
        <div className="space-y-6">
          {competencesActivites.map(activite => (
            <div key={activite} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-lg" style={{color: '#007F61'}}>{activite}</h4>
                <span className="text-sm text-gray-500">
                  {(parametres.sousActivites[activite] || []).length} sous-activité(s)
                </span>
              </div>
              
              {parametres.sousActivites[activite] && parametres.sousActivites[activite].length > 0 ? (
                <div className="space-y-3 mb-3">
                  {parametres.sousActivites[activite].map(sousAct => {
                    const nomSousAct = getSousActiviteNom(sousAct);
                    const creneauxAutorises = getSousActiviteCreneaux(sousAct);
                    
                    return (
                      <div key={nomSousAct} className="bg-white p-4 rounded border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col gap-2">
                            <span className="font-medium text-lg">{nomSousAct}</span>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={parametres.heritageCompetences[nomSousAct] || false}
                                  onChange={() => toggleHeritageCompetence(nomSousAct)}
                                  className="rounded"
                                />
                                <span className={parametres.heritageCompetences[nomSousAct] ? 'text-green-600' : 'text-gray-500'}>
                                  {parametres.heritageCompetences[nomSousAct] ? '✓ Hérite des compétences' : 'Compétences spécifiques'}
                                </span>
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={typeof sousAct === 'object' && sousAct.memepersonne || false}
                                  onChange={() => toggleMemePersonne(activite, nomSousAct)}
                                  className="rounded"
                                />
                                <span className={typeof sousAct === 'object' && sousAct.memepersonne ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                                  {typeof sousAct === 'object' && sousAct.memepersonne ? '📌 Même personne sur la journée' : '📌 Même personne'}
                                </span>
                              </label>
                            </div>
                          </div>
                          <button
                            onClick={() => supprimerSousActivite(activite, nomSousAct)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                        
                        {/* Sélection des créneaux horaires autorisés */}
                        <div className="ml-4 mt-3 p-3 bg-gray-50 rounded">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            🕒 Créneaux horaires autorisés:
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {parametres.creneauxPersonnalises?.map(creneau => {
                              // Vérifier si ce créneau est autorisé pour l'activité principale
                              const estAutoriseActivitePrincipale = creneau.activitesAutorisees.includes(activite);
                              
                              return (
                                <label 
                                  key={creneau.id} 
                                  className={`flex items-center gap-2 p-2 rounded border ${
                                    estAutoriseActivitePrincipale 
                                      ? 'bg-white hover:bg-gray-50 cursor-pointer' 
                                      : 'bg-gray-200 cursor-not-allowed opacity-60'
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
                                    className="rounded"
                                  />
                                  <span className={`text-sm ${!estAutoriseActivitePrincipale ? 'text-gray-500' : ''}`}>
                                    {creneau.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            ℹ️ Cette sous-activité ne sera disponible que pour les postes sur ces créneaux.
                            Les créneaux grisés ne sont pas autorisés pour l'activité <strong>{activite}</strong>.
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500 mb-3 italic">
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
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button
                  onClick={() => {
                    setActiviteParentSelectionnee(activite);
                    ajouterSousActivite();
                  }}
                  className="px-4 py-2 text-white rounded hover:bg-opacity-90 text-sm"
                  style={{ backgroundColor: "#007F61" }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Les sous-activités avec héritage de compétences utilisent automatiquement 
            les compétences de l'activité principale. Les sous-activités sans héritage nécessiteront 
            une définition de compétences spécifiques dans la matrice de compétences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParametresTab;
