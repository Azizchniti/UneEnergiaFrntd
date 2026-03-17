
import React, { useState } from "react";
import { Member } from "@/types";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface SquadMemberTreeProps {
  rootMember: Member;
  allMembers: Member[];
  level?: number;
  maxDepth?: number;
}

const SquadMemberTree: React.FC<SquadMemberTreeProps> = ({
  rootMember,
  allMembers,
  level = 0,
  maxDepth = 4,
}) => {
  const [expanded, setExpanded] = useState(level < 2);
  
  // Encontrar membros diretamente sob este membro
  const directDownline = allMembers.filter(m => m.uplineId === rootMember.id);
  
  // Se não há downline ou atingimos a profundidade máxima, não mostramos nada além
  if (directDownline.length === 0 || level >= maxDepth) {
    return null;
  }

  return (
    <div className="pl-4 mt-1 border-l border-border/40">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-1 mb-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 
          <ChevronDown className="h-3 w-3 mr-1" /> : 
          <ChevronRight className="h-3 w-3 mr-1" />
        }
        {directDownline.length} membro{directDownline.length !== 1 ? 's' : ''}
      </Button>
      
      {expanded && (
        <div className="space-y-2">
          {directDownline.map((member) => (
            <div key={member.id}>
              <div className={cn(
                "flex items-center gap-2 py-1 px-2 rounded-md",
                "hover:bg-muted/50"
              )}>
                <HoverCard>
                  <HoverCardTrigger>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted">
                        {member.grade}
                      </span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Telefone</p>
                          <p>{member.phone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CPF</p>
                          <p>{member.cpf}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total de Vendas</p>
                          <p>R$ {member.totalSales.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Graduação</p>
                          <p className="capitalize">{member.grade}</p>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <SquadMemberTree
                rootMember={member}
                allMembers={allMembers}
                level={level + 1}
                maxDepth={maxDepth}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SquadMemberTree;
