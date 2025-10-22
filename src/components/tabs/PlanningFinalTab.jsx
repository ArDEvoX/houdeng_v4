import React from 'react';

const PlanningFinalTab = ({
  dimensionnementGenere,
  dateAffectation,
  volumeAffectation,
  affectationsPostes,
  employes,
  disponibilites,
  parametres,
  couleursActivites,
  setActiveTab
}) => {
  // Helper pour obtenir le nom d'une sous-activité (compatibilité ancien/nouveau format)
  const getSousActiviteNom = (sousActivite) => {
    if (!sousActivite) return null;
    return typeof sousActivite === 'string' ? sousActivite : sousActivite.nom;
  };

  // Vérifier qu'une planification existe
  if (!dimensionnementGenere || !dateAffectation) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-3">⚠️</span>
          <h3 className="font-bold text-lg">Aucune planification active</h3>
        </div>
        <p className="mb-4">
          Vous devez d'abord générer une planification à l'Étape 4 avant de consulter le planning final.
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

  // Obtenir les employés disponibles
  const employesDisponibles = employes.filter(employe => {
    const dispo = disponibilites[employe.id]?.[dateAffectation];
    return dispo && dispo !== 'non';
  }).sort((a, b) => {
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
    if (prioriteA === prioriteB) return a.nom.localeCompare(b.nom);
    return prioriteA - prioriteB;
  });

  const creneauxHoraires = parametres.creneauxPersonnalises || [];

  // Calculer le total d'heures par employé
  const calculerTotalHeures = (employeId) => {
    let total = 0;
    Object.entries(affectationsPostes).forEach(([posteId, empId]) => {
      if (empId === employeId) {
        const poste = dimensionnementGenere.postesGeneres.find(p => p.id === posteId);
        if (poste) {
          total += poste.heuresDimensionnees || 0;
        }
      }
    });
    return total;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-t-4" style={{ borderColor: "#007F61" }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#007F61" }}>
              📋 Planning final du {dateAffectation}
            </h2>
            <p className="text-gray-600">
              Volume prévu : <span className="font-semibold">{volumeAffectation} lignes</span>
              {' • '}
              Équipe : <span className="font-semibold">{employesDisponibles.length} personnes</span>
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-md"
          >
            🖨️ Imprimer ce planning
          </button>
        </div>
      </div>

      {/* Tableau principal */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-gradient-to-r from-green-700 to-green-600 text-white">
                <th className="border-2 border-gray-400 px-2 py-2 text-left font-bold" style={{ minWidth: '120px' }}>
                  Employé
                </th>
                <th className="border-2 border-gray-400 px-2 py-2 text-center font-bold" style={{ minWidth: '80px' }}>
                  Dispo
                </th>
                {creneauxHoraires.map(creneau => (
                  <th key={creneau.id} className="border-2 border-gray-400 px-2 py-2 text-center font-bold" style={{ minWidth: '100px' }}>
                    <div className="font-bold text-xs">{creneau.label}</div>
                    <div className="text-xs font-normal opacity-90">({creneau.duree}h)</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employesDisponibles.map((employe, index) => {
                const dispo = disponibilites[employe.id]?.[dateAffectation];
                const totalHeures = calculerTotalHeures(employe.id);
                const isEOAffecte = Object.values(affectationsPostes).includes(employe.id) && 
                  dimensionnementGenere.postesGeneres.some(p => 
                    affectationsPostes[p.id] === employe.id && p.exclusif
                  );

                return (
                  <tr key={employe.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {/* Colonne Employé */}
                    <td className="border-2 border-gray-300 px-2 py-2">
                      <div className="font-bold text-xs">{employe.nom}</div>
                      {isEOAffecte && (
                        <div className="text-xs mt-1 bg-red-100 text-red-800 px-1 py-0.5 rounded inline-block">
                          EO
                        </div>
                      )}
                    </td>

                    {/* Colonne Disponibilité */}
                    <td className="border-2 border-gray-300 px-2 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                        dispo === 'matin' ? 'bg-green-200 text-green-900' :
                        dispo === 'apresMidi' ? 'bg-blue-200 text-blue-900' :
                        dispo === 'miTempsMatin' ? 'bg-green-100 text-green-800' :
                        dispo === 'miTempsApresMidi' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {dispo === 'matin' ? 'M TÔT' :
                         dispo === 'apresMidi' ? 'M TARD' :
                         dispo === 'miTempsMatin' ? '1/2 M TÔT' :
                         dispo === 'miTempsApresMidi' ? '1/2 M TARD' : 'Autre'}
                      </span>
                    </td>

                    {/* Colonnes Créneaux */}
                    {creneauxHoraires.map(creneau => {
                      const affectation = Object.entries(affectationsPostes).find(([posteId, empId]) => {
                        if (empId !== employe.id) return false;
                        const poste = dimensionnementGenere.postesGeneres.find(p => p.id === posteId);
                        return poste && poste.creneauId === creneau.id;
                      });

                      const poste = affectation ? 
                        dimensionnementGenere.postesGeneres.find(p => p.id === affectation[0]) : 
                        null;

                      const activite = poste?.activite || null;
                      const sousActivite = poste?.sousActivite ? getSousActiviteNom(poste.sousActivite) : null;
                      const affichage = sousActivite || activite;
                      const heures = poste?.heuresDimensionnees || 0;

                      // Vérifier si l'employé peut travailler ce créneau
                      const peutTravailler = (() => {
                        if (isEOAffecte) return activite === 'EO';
                        if (dispo === 'miTempsMatin' && !['creneau1', 'creneau2'].includes(creneau.id)) return false;
                        if (dispo === 'miTempsApresMidi' && !['creneau5', 'creneau6'].includes(creneau.id)) return false;
                        if (dispo === 'matin' && creneau.equipe === 'apresMidi') return false;
                        if (dispo === 'apresMidi' && creneau.equipe === 'matin') return false;
                        return true;
                      })();

                      if (!peutTravailler) {
                        return (
                          <td key={creneau.id} className="border-2 border-gray-300 px-2 py-2 bg-gray-200 text-center">
                            <span className="text-gray-400 text-xs">-</span>
                          </td>
                        );
                      }

                      if (affichage) {
                        return (
                          <td 
                            key={creneau.id} 
                            className="border-2 border-gray-300 px-2 py-2 text-center"
                            style={{ backgroundColor: couleursActivites[affichage] || couleursActivites[activite] }}
                          >
                            <div className="font-bold text-xs">{affichage}</div>
                          </td>
                        );
                      }

                      return (
                        <td key={creneau.id} className="border-2 border-gray-300 px-2 py-2 text-center">
                          <span className="text-gray-400 text-xs">-</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h4 className="font-bold mb-3 text-base">📖 Légende des disponibilités :</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-green-200 text-green-900 px-3 py-1 rounded-lg font-semibold">M TÔT</span>
              <span>Matin complet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-lg font-semibold">M TARD</span>
              <span>Après-midi complet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">1/2 M TÔT</span>
              <span>Demi-journée matin</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">1/2 M TARD</span>
              <span>Demi-journée après-midi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Navigation</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('sous-activites')}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Retour à l'Étape 5 (Sous-activités)
          </button>
          
          <button
            onClick={() => setActiveTab('revue')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            → Continuer vers l'Étape 7 (Revue)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanningFinalTab;
