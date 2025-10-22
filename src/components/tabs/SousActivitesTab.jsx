import React, { useEffect, useRef, useCallback } from 'react';

const SousActivitesTab = ({
  dimensionnementGenere,
  dateAffectation,
  volumeAffectation,
  affectationsPostes,
  employes,
  competences,
  parametres,
  getActivitePrincipale,
  couleursActivites,
  setDimensionnementGenere,
  setActiveTab,
  sauvegarderPlanification,
  activitesPersonnalisees,
  planifications,
  setPlanifications
}) => {
  const [statutSauvegarde, setStatutSauvegarde] = React.useState(''); // '', 'saving', 'saved', 'error'
  const timeoutSauvegardeRef = useRef(null);

  // Fonction de sauvegarde automatique
  const sauvegarderAutomatiquement = useCallback(async () => {
    if (!dateAffectation || !dimensionnementGenere) return;

    try {
      setStatutSauvegarde('saving');

      const planification = {
        date: dateAffectation,
        volume: volumeAffectation,
        dimensionnement: dimensionnementGenere,
        affectations: affectationsPostes,
        activitesPersonnalisees: activitesPersonnalisees,
        createdAt: new Date().toISOString()
      };

      await sauvegarderPlanification(dateAffectation, planification);

      setStatutSauvegarde('saved');

      // Réinitialiser le statut après 3 secondes
      setTimeout(() => {
        setStatutSauvegarde('');
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setStatutSauvegarde('error');

      // Réinitialiser le statut après 5 secondes
      setTimeout(() => {
        setStatutSauvegarde('');
      }, 5000);
    }
  }, [dateAffectation, volumeAffectation, dimensionnementGenere, affectationsPostes, activitesPersonnalisees, sauvegarderPlanification]);

  // Fonction avec debounce
  const debouncedSauvegarde = useCallback(() => {
    if (timeoutSauvegardeRef.current) {
      clearTimeout(timeoutSauvegardeRef.current);
    }

    timeoutSauvegardeRef.current = setTimeout(() => {
      sauvegarderAutomatiquement();
    }, 500); // 500ms de délai
  }, [sauvegarderAutomatiquement]);

  // Sauvegarder automatiquement quand les sous-activités changent
  useEffect(() => {
    if (dimensionnementGenere && dateAffectation) {
      debouncedSauvegarde();
    }

    return () => {
      if (timeoutSauvegardeRef.current) {
        clearTimeout(timeoutSauvegardeRef.current);
      }
    };
  }, [dimensionnementGenere?.postesGeneres?.map(p => p.sousActivite).join(','), debouncedSauvegarde]);

  // Vérifier qu'une planification a été générée à l'étape 3
  if (!dimensionnementGenere || !dateAffectation) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">⚠️</span>
          <h3 className="font-bold text-lg">Aucune planification active</h3>
        </div>
        <p className="mb-4">
          Vous devez d'abord générer une planification à l'Étape 4 (Affectation automatique) avant de pouvoir attribuer des sous-activités.
        </p>
        <button
          onClick={() => setActiveTab('affectation-auto')}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          → Aller à l'Étape 4
        </button>
      </div>
    );
  }

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

  // Filtrer les postes qui ont des sous-activités possibles
  const postesAvecSousActivites = dimensionnementGenere.postesGeneres.filter(poste => {
    const activitePrincipale = getActivitePrincipale(poste.activite);
    const sousActivitesPossibles = parametres.sousActivites[activitePrincipale] || [];
    
    // Filtrer pour ne garder que les sous-activités autorisées pour ce créneau
    const sousActivitesAutorisees = sousActivitesPossibles.filter(sousAct => {
      const creneauxAutorises = getSousActiviteCreneaux(sousAct);
      return creneauxAutorises.includes(poste.creneauId);
    });
    
    return sousActivitesAutorisees.length > 0 && affectationsPostes[poste.id];
  });

  // Fonction d'attribution automatique équitable
  const attribuerAutomatiquement = () => {
    if (postesAvecSousActivites.length === 0) {
      alert('Aucun poste avec sous-activités disponibles');
      return;
    }

    // Grouper les postes par activité principale et par créneau
    const groupes = {};
    
    postesAvecSousActivites.forEach(poste => {
      const activitePrincipale = getActivitePrincipale(poste.activite);
      const creneau = poste.creneauId;
      const key = `${activitePrincipale}_${creneau}`;
      
      if (!groupes[key]) {
        groupes[key] = {
          activite: activitePrincipale,
          creneau: creneau,
          postes: []
        };
      }
      
      groupes[key].postes.push(poste);
    });

    // Pour chaque groupe, répartir équitablement les sous-activités
    const nouvellesAttributions = {};
    
    Object.values(groupes).forEach(groupe => {
      const sousActivitesPossibles = parametres.sousActivites[groupe.activite] || [];
      
      if (sousActivitesPossibles.length === 0) return;
      
      // Répartition round-robin
      groupe.postes.forEach((poste, index) => {
        const sousActiviteIndex = index % sousActivitesPossibles.length;
        // Utiliser getSousActiviteNom pour extraire le nom (compatibilité ancien/nouveau format)
        nouvellesAttributions[poste.id] = getSousActiviteNom(sousActivitesPossibles[sousActiviteIndex]);
      });
    });

    // Appliquer les attributions
    setDimensionnementGenere(prev => ({
      ...prev,
      postesGeneres: prev.postesGeneres.map(poste => {
        if (nouvellesAttributions[poste.id]) {
          return {
            ...poste,
            sousActivite: nouvellesAttributions[poste.id]
          };
        }
        return poste;
      })
    }));
  };

  // Réinitialiser toutes les sous-activités
  const reinitialiser = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les sous-activités ?')) {
      setDimensionnementGenere(prev => ({
        ...prev,
        postesGeneres: prev.postesGeneres.map(poste => ({
          ...poste,
          sousActivite: null
        }))
      }));
    }
  };

  const handleAttribuerSousActivite = (posteId, sousActivite) => {
    setDimensionnementGenere(prev => ({
      ...prev,
      postesGeneres: prev.postesGeneres.map(poste => {
        if (poste.id === posteId) {
          return {
            ...poste,
            sousActivite: sousActivite || null
          };
        }
        return poste;
      })
    }));
  };

  // Grouper par créneau pour la vue
  const grouperParCreneau = () => {
    const groupes = {};
    postesAvecSousActivites.forEach(poste => {
      const creneau = poste.creneauId;
      if (!groupes[creneau]) {
        groupes[creneau] = {
          label: poste.creneauLabel,
          postes: []
        };
      }
      groupes[creneau].postes.push(poste);
    });
    
    // Trier les postes par activité principale dans chaque créneau
    Object.values(groupes).forEach(groupe => {
      groupe.postes.sort((a, b) => {
        const activiteA = getActivitePrincipale(a.activite);
        const activiteB = getActivitePrincipale(b.activite);
        return activiteA.localeCompare(activiteB);
      });
    });
    
    return groupes;
  };

  const groupesCreneaux = grouperParCreneau();
  
  // Trier les créneaux par ordre chronologique selon la configuration
  const creneauxTries = parametres.creneauxPersonnalises
    ? parametres.creneauxPersonnalises
        .filter(c => groupesCreneaux[c.id])
        .map(c => ({
          id: c.id,
          ...groupesCreneaux[c.id]
        }))
    : Object.entries(groupesCreneaux).map(([id, data]) => ({ id, ...data }));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Étape 5: Attribution des sous-activités</h2>
        <p className="text-gray-600 mb-4">
          Les sous-activités ont été automatiquement attribuées lors de la génération du dimensionnement à l'étape 4. 
          Vous pouvez les visualiser et les modifier si nécessaire ci-dessous.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <span className="text-sm text-gray-600">Date sélectionnée</span>
            <p className="font-semibold">{dateAffectation}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Volume</span>
            <p className="font-semibold">{volumeAffectation} lignes</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Postes avec sous-activités</span>
            <p className="font-semibold">{postesAvecSousActivites.length} poste(s)</p>
          </div>
        </div>

        {/* Indicateur de statut de sauvegarde */}
        {statutSauvegarde && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            statutSauvegarde === 'saving' ? 'bg-blue-50 text-blue-800' :
            statutSauvegarde === 'saved' ? 'bg-green-50 text-green-800' :
            'bg-red-50 text-red-800'
          }`}>
            {statutSauvegarde === 'saving' && (
              <>
                <div className="w-4 h-4 border-2 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                <span>💾 Sauvegarde en cours...</span>
              </>
            )}
            {statutSauvegarde === 'saved' && (
              <>
                <span className="text-xl">✓</span>
                <span>Sauvegardé automatiquement</span>
              </>
            )}
            {statutSauvegarde === 'error' && (
              <>
                <span className="text-xl">⚠️</span>
                <span>Erreur lors de la sauvegarde. Veuillez réessayer.</span>
              </>
            )}
          </div>
        )}

        {/* Boutons d'action principaux */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={attribuerAutomatiquement}
            className="px-6 py-2 text-white rounded hover:bg-opacity-90 font-medium"
            style={{ backgroundColor: "#007F61" }}
            disabled={postesAvecSousActivites.length === 0}
          >
            🔄 Réattribuer automatiquement
          </button>
          
          <button
            onClick={reinitialiser}
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
            disabled={postesAvecSousActivites.length === 0}
          >
            ✖️ Réinitialiser tout
          </button>
        </div>
      </div>

      {/* Contenu principal - Vue par créneau */}
      {postesAvecSousActivites.length > 0 ? (
        <div className="space-y-4">
          {creneauxTries.map((creneau) => (
                <div key={creneau.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-3">
                      {creneau.postes.length} postes
                    </span>
                    Créneau {creneau.label}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {creneau.postes.map(poste => {
                      const employeId = affectationsPostes[poste.id];
                      const employe = employes.find(e => e.id === employeId);
                      const activitePrincipale = getActivitePrincipale(poste.activite);
                      
                      // Filtrer les sous-activités pour ne garder que celles autorisées pour ce créneau
                      const sousActivitesPossibles = (parametres.sousActivites[activitePrincipale] || [])
                        .filter(sousAct => {
                          const creneauxAutorises = getSousActiviteCreneaux(sousAct);
                          return creneauxAutorises.includes(poste.creneauId);
                        })
                        .map(sousAct => getSousActiviteNom(sousAct));
                      
                      const sousActiviteActuelle = poste.sousActivite || '';
                      
                      // Vérifier si l'employé a la compétence pour cette sous-activité
                      // Une alerte ne doit apparaître QUE si l'héritage est explicitement désactivé (false)
                      // ET que l'employé n'a pas la compétence (niveau 0)
                      const heritageCompetence = parametres.heritageCompetences[sousActiviteActuelle];
                      const niveauCompetenceSousActivite = competences[employeId]?.[sousActiviteActuelle] || 0;
                      const alerteCompetence = sousActiviteActuelle && 
                        heritageCompetence === false && 
                        niveauCompetenceSousActivite === 0;

                      return (
                        <div 
                          key={poste.id} 
                          className={`border-2 rounded-lg p-4 ${alerteCompetence ? 'ring-2 ring-red-500' : ''}`}
                          style={{
                            borderColor: alerteCompetence ? '#DC2626' : (sousActiviteActuelle ? couleursActivites[sousActiviteActuelle] : '#e5e7eb'),
                            backgroundColor: alerteCompetence ? '#FEE2E2' : (sousActiviteActuelle ? `${couleursActivites[sousActiviteActuelle]}20` : 'white')
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-lg">{employe ? employe.nom : 'Non affecté'}</div>
                                {alerteCompetence && (
                                  <span className="text-red-600 text-xl" title="Employé sans compétence pour cette sous-activité">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">{poste.heuresDimensionnees}h</div>
                            </div>
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ backgroundColor: couleursActivites[activitePrincipale] }}
                            >
                              {activitePrincipale}
                            </span>
                          </div>
                          
                          <select
                            className={`w-full p-2 border-2 rounded font-medium text-sm ${
                              alerteCompetence ? 'border-red-600' : ''
                            }`}
                            style={{
                              borderColor: alerteCompetence ? '#DC2626' : (sousActiviteActuelle ? couleursActivites[sousActiviteActuelle] : '#d1d5db'),
                              backgroundColor: alerteCompetence ? '#FEE2E2' : (sousActiviteActuelle ? couleursActivites[sousActiviteActuelle] : 'white')
                            }}
                            value={sousActiviteActuelle}
                            onChange={(e) => handleAttribuerSousActivite(poste.id, e.target.value)}
                          >
                            <option value="">⚪ Non précisé</option>
                            {sousActivitesPossibles.map(sousAct => {
                              const niveauComp = competences[employeId]?.[sousAct] || 0;
                              const heritage = parametres.heritageCompetences[sousAct];
                              return (
                                <option key={sousAct} value={sousAct}>
                                  {sousAct} {heritage === false ? `(Niv.${niveauComp})` : ''}
                                </option>
                              );
                            })}
                          </select>

                          {sousActiviteActuelle && (
                            <div className="mt-2 space-y-1">
                              {parametres.heritageCompetences[sousActiviteActuelle] !== undefined && (
                                <div className="text-xs">
                                  <span className={`px-2 py-1 rounded ${
                                    parametres.heritageCompetences[sousActiviteActuelle] 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-orange-100 text-orange-800'
                                  }`}>
                                    {parametres.heritageCompetences[sousActiviteActuelle] 
                                      ? '✓ Hérite compétences' 
                                      : '✗ Compétences spécifiques'}
                                  </span>
                                </div>
                              )}
                              
                              {alerteCompetence && (
                                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border border-red-300">
                                  ⚠️ Employé SANS compétence requise (Niveau 0)
                                </div>
                              )}
                              
                              {!alerteCompetence && heritageCompetence === false && niveauCompetenceSousActivite > 0 && (
                                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ✓ Compétence niveau {niveauCompetenceSousActivite}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">ℹ️</span>
            <h3 className="font-bold text-blue-800">Aucun poste nécessitant une sous-activité</h3>
          </div>
          <p className="text-blue-700">
            La planification actuelle ne contient pas de postes avec des activités disposant de sous-activités configurées.
            Vous pouvez configurer des sous-activités à l'Étape 0 (Paramétrages).
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('affectation-auto')}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Retour à l'Étape 4
          </button>

          <button
            onClick={() => setActiveTab('planning-final')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            → Continuer vers l'Étape 6 (Planning final)
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          💡 <strong>Note :</strong> Vos modifications sont sauvegardées automatiquement. Vous n'avez plus besoin de cliquer sur un bouton de sauvegarde.
        </div>
      </div>

      {/* Note informative */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">✅ Attribution automatique effectuée</h4>
        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
          <li><strong>Attribution automatique :</strong> Les sous-activités ont été réparties équitablement lors de la génération à l'étape 4</li>
          <li><strong>Modification manuelle :</strong> Utilisez les dropdowns pour modifier l'attribution si nécessaire</li>
          <li><strong>Réattribution :</strong> Le bouton "Réattribuer automatiquement" permet de redistribuer équitablement</li>
          <li><strong>Vue par créneau :</strong> Les affectations sont organisées par plage horaire pour plus de clarté</li>
          <li><strong>Héritage :</strong> Les sous-activités avec ✓ utilisent les compétences de l'activité principale</li>
          <li><strong>💾 Sauvegarde automatique :</strong> Vos modifications sont sauvegardées automatiquement</li>
        </ul>
      </div>
    </div>
  );
};

export default SousActivitesTab;
