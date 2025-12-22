import React from 'react';

const RevueTab = ({
  datesDispo,
  genererDerniersJours,
  previsionsProcessed,
  planifications,
  programmes,
  calculerProductivite,
  calculerNombreEmployesEquivalents,
  calculerProductivitePrevisionnelle,
  setDateAffectation,
  setVolumeAffectation,
  setDimensionnementGenere,
  setAffectationsPostes,
  setActivitesPersonnalisees,
  setActiveTab,
  getJourSemaine,
  isWeekend,
  grouperParSemaines,
  disponibilites,
  employes,
  parametres
}) => {
  // Fonction pour vérifier si un jour a des disponibilités
  const aDesDisponibilites = (date) => {
    return employes.some(employe => {
      const dispo = disponibilites[employe.id]?.[date];
      return dispo && dispo !== 'non';
    });
  };

  // Grouper les 30 premiers jours par semaines
  const datesPour30Jours = datesDispo.slice(0, 30);
  const semaines = grouperParSemaines(datesPour30Jours);
  
  // Générer et grouper les 7 derniers jours par semaines
  const datesDerniers7Jours = genererDerniersJours(7);
  const semainesHistorique = grouperParSemaines(datesDerniers7Jours);
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* SECTION HISTORIQUE - 7 DERNIERS JOURS */}
      <h2 className="text-xl font-semibold mb-4">📜 Historique des 7 derniers jours planifiés</h2>
      
      {/* Affichage par semaines - Historique */}
      {semainesHistorique.map((semaine, index) => {
        // Définir le nom de la semaine pour l'historique
        const nomSemaine = index === 0 ? 'Semaine -1' : `Semaine -${index + 1}`;
        
        return (
          <div key={`historique-${index}`} className="mb-6 border-2 border-amber-400 rounded-lg overflow-hidden">
            {/* En-tête de semaine - Style historique */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-3">
              <h3 className="font-semibold">
                📜 {nomSemaine} ({semaine.debut} - {semaine.fin})
              </h3>
            </div>
          
          {/* Tableau de la semaine historique */}
          <div className="overflow-x-auto bg-amber-50">
            <table className="min-w-full">
              <thead>
                <tr className="bg-amber-100 border-b border-amber-300">
                  <th className="px-4 py-3 text-left text-sm font-medium">Jour</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Volume</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Nombre d'employés</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Productivité</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {semaine.jours.map((date, jourIndex) => {
                  const jourSem = getJourSemaine(date);
                  const planning = planifications[date];
                  const productivite = calculerProductivite(date);
                  
                  // Déterminer l'indicateur et la couleur pour l'historique
                  const hasDisponibilites = aDesDisponibilites(date);
                  const hasPlanification = planning && planning.dimensionnement;
                  
                  let indicateur = '⚪'; // Blanc par défaut (pas de dispo)
                  let couleurIndicateur = 'text-gray-400';
                  let bgColor = jourIndex % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100';
                  let textColor = 'text-gray-500 italic';
                  let statusLabel = 'Jour non travaillé';
                  
                  if (hasDisponibilites) {
                    if (hasPlanification) {
                      indicateur = '🟢'; // Vert : disponible ET planifié
                      couleurIndicateur = 'text-green-500';
                      textColor = '';
                      statusLabel = 'Planifié';
                    } else {
                      indicateur = '🔴'; // Rouge : disponible SANS planification
                      couleurIndicateur = 'text-red-500';
                      textColor = '';
                      statusLabel = 'Non planifié';
                    }
                  }
                  
                  const isJourNonTravaille = !hasDisponibilites;
                  
                  return (
                    <tr 
                      key={date} 
                      className={`border-b border-amber-200 ${bgColor}`}
                    >
                      {/* Colonne Jour */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={couleurIndicateur}>
                            {indicateur}
                          </span>
                          <div>
                            <span className={`font-medium ${textColor}`}>
                              {jourSem} {date.split('/')[0]}/{date.split('/')[1]}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {statusLabel}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {isJourNonTravaille ? (
                        // Ligne jour non travaillé simplifiée
                        <td colSpan="4" className="px-4 py-3 text-center text-gray-400 italic">
                          Aucune disponibilité
                        </td>
                      ) : (
                        // Ligne normale avec toutes les colonnes
                        <>
                          {/* Colonne Volume */}
                          <td className="px-4 py-3 text-center">
                            {planning && planning.volume ? (
                              <span className="font-medium">{planning.volume} l</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          
                          {/* Colonne Nombre d'employés */}
                          <td className="px-4 py-3 text-center">
                            {(() => {
                              if (planning && planning.affectations) {
                                const nombreAffectes = Object.values(planning.affectations).filter(e => e).length;
                                return nombreAffectes > 0 ? (
                                  <span className="font-medium">{nombreAffectes}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                );
                              }
                              return <span className="text-gray-400">-</span>;
                            })()}
                          </td>
                          
                          {/* Colonne Productivité réelle */}
                          <td className="px-4 py-3 text-center">
                            {(() => {
                              const cible = parametres.productiviteCible || 100;
                              const seuilOrange = cible * 0.95; // Cible -5%
                              const seuilRouge = cible * 0.90; // Cible -10%
                              
                              return productivite > 0 ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  productivite >= cible ? 'bg-green-100 text-green-800' :
                                  productivite >= seuilOrange ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {productivite.toFixed(1)} l/h
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </td>
                          
                          {/* Colonne Action */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button 
                                className="px-3 py-1 text-xs text-white rounded hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#007F61" }}
                                onClick={() => {
                                  setDateAffectation(date);
                                  
                                  if (planning) {
                                    // Mode MODIFICATION
                                    setVolumeAffectation(planning.volume || 0);
                                    setDimensionnementGenere(planning.dimensionnement || null);
                                    setAffectationsPostes(planning.affectations || {});
                                    
                                    if (planning.activitesPersonnalisees) {
                                      setActivitesPersonnalisees(planning.activitesPersonnalisees);
                                    } else {
                                      setActivitesPersonnalisees([]);
                                    }
                                  } else {
                                    // Mode CRÉATION (pour un jour passé non planifié)
                                    setVolumeAffectation(0);
                                    setDimensionnementGenere(null);
                                    setAffectationsPostes({});
                                    setActivitesPersonnalisees([]);
                                  }
                                  
                                  setActiveTab("affectation-auto");
                                }}
                              >
                                {planning ? '📝 Modifier' : '➕ Planifier'}
                              </button>
                              
                              {planning && (
                                <button 
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  onClick={() => {
                                    // Charger le planning complet (avec sous-activités)
                                    setDateAffectation(date);
                                    setVolumeAffectation(planning.volume || 0);
                                    setDimensionnementGenere(planning.dimensionnement || null);
                                    setAffectationsPostes(planning.affectations || {});
                                    
                                    if (planning.activitesPersonnalisees) {
                                      setActivitesPersonnalisees(planning.activitesPersonnalisees);
                                    } else {
                                      setActivitesPersonnalisees([]);
                                    }
                                    
                                    // Basculer vers l'onglet Planning Final pour l'impression
                                    setActiveTab("planning-final");
                                    
                                    // Attendre le rendu complet puis imprimer
                                    setTimeout(() => window.print(), 500);
                                  }}
                                  title="Imprimer ce planning avec sous-activités"
                                >
                                  🖨️
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}
      
      {/* Séparateur entre historique et futur */}
      <div className="my-8 border-t-4 border-gray-300"></div>
      
      {/* SECTION FUTUR - 30 PROCHAINS JOURS */}
      <h2 className="text-xl font-semibold mb-4">📅 Revue des 30 prochains jours</h2>
      
      {/* Légende */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">📖 Légende des indicateurs</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-2xl">🟢</span>
              <div>
                <div className="font-medium">Jour travaillé et dimensionné</div>
                <div className="text-xs text-gray-600">Équipe disponible + Planning créé</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-2xl">🔴</span>
              <div>
                <div className="font-medium">Jour travaillé non dimensionné</div>
                <div className="text-xs text-gray-600">Équipe disponible mais pas de planning</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-2xl">⚪</span>
              <div>
                <div className="font-medium">Jour non travaillé</div>
                <div className="text-xs text-gray-600">Aucune disponibilité (weekend/férié)</div>
              </div>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">Productivité:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">≥ Cible l/h</span>
                <span>Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">Cible -5% l/h</span>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">&lt; Cible -10% l/h</span>
                <span>À améliorer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Affichage par semaines */}
      {semaines.map((semaine, index) => {
        // Définir le nom de la semaine
        const nomSemaine = index === 0 ? 'Semaine actuelle' : `Semaine +${index}`;
        
        return (
          <div key={index} className="mb-6 border rounded-lg overflow-hidden">
            {/* En-tête de semaine */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-4 py-3">
              <h3 className="font-semibold">
                📅 {nomSemaine} ({semaine.debut} - {semaine.fin})
              </h3>
            </div>
          
          {/* Tableau de la semaine */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Jour</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Volume</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Nombre d'employés</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Productivité</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {semaine.jours.map((date, jourIndex) => {
                  const isWE = isWeekend(date);
                  const jourSem = getJourSemaine(date);
                  const prevision = previsionsProcessed.find(p => p.date === date);
                  const planning = planifications[date];
                  const programme = programmes.find(p => p.id === planning?.programmeId);
                  const productivite = calculerProductivite(date);
                  
                  // Calculer les lignes dimensionnées
                  let lignesDimensionnees = 0;
                  if (planning && planning.dimensionnement) {
                    const affectations = planning.affectations || {};
                    const postesGeneres = planning.dimensionnement.postesGeneres || [];
                    
                    let totalHeures = 0;
                    Object.entries(affectations).forEach(([posteId, employeId]) => {
                      if (employeId) {
                        const poste = postesGeneres.find(p => p.id === posteId);
                        if (poste) {
                          totalHeures += poste.heuresDimensionnees;
                        }
                      }
                    });
                    
                    lignesDimensionnees = totalHeures * productivite;
                  }
                  
                  // Déterminer l'indicateur et la couleur
                  const hasDisponibilites = aDesDisponibilites(date);
                  const hasPlanification = planning && planning.dimensionnement;
                  
                  let indicateur = '⚪'; // Blanc par défaut (pas de dispo)
                  let couleurIndicateur = 'text-gray-400';
                  let bgColor = 'bg-gray-100 opacity-70';
                  let textColor = 'text-gray-500 italic';
                  let statusLabel = 'Jour non travaillé';
                  
                  if (hasDisponibilites) {
                    if (hasPlanification) {
                      indicateur = '🟢'; // Vert : disponible ET dimensionné
                      couleurIndicateur = 'text-green-500';
                      bgColor = jourIndex % 2 === 0 ? 'bg-green-50' : 'bg-green-100';
                      textColor = '';
                      statusLabel = 'Planifié';
                    } else {
                      indicateur = '🔴'; // Rouge : disponible SANS dimensionnement
                      couleurIndicateur = 'text-red-500';
                      bgColor = jourIndex % 2 === 0 ? 'bg-red-50' : 'bg-red-100';
                      textColor = '';
                      statusLabel = 'À planifier';
                    }
                  }
                  
                  const isJourNonTravaille = !hasDisponibilites;
                  
                  return (
                    <tr 
                      key={date} 
                      className={`border-b ${bgColor}`}
                    >
                      {/* Colonne Jour */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={couleurIndicateur}>
                            {indicateur}
                          </span>
                          <div>
                            <span className={`font-medium ${textColor}`}>
                              {jourSem} {date.split('/')[0]}/{date.split('/')[1]}
                            </span>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {statusLabel}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {isJourNonTravaille ? (
                        // Ligne jour non travaillé simplifiée
                        <td colSpan="4" className="px-4 py-3 text-center text-gray-400 italic">
                          Aucune disponibilité
                        </td>
                      ) : (
                        // Ligne normale avec toutes les colonnes
                        <>
                          {/* Colonne Volume */}
                          <td className="px-4 py-3 text-center">
                            {prevision ? (
                              <span className="font-medium">{prevision.volume} l</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          
                          {/* Colonne Nombre d'employés */}
                          <td className="px-4 py-3 text-center">
                            {(() => {
                              const nombreEmployes = calculerNombreEmployesEquivalents(date);
                              return nombreEmployes > 0 ? (
                                <span className="font-medium">{nombreEmployes.toFixed(1)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </td>
                          
                          {/* Colonne Productivité prévisionnelle */}
                          <td className="px-4 py-3 text-center">
                            {(() => {
                              const productivitePrev = calculerProductivitePrevisionnelle(date);
                              const cible = parametres.productiviteCible || 100;
                              const seuilOrange = cible * 0.95; // Cible -5%
                              const seuilRouge = cible * 0.90; // Cible -10%
                              
                              return productivitePrev > 0 ? (
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  productivitePrev >= cible ? 'bg-green-100 text-green-800' :
                                  productivitePrev >= seuilOrange ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {productivitePrev.toFixed(1)} l/h
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              );
                            })()}
                          </td>
                          
                          {/* Colonne Action */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button 
                                className="px-3 py-1 text-xs text-white rounded hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#007F61" }}
                                onClick={() => {
                                  setDateAffectation(date);
                                  
                                  if (planning) {
                                    // Mode MODIFICATION
                                    setVolumeAffectation(planning.volume || 0);
                                    setDimensionnementGenere(planning.dimensionnement || null);
                                    setAffectationsPostes(planning.affectations || {});
                                    
                                    if (planning.activitesPersonnalisees) {
                                      setActivitesPersonnalisees(planning.activitesPersonnalisees);
                                    } else {
                                      setActivitesPersonnalisees([]);
                                    }
                                  } else {
                                    // Mode CRÉATION
                                    setVolumeAffectation(prevision ? prevision.volume : 0);
                                    setDimensionnementGenere(null);
                                    setAffectationsPostes({});
                                    setActivitesPersonnalisees([]);
                                  }
                                  
                                  setActiveTab("affectation-auto");
                                }}
                              >
                                {planning ? '📝 Modifier' : '➕ Planifier'}
                              </button>
                              
                              {planning && (
                                <button 
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  onClick={() => {
                                    // Charger le planning complet (avec sous-activités)
                                    setDateAffectation(date);
                                    setVolumeAffectation(planning.volume || 0);
                                    setDimensionnementGenere(planning.dimensionnement || null);
                                    setAffectationsPostes(planning.affectations || {});
                                    
                                    if (planning.activitesPersonnalisees) {
                                      setActivitesPersonnalisees(planning.activitesPersonnalisees);
                                    } else {
                                      setActivitesPersonnalisees([]);
                                    }
                                    
                                    // Basculer vers l'onglet Planning Final pour l'impression
                                    setActiveTab("planning-final");
                                    
                                    // Attendre le rendu complet puis imprimer
                                    setTimeout(() => window.print(), 500);
                                  }}
                                  title="Imprimer ce planning avec sous-activités"
                                >
                                  🖨️
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default RevueTab;
