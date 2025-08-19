import React from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield } from 'lucide-react';

export const UsersView: React.FC = () => {
  const { user } = useUser();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
          Perfil do Usuário
        </h1>
        <p className="text-muted-foreground">
          Informações do jogador atual
        </p>
      </div>

      <Card className="stat-card max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Jogador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <Badge variant="outline" className="border-primary text-primary">
                <Shield className="h-3 w-3 mr-1" />
                Jogador Ativo
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="stat-card p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="stat-card p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};