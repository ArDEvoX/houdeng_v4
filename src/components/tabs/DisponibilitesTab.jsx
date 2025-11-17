import React, { useRef, useEffect } from 'react';

const DisponibilitesTab = ({
  employes,
  datesDispo,
  disponibilites,
  updateDisponibilite,
  disponibilitesTexte,
  setDisponibilitesTexte,
  traiterDisponibilites
}) => {
  const scrollbarTopRef = useRef(null);
  const tableWrapperRef = useRef(null);

  // Synchroniser les scrollbars
  useEffect(() => {
    const scrollbarTop = scrollbarTopRef.current;
    const tableWrapper = tableWrapperRef.current;

    if (!scrollbarTop || !tableWrapper) return;

    const handleScrollbarTop = () => {
      tableWrapper.scrollLeft = scrollbarTop.scrollLeft;
    };

    const handleTableWrapper = () => {
      scrollbarTop.scrollLeft = tableWrapper.scrollLeft;
    };

    scrollbarTop.addEventListener('scroll', handleScrollbarTop);
    tableWrapper.addEventListener('scroll', handleTableWrapper);

    return () => {
      scrollbarTop.removeEventListener('scroll', handleScrollbarTop);
      tableWrapper.removeEventListener('scroll', handleTableWrapper);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Disponibilités des employés</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Copiez-collez le tableau des disponibilités (format : nom_employe tab dispo1 tab dispo2...)
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Utilisez 'M TÔT' pour matin, 'M TARD' pour après-midi, vide ou autre valeur pour non disponible
          </div>
          <textarea 
            className="w-full h-40 p-2 border rounded font-mono"
            value={disponibilitesTexte}
            onChange={(e) => setDisponibilitesTexte(e.target.value)}
            placeholder="Date	01/03/2025	02/03/2025	03/03/2025&#10;Employé 1	M TÔT	M TARD	M TÔT&#10;Employé 2	M TARD	M TÔT	"
          />
          <button 
            className="px-4 py-2 text-white rounded hover:bg-opacity-90"
            style={{ backgroundColor: "#007F61" }}
            onClick={traiterDisponibilites}
          >
            Traiter les disponibilités
          </button>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">Tableau des disponibilités:</h3>
          
          {/* Scrollbar supérieure sticky */}
          <div 
            ref={scrollbarTopRef}
            className="disponibilites-scrollbar-top"
            style={{ 
              overflowX: 'auto',
              overflowY: 'hidden',
              position: 'sticky',
              top: 0,
              zIndex: 20,
              backgroundColor: 'white',
              borderBottom: '2px solid #d1d5db',
              marginBottom: '0.5rem'
            }}
          >
            <div style={{ 
              height: '1px',
              width: `${Math.max(150 + datesDispo.length * 150, 800)}px`
            }} />
          </div>

          {/* Wrapper du tableau avec scrollbar */}
          <div 
            ref={tableWrapperRef}
            className="disponibilites-table-wrapper"
            style={{ 
              overflowX: 'auto',
              maxHeight: '600px',
              position: 'relative'
            }}
          >
            <table className="disponibilites-table min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border sticky-col-dispo">Employé</th>
                  {datesDispo.map(date => (
                    <th key={date} className="px-4 py-2 border">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employes.map((employe, employeIndex) => (
                  <tr key={employe.id} className={employeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border font-medium sticky-col-dispo">{employe.nom}</td>
                    {datesDispo.map(date => {
                      const dispo = disponibilites[employe.id]?.[date] || 'non';
                      
                      return (
                        <td key={date} className="px-4 py-2 border text-center">
                          <select
                            className={`p-1 border rounded ${
                              dispo === 'matin' ? 'bg-green-200' : 
                              dispo === 'apresMidi' ? 'bg-blue-200' : 
                              dispo === 'miTempsMatin' ? 'bg-green-100' :
                              dispo === 'miTempsApresMidi' ? 'bg-blue-100' :
                              'bg-gray-200'
                            }`}
                            value={dispo}
                            onChange={(e) => updateDisponibilite(employe.id, date, e.target.value)}
                          >
                            <option value="non">Non dispo</option>
                            <option value="matin">M TÔT</option>
                            <option value="apresMidi">M TARD</option>
                            <option value="miTempsMatin">1/2 M TÔT</option>
                            <option value="miTempsApresMidi">1/2 M TARD</option>
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
      </div>
    </div>
  );
};

export default DisponibilitesTab;
