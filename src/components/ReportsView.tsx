import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Trophy, Calendar, Target } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { getFilteredHistory } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredHistory = getFilteredHistory(searchTerm);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Completo' : 'Incompleto';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Relatórios de Partidas
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o histórico de todas as partidas jogadas
        </p>
      </div>

      {/* Search Filter */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 backdrop-blur-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Histórico de Partidas ({filteredHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma partida encontrada
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Jogue algumas partidas para ver os resultados aqui'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-primary">Nome do Jogador</th>
                    <th className="text-left p-4 font-semibold text-primary">Data do Jogo</th>
                    <th className="text-left p-4 font-semibold text-primary">Pontuação Final</th>
                    <th className="text-left p-4 font-semibold text-primary">Nível</th>
                    <th className="text-left p-4 font-semibold text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((result, index) => (
                    <tr 
                      key={result.id} 
                      className={`border-b border-border/50 hover:bg-muted/20 transition-smooth ${
                        index % 2 === 0 ? 'bg-background/30' : 'bg-background/10'
                      }`}
                    >
                      <td className="p-4 font-medium">{result.playerName}</td>
                      <td className="p-4 text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(result.date)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-lg gradient-primary bg-clip-text text-transparent">
                          {result.finalScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-primary text-primary">
                          Nível {result.level}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(result.status)}>
                          {getStatusText(result.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};