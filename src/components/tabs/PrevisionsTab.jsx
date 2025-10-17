import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PrevisionsTab = ({
  previsions,
  setPrevisions,
  previsionsProcessed,
  traiterPrevisions,
  donneesGraphiquePrevisions
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Étape 1: Entrée des prévisions</h2>
      
      <p className="text-gray-600 mb-4">
        Importez les prévisions de volume pour les prochains jours. Ces données seront utilisées 
        pour dimensionner les besoins en personnel et générer les plannings.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Copiez-collez vos prévisions (format: date [TAB] volume)
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Format attendu : 01/03/2025 [TAB] 1000 (une prévision par ligne)
          </div>
          <textarea 
            className="w-full h-40 p-2 border rounded font-mono"
            value={previsions}
            onChange={(e) => setPrevisions(e.target.value)}
            placeholder="01/03/2025	1000&#10;02/03/2025	1200&#10;03/03/2025	950"
          />
          <button 
            className="mt-2 px-4 py-2 text-white rounded hover:bg-opacity-90"
            style={{ backgroundColor: "#007F61" }}
            onClick={traiterPrevisions}
          >
            Traiter les prévisions
          </button>
        </div>
        
        {previsionsProcessed.length > 0 && (() => {
          // Filtrer et trier les prévisions
          const aujourdhui = new Date();
          aujourdhui.setHours(0, 0, 0, 0);
          
          const previsionsFiltrees = previsionsProcessed
            .filter(prev => {
              // Convertir la date au format DD/MM/YYYY en objet Date
              const [jour, mois, annee] = prev.date.split('/').map(Number);
              const datePrev = new Date(annee, mois - 1, jour);
              datePrev.setHours(0, 0, 0, 0);
              
              // Ne garder que les dates strictement supérieures à aujourd'hui
              return datePrev > aujourdhui;
            })
            .sort((a, b) => {
              // Trier par ordre chronologique
              const [jourA, moisA, anneeA] = a.date.split('/').map(Number);
              const [jourB, moisB, anneeB] = b.date.split('/').map(Number);
              
              const dateA = new Date(anneeA, moisA - 1, jourA);
              const dateB = new Date(anneeB, moisB - 1, jourB);
              
              return dateA - dateB;
            });
          
          return (
            <div className="mt-6">
              <h3 className="font-medium mb-4 text-lg">
                Prévisions futures ({previsionsFiltrees.length} jour{previsionsFiltrees.length > 1 ? 's' : ''})
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tableau des prévisions */}
                <div>
                  <div className="max-h-96 overflow-y-auto border rounded">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 border text-left">Date</th>
                          <th className="px-4 py-2 border text-right">Volume (lignes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previsionsFiltrees.map((prev, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 border">{prev.date}</td>
                            <td className="px-4 py-2 border text-right font-medium">{prev.volume}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              
              {/* Graphique */}
              <div>
                <h4 className="font-medium mb-2">Évolution du volume sur 30 jours</h4>
                <div className="h-96 border rounded p-4 bg-gray-50">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={donneesGraphiquePrevisions}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="#007F61" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        name="Volume (lignes)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          );
        })()}
        
        {previsionsProcessed.length === 0 && (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">⚠️</span>
              <h3 className="font-bold text-yellow-800">Aucune prévision importée</h3>
            </div>
            <p className="text-yellow-700">
              Veuillez importer des prévisions pour pouvoir continuer avec la planification.
              Les prévisions sont nécessaires pour calculer les besoins en personnel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrevisionsTab;
