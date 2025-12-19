import React, { useMemo, useEffect, useRef, useCallback } from 'react';

const AffectationAutoTab = ({
  dateAffectation,
  setDateAffectation,
  volumeAffectation,
  setVolumeAffectation,
  datesDispo,
  previsionsProcessed,
  dimensionnementGenere,
  setDimensionnementGenere,
  affectationsPostes,
  setAffectationsPostes,
  activitesPersonnalisees,
  setActivitesPersonnalisees,
  employes,
  competences,
  disponibilites,
  parametres,
  couleursActivites,
  obtenirCouleurActivite,
  genererAffectationComplete,
  calculerEcarts,
  analyserDisponibilites,
  obtenirEmployesDisponibles,
  modifierAffectation,
  nouvelleActivite,
  setNouvelleActivite,
  ajouterActivitePersonnalisee,
  supprimerActivitePersonnalisee,
  sauvegarderPlanification,
  planifications,
  setPlanifications
}) => {
  const [statutSauvegarde, setStatutSauvegarde] = React.useState(''); // '', 'saving', 'saved', 'error'
  const [modeAleatoire, setModeAleatoire] = React.useState(false);
  const timeoutSauvegardeRef = useRef(null);

  // Fonction de sauvegarde automatique avec debounce
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

  // Sauvegarder automatiquement après la génération du dimensionnement
  useEffect(() => {
    if (dimensionnementGenere && dateAffectation && Object.keys(affectationsPostes).length > 0) {
      // Sauvegarder immédiatement après la génération (sans debounce)
      sauvegarderAutomatiquement();
    }
  }, [dimensionnementGenere?.postesGeneres?.length, dateAffectation]); // Déclenché uniquement lors de la génération initiale

  // Sauvegarder automatiquement lors des modifications d'affectations (avec debounce)
  useEffect(() => {
    if (dimensionnementGenere && dateAffectation && Object.keys(affectationsPostes).length > 0) {
      debouncedSauvegarde();
    }

    return () => {
      if (timeoutSauvegardeRef.current) {
        clearTimeout(timeoutSauvegardeRef.current);
      }
    };
  }, [affectationsPostes, activitesPersonnalisees, debouncedSauvegarde]);

  const handleGenererDimensionnement = () => {
    if (!dateAffectation || !volumeAffectation) {
      alert('Veuillez sélectionner une date et saisir un volume');
      return;
    }

    const dimensionnement = genererAffectationComplete(volumeAffectation, dateAffectation, modeAleatoire);
    setDimensionnementGenere(dimensionnement);
    
    const affectationsAuto = {};
    if (dimensionnement && dimensionnement.postesGeneres) {
      dimensionnement.postesGeneres.forEach(poste => {
        if (poste.employeAffecte) {
          affectationsAuto[poste.id] = poste.employeAffecte;
        }
      });
    }
    setAffectationsPostes(affectationsAuto);
  };

  // Pré-remplir automatiquement le volume avec les prévisions quand la date change
  useEffect(() => {
    if (dateAffectation && previsionsProcessed && previsionsProcessed.length > 0) {
      const previsionPourDate = previsionsProcessed.find(p => p.date === dateAffectation);
      if (previsionPourDate && previsionPourDate.volume) {
        setVolumeAffectation(previsionPourDate.volume);
      }
    }
  }, [dateAffectation, previsionsProcessed, setVolumeAffectation]);

  // Optimisation: recalcul automatique des écarts quand les affectations changent
  const ecarts = useMemo(() => {
    return calculerEcarts(dimensionnementGenere, affectationsPostes);
  }, [dimensionnementGenere, affectationsPostes, calculerEcarts]);

  // Optimisation: recalcul automatique de l'analyse quand date ou dimensionnement change
  const analyseDispos = useMemo(() => {
    return analyserDisponibilites(dateAffectation, dimensionnementGenere);
  }, [dateAffectation, dimensionnementGenere, analyserDisponibilites]);

  return (
    <div className="space-y-6">
      {/* Section 1: Sélection date et volume */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Étape 4: Affectation automatique</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date sélectionnée</label>
            <select 
              className="w-full p-2 border rounded"
              value={dateAffectation}
              onChange={(e) => {
                setDateAffectation(e.target.value);
                setDimensionnementGenere(null);
                setAffectationsPostes({});
              }}
            >
              <option value="">Sélectionnez une date...</option>
              {datesDispo.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Volume journalier (lignes)</label>
            <input 
              type="number"
              className="w-full p-2 border rounded"
              value={volumeAffectation}
              onChange={(e) => setVolumeAffectation(parseInt(e.target.value) || 0)}
              placeholder="Ex: 1000"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <input 
                type="checkbox"
                id="modeAleatoire"
                checked={modeAleatoire}
                onChange={(e) => setModeAleatoire(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="modeAleatoire" className="text-sm cursor-pointer flex items-center gap-1">
                <span>🎲</span>
                <span>Affectation aléatoire</span>
              </label>
            </div>
            <button 
              className="w-full px-4 py-2 text-white rounded hover:bg-opacity-90"
              style={{ backgroundColor: "#007F61" }}
              onClick={handleGenererDimensionnement}
              disabled={!dateAffectation || !volumeAffectation}
            >
              Générer dimensionnement
            </button>
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
      </div>

      {/* Section 2: Analyse des disponibilités */}
      {dimensionnementGenere && dateAffectation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Analyse des disponibilités</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">{analyseDispos.employesDisponibles}</div>
              <div className="text-sm text-blue-800">Employés disponibles</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">{analyseDispos.employesNecessaires}</div>
              <div className="text-sm text-purple-800">Employés nécessaires</div>
              <div className="text-xs text-purple-600 mt-1">
                ({analyseDispos.totalHeures?.toFixed(1)}h ÷ {analyseDispos.heuresMoyennes?.toFixed(1)}h/emp)
              </div>
            </div>
            <div className={`p-4 rounded ${analyseDispos.surplus > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${analyseDispos.surplus > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {analyseDispos.surplus}
              </div>
              <div className={`text-sm ${analyseDispos.surplus > 0 ? 'text-green-800' : 'text-gray-800'}`}>
                Surplus personnel
              </div>
            </div>
            <div className={`p-4 rounded ${analyseDispos.deficit > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className={`text-2xl font-bold ${analyseDispos.deficit > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {analyseDispos.deficit}
              </div>
              <div className={`text-sm ${analyseDispos.deficit > 0 ? 'text-red-800' : 'text-gray-800'}`}>
                Déficit personnel
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(analyseDispos.details).map(([type, data]) => (
              <div key={type} className="border rounded p-3">
                <div className="font-medium mb-2">
                  {type === 'matin' ? 'M TÔT' : 
                   type === 'apresMidi' ? 'M TARD' : 
                   type === 'miTempsMatin' ? '1/2 M TÔT' : '1/2 M TARD'}
                </div>
                <div className="text-lg font-bold">{data.nombre}</div>
                <div className="text-xs text-gray-600">
                  {data.employes.slice(0, 3).join(', ')}
                  {data.employes.length > 3 && ` +${data.employes.length - 3}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Tableau d'affectation matriciel */}
      {dimensionnementGenere && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Affectation des postes - Vue matricielle</h3>
            <p className="text-sm text-gray-600 mt-1">
              Les employés sont déjà affectés automatiquement. Vous pouvez modifier manuellement les affectations ci-dessous.
            </p>
          </div>

          {/* Résumé des heures par activité */}
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h4 className="font-medium mb-3">Résumé des heures par activité (journée complète)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(ecarts).map(([activite, data]) => (
                <div key={activite} className="text-center p-2 rounded" style={{backgroundColor: couleursActivites[activite]}}>
                  <div className="font-medium text-sm">{activite}</div>
                  <div className="text-xs">
                    <div>Nécessaire: {data.necessaire.toFixed(1)}h</div>
                    <div>Dimensionné: {data.dimensionne.toFixed(1)}h</div>
                    <div className={`font-medium ${
                      data.ecart > 0 ? 'text-green-700' : data.ecart < 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      Écart: {data.ecart > 0 ? '+' : ''}{data.ecart.toFixed(1)}h
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border font-medium">Employé</th>
                  <th className="px-3 py-2 border font-medium">Disponibilité</th>
                  {(parametres.creneauxPersonnalises || []).map(creneau => (
                    <th key={creneau.id} className="px-3 py-2 border text-center font-medium min-w-32">
                      <div className="text-sm">{creneau.label}</div>
                      <div className="text-xs text-gray-600">({creneau.duree}h)</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const employesDisponibles = obtenirEmployesDisponibles(dateAffectation);
                  
                  return employesDisponibles
                    .sort((a, b) => {
                      const dispoA = disponibilites[a.id]?.[dateAffectation];
                      const dispoB = disponibilites[b.id]?.[dateAffectation];
                      
                      const ordreDisponibilite = {
                        'matin': 1,
                        'miTempsMatin': 2,
                        'apresMidi': 3,
                        'miTempsApresMidi': 4
                      };
                      
                      const prioriteA = ordreDisponibilite[dispoA] || 999;
                      const prioriteB = ordreDisponibilite[dispoB] || 999;
                      
                      if (prioriteA === prioriteB) {
                        return a.nom.localeCompare(b.nom);
                      }
                      
                      return prioriteA - prioriteB;
                    })
                    .map((employe, employeIndex) => {
                      const dispo = disponibilites[employe.id]?.[dateAffectation];

                      return (
                        <tr key={employe.id} className={employeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 border font-medium">
                            {employe.nom}
                          </td>
                          <td className="px-3 py-2 border text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              dispo === 'matin' ? 'bg-green-100 text-green-800' :
                              dispo === 'apresMidi' ? 'bg-blue-100 text-blue-800' :
                              dispo === 'miTempsMatin' ? 'bg-green-50 text-green-700' :
                              dispo === 'miTempsApresMidi' ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {dispo === 'matin' ? 'M TÔT' :
                               dispo === 'apresMidi' ? 'M TARD' :
                               dispo === 'miTempsMatin' ? '1/2 M TÔT' :
                               dispo === 'miTempsApresMidi' ? '1/2 M TARD' : 'Autre'}
                            </span>
                          </td>
                          {(parametres.creneauxPersonnalises || []).map(creneau => {
                            const peutTravailler = (() => {
                              if (dispo === 'miTempsMatin' && !['creneau1', 'creneau2'].includes(creneau.id)) {
                                return false;
                              }
                              if (dispo === 'miTempsApresMidi' && !['creneau5', 'creneau6'].includes(creneau.id)) {
                                return false;
                              }
                              if (dispo === 'matin' && creneau.equipe === 'apresMidi') {
                                return false;
                              }
                              if (dispo === 'apresMidi' && creneau.equipe === 'matin') {
                                return false;
                              }
                              return true;
                            })();

                            const affectationActuelle = Object.entries(affectationsPostes).find(([posteId, employeId]) => {
                              if (employeId !== employe.id) return false;
                              const poste = dimensionnementGenere.postesGeneres.find(p => p.id === posteId);
                              return poste && poste.creneauId === creneau.id;
                            });

                            const posteActuel = affectationActuelle ? 
                              dimensionnementGenere.postesGeneres.find(p => p.id === affectationActuelle[0]) : 
                              null;

                            const activiteActuelle = posteActuel?.activite || null;
                            const estAlerteNonCompetent = posteActuel?.alerte || false;

                            // Construction de la liste des activités possibles pour ce créneau
                            const activitesRecurrentesCreneau = (parametres.activitesRecurrentes || [])
                              .filter(actRec => actRec.creneaux.some(c => c.creneauId === creneau.id && c.nombrePersonnes > 0))
                              .map(actRec => actRec.nom);

                            const activitesPossibles = [
                              ...creneau.activitesAutorisees,
                              ...activitesPersonnalisees,
                              ...activitesRecurrentesCreneau
                            ].filter(activite => {
                              // Les activités personnalisées et récurrentes sont toujours disponibles
                              if (activitesPersonnalisees.includes(activite) || activitesRecurrentesCreneau.includes(activite)) {
                                return true;
                              }
                              const niveauCompetence = competences[employe.id]?.[activite] || 0;
                              return niveauCompetence > 0;
                            });

                            return (
                              <td key={creneau.id} className={`px-2 py-2 border text-center ${
                                !peutTravailler ? 'bg-gray-200' : ''
                              }`}>
                                {peutTravailler ? (
                                  <select
                                    className={`w-full p-1 text-xs border rounded ${
                                      activiteActuelle ? 'font-medium' : ''
                                    } ${estAlerteNonCompetent ? 'border-2 border-red-600' : ''}`}
                                    style={{
                                      backgroundColor: estAlerteNonCompetent ? '#FEE2E2' : (activiteActuelle ? obtenirCouleurActivite(activiteActuelle) : 'white'),
                                      color: estAlerteNonCompetent ? '#991B1B' : 'inherit'
                                    }}
                                    value={activiteActuelle || ''}
                                    onChange={(e) => {
                                      if (affectationActuelle) {
                                        modifierAffectation(affectationActuelle[0], null);
                                      }
                                      
                                      if (e.target.value) {
                                        const posteDisponible = dimensionnementGenere.postesGeneres.find(p => 
                                          p.activite === e.target.value && 
                                          p.creneauId === creneau.id && 
                                          !affectationsPostes[p.id]
                                        );
                                        
                                        if (posteDisponible) {
                                          modifierAffectation(posteDisponible.id, employe.id);
                                        } else {
                                          const nouveauPosteExtra = {
                                            id: `poste_extra_${Date.now()}_${employe.id}_${creneau.id}`,
                                            activite: e.target.value,
                                            creneauId: creneau.id,
                                            creneauLabel: creneau.label,
                                            equipe: creneau.equipe,
                                            heuresDimensionnees: creneau.duree,
                                            employeAffecte: null,
                                            exclusif: e.target.value === 'EO',
                                            extra: true
                                          };

                                          setDimensionnementGenere(prev => ({
                                            ...prev,
                                            postesGeneres: [...prev.postesGeneres, nouveauPosteExtra]
                                          }));

                                          modifierAffectation(nouveauPosteExtra.id, employe.id);
                                        }
                                      }
                                    }}
                                  >
                                    <option value="">-</option>
                                    {activitesPossibles.map(activite => (
                                      <option key={activite} value={activite}>
                                        {activite} (Niv.{competences[employe.id]?.[activite] || 0})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-xs text-gray-500">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    });
                })()}
              </tbody>
            </table>
          </div>

          {/* Légende */}
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <h5 className="font-medium mb-2">Légende :</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div><span className="bg-green-100 text-green-800 px-1 rounded">M TÔT</span> = Matin complet</div>
              <div><span className="bg-blue-100 text-blue-800 px-1 rounded">M TARD</span> = Après-midi complet</div>
              <div><span className="bg-green-50 text-green-700 px-1 rounded">1/2 M TÔT</span> = Demi-journée matin</div>
              <div><span className="bg-blue-50 text-blue-700 px-1 rounded">1/2 M TARD</span> = Demi-journée après-midi</div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-xs">
              <h6 className="font-semibold mb-2 text-blue-900">📋 Logique d'attribution automatique :</h6>
              <div className="space-y-1 text-blue-800">
                <div><strong>1. EO :</strong> Attribution jusqu'à delta positif minimal, employés exclusifs toute la journée</div>
                <div><strong>2. Picking Frigo/Trad/Contrôle :</strong> Même nombre de personnes sur chaque créneau (formule X fixe)</div>
                <div><strong>3. Rempl. Automate/Rangement :</strong> Remplissage équilibré tour par tour (1 personne par créneau, puis recommencer)</div>
                <div className="mt-2 pt-2 border-t border-blue-300">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">⚠️ Rouge</span> = Employé non compétent affecté par manque de personnel
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              • Les cellules grisées indiquent une incompatibilité avec la disponibilité de l'employé<br/>
              • Les couleurs de fond correspondent aux activités affectées<br/>
              • 💾 Les modifications sont sauvegardées automatiquement
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Activités personnalisées */}
      {dimensionnementGenere && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Activités personnalisées</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Ajouter une activité personnalisée pour cette journée
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={nouvelleActivite}
                onChange={(e) => setNouvelleActivite(e.target.value)}
                placeholder="Ex: FORMATION, INVENTAIRE, RÉUNION"
                className="flex-1 p-2 border rounded"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    ajouterActivitePersonnalisee();
                  }
                }}
              />
              <button 
                className="px-4 py-2 text-white rounded hover:bg-opacity-90"
                style={{ backgroundColor: "#007F61" }}
                onClick={ajouterActivitePersonnalisee}
              >
                + Ajouter
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ces activités seront disponibles dans tous les selects de la matrice ci-dessus
            </p>
          </div>
          
          {activitesPersonnalisees.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm mb-2">Activités personnalisées ajoutées :</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {activitesPersonnalisees.map(act => (
                  <div key={act} className="flex items-center justify-between bg-gray-100 p-3 rounded border">
                    <span className="font-medium">{act}</span>
                    <button 
                      onClick={() => supprimerActivitePersonnalisee(act)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 5: Actions */}
      {dimensionnementGenere && dateAffectation && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          
          <div className="flex gap-4">
            <button 
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => {
                setDimensionnementGenere(null);
                setAffectationsPostes({});
                setDateAffectation('');
                setVolumeAffectation(0);
                setActivitesPersonnalisees([]);
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
            💡 <strong>Note :</strong> Vos modifications sont sauvegardées automatiquement. Vous n'avez plus besoin de cliquer sur un bouton de sauvegarde.
          </div>
        </div>
      )}
    </div>
  );
};

export default AffectationAutoTab;
