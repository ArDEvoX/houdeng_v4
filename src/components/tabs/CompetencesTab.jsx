import React, { useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompetencesTab = ({
  employes,
  competences,
  updateCompetence,
  supprimerEmploye,
  nouvelEmployeNom,
  setNouvelEmployeNom,
  ajouterEmploye,
  donneesGraphiqueCompetences,
  activites,
  couleursActivites,
  parametres
}) => {

  // Construire la liste des activités principales à partir des sous-activités (mémorisé)
  const competencesActivites = useMemo(() => {
    return Object.keys(parametres.sousActivites || {});
  }, [parametres.sousActivites]);

  // Mémoriser les colonnes de compétences pour éviter les recalculs
  const colonnesCompetences = useMemo(() => {
    const colonnes = [];
    
    competencesActivites.forEach(activite => {
      // Ajouter l'activité principale
      colonnes.push({
        nom: activite,
        estSousActivite: false,
        activiteParente: null
      });
      
      // Ajouter les sous-activités sans héritage pour cette activité
      const sousActivites = parametres.sousActivites[activite] || [];
      sousActivites.forEach(sousAct => {
        if (parametres.heritageCompetences[sousAct] === false) {
          colonnes.push({
            nom: sousAct,
            estSousActivite: true,
            activiteParente: activite
          });
        }
      });
    });
    
    return colonnes;
  }, [competencesActivites, parametres.sousActivites, parametres.heritageCompetences]);

  // Mémoriser le tri des employés
  const employesTries = useMemo(() => {
    return [...employes].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [employes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Matrice de compétences</h2>
        
        {/* Note explicative */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="text-blue-800">
            <strong>💡 Note :</strong> Les sous-activités sans héritage de compétences apparaissent comme colonnes séparées.
            Vous devez évaluer les compétences spécifiques pour ces sous-activités.
          </p>
        </div>
        
        <div className="competences-table-wrapper">
          <div className="competences-table-scroll">
            <table className="competences-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Employé</th>
                  {colonnesCompetences.map((colonne, colIndex) => (
                    <th 
                      key={`col-${colIndex}-${colonne.nom}`}
                      className="px-4 py-2"
                      style={{
                        backgroundColor: couleursActivites[colonne.nom] || couleursActivites[colonne.activiteParente],
                        borderLeft: colonne.estSousActivite ? '2px solid #999' : 'none'
                      }}
                    >
                      <div className="text-center">
                        {colonne.nom}
                        {colonne.estSousActivite && (
                          <div className="text-xs text-gray-600 mt-1">
                            (spécifique)
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employesTries.map((employe, employeIndex) => (
                  <tr key={employe.id}>
                    <td>
                      <button 
                        className="text-sm px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => supprimerEmploye(employe.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                    <td className="font-medium">{employe.nom}</td>
                    {colonnesCompetences.map((colonne, colIndex) => {
                      const niveau = competences[employe.id]?.[colonne.nom] || 0;
                      const classeNiveau = `competence-niveau-${niveau}`;
                      
                      return (
                        <td 
                          key={`cell-${employe.id}-${colIndex}-${colonne.nom}`}
                          className="px-4 py-2 text-center"
                          style={{
                            borderLeft: colonne.estSousActivite ? '2px solid #999' : 'none'
                          }}
                        >
                          <select
                            value={niveau}
                            onChange={(e) => {
                              updateCompetence(employe.id, colonne.nom, parseInt(e.target.value));
                            }}
                            className={`w-full p-1 border rounded text-center ${classeNiveau}`}
                          >
                            <option value={0}>0 - Aucune</option>
                            <option value={1}>1 - Base</option>
                            <option value={2}>2 - Inter.</option>
                            <option value={3}>3 - Expert</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">Ajouter un employé</label>
          <div className="flex gap-2 mt-2">
            <input 
              className="flex-1 p-2 border rounded"
              placeholder="Nom de l'employé"
              value={nouvelEmployeNom}
              onChange={(e) => setNouvelEmployeNom(e.target.value)}
            />
            <button 
              className="px-4 py-2 text-white rounded hover:bg-opacity-90"
              style={{ backgroundColor: "#007F61" }}
              onClick={ajouterEmploye}
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Analyse des compétences</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={donneesGraphiqueCompetences}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activite" />
              <YAxis orientation="left" stroke="#8884d8" domain={[0, employes.length]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="nombreEmployes" name="Nombre d'employés" fill="#8884d8">
                {donneesGraphiqueCompetences.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(couleursActivites)[index % activites.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompetencesTab;
