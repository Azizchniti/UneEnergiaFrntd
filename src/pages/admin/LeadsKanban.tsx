// pages/admin/leads/index.tsx
import React, { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Lead, LeadStatus, Member } from "@/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { MemberService } from "@/services/members.service";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, NotebookText, Plus, Search, Table, Trash ,SquareKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // ✅ Correct import
import DeleteLeadDialog from "@/components/DeleteLeadDialog";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";



const LEAD_STATUS_MAP: Record<LeadStatus, string> = {
  new: "Novo Lead",
  contacted: "Primeiro Contato",
  "in-progress": "Em andamento",
  negotiating: "Negociando",
  closed: "Ganho",
  lost: "Perdido",
};

const leadStatusColumns: LeadStatus[] = [
  "new",
  "contacted",
  "in-progress",
  "negotiating",
  "closed",
  "lost",
];

function DroppableColumn({ status, children }: { status: LeadStatus; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 p-2 bg-muted rounded-xl shadow-md min-h-[400px]"
    >
      <h3 className="text-md font-bold text-center">{LEAD_STATUS_MAP[status]}</h3>
      {children}
    </div>
  );
}

function DraggableCard({
  lead,
  onClick,
  activeId,
  setOverlayNode,
}: {
  lead: Lead;
  onClick: () => void;
  activeId: string | null;
  setOverlayNode?: (el: HTMLDivElement | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    data: { status: lead.status },
  });

const style = {
  transform: CSS.Transform.toString(transform),
  width: "100%",
  minHeight: "80px",
  maxHeight: "140px",
  opacity: lead.id === activeId ? 0 : 1, // Hide immediately during drag
  transition: lead.id === activeId ? "none" : "all 0.2s ease", // Remove flicker animation
};



  return (
   <Card
      data-lead-id={lead.id}
      ref={(el) => {
        setNodeRef(el);
        if (lead.id === activeId && setOverlayNode) setOverlayNode(el);
      }}
      style={style}
      className="p-3 border hover:shadow-lg transition-all duration-200 relative overflow-hidden"
      onClick={onClick}
    >
      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 cursor-grab p-1"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <p className="font-medium">{lead.name}</p>
      <p className="text-sm text-muted-foreground">{lead.phone}</p>
      <p className="text-sm mt-1">R$ {lead.sale_value}</p>
    </Card>
  );
}
const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  source: z.string().min(1, "Origem é obrigatória"),
  memberId: z.string().min(1, "Selecione um membro"),
  sale_value: z.number().min(1, "Selecione um preço"),
});
const notesFormSchema = z.object({
  notes: z.string().min(1, "Observações não podem estar vazias"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;
type NotesFormValues = z.infer<typeof notesFormSchema>;

const AdminLeadsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
const [dialogOpen, setDialogOpen] = useState(false);
const [activeLead, setActiveLead] = useState<Lead | null>(null);
const [overlayNode, setOverlayNode] = useState<HTMLDivElement | null>(null);
const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
const navigate = useNavigate();
const location = useLocation();
const isKanban = location.pathname.includes("leadsKanban");
  const { leads, addLead, 
    deleteLead,
    addNotes, 
    changeStatus } = useData()
const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "",
      memberId: "",
      sale_value: 0,
    },
  });
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await MemberService.getAllMembers();
        setMembers(data);
      } catch {
        toast.error("Erro ao buscar membros");
      }
    };
    loadMembers();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const member = members.find((m) => m.id === lead.member_id);
    const memberFullName = member ? `${member.first_name} ${member.last_name}`.toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return (
      
      lead.name.toLowerCase().includes(search) ||
      lead.phone.toLowerCase().includes(search) ||
      memberFullName.includes(search)
    );
  });
const handleOpenGoogleCalendarPopup = () => {
  const iframe = document.createElement("iframe");
  iframe.src =
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1aDRCK5ISk-SY97zRzAmUWsLEz2VxNjmPDcljDFfJqH2iPvOkBsG7ZMHPU4iTYK0fgryYOgpoJ?gv=true";
  iframe.style.position = "fixed";
  iframe.style.top = "50%";
  iframe.style.left = "50%";
  iframe.style.transform = "translate(-50%, -50%)";
  iframe.style.width = "80%";
  iframe.style.height = "94%";
  iframe.style.border = "1px solid #ccc";
  iframe.style.borderRadius = "8px";
  iframe.style.zIndex = "1001";
  iframe.style.backgroundColor = "#fff";

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
  overlay.style.zIndex = "1000";
  overlay.addEventListener("click", () => {
    document.body.removeChild(iframe);
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
  document.body.appendChild(iframe);
};
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const draggedLead = leads.find((l) => l.id === leadId);

    if (!draggedLead || draggedLead.status === newStatus) return;

    const success = changeStatus(leadId, newStatus, Number(draggedLead.sale_value || 0));
    if (!success) toast.error("Erro ao alterar status");
  };
  const handleSubmitLead = (values: LeadFormValues) => {
    const member = members.find(m => m.id === values.memberId);
    if (!member) {
      toast.error("Membro não encontrado");
      return;
    }

    const success = addLead({
      name: values.name,
      phone: values.phone,
      source: values.source,
      member_id: values.memberId,
      status: "new",
      sale_value: values.sale_value,
    });

    if (success) {
      setIsAddDialogOpen(false);
      leadForm.reset();
    }
  };
    const notesForm = useForm<NotesFormValues>({
      resolver: zodResolver(notesFormSchema),
      defaultValues: {
        notes: "",
      },
    });
  const handleAddNotes = (values: NotesFormValues) => {
    if (!selectedLead) return;

     const success = addNotes(selectedLead.id, values.notes);
     if (success) {
       setIsNotesDialogOpen(false);
       notesForm.reset();
       setSelectedLead(null);
     }
   };
const handleDelete = async (id: string) => {
  await deleteLead(id);
};
    const openNotesDialog = (lead: Lead) => {
      setSelectedLead(lead);
      notesForm.setValue("notes", lead.notes || "");
      setIsNotesDialogOpen(true);
    };
return (
<div className="p-4">
<div className="space-y-6">
<div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold">Leads</h1>

  <div className="flex gap-2 items-center">
    {/* View toggle buttons (as tabs) */}
    <div className="flex bg-muted rounded-full p-1 border border-border">
      <Button
        variant="ghost"
        className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
          !isKanban
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => navigate("/admin/leads")}
      >
        <Table className="h-4 w-4 mr-1" /> Table
      </Button>
      <Button
        variant="ghost"
        className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
          isKanban
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-primary"
        }`}
        onClick={() => navigate("/admin/leadsKanban")}
      >
        <SquareKanban className="h-4 w-4 mr-1" /> Kanban
      </Button>
    </div>

    {/* Add new lead button */}
    <Button className="rounded-full px-4 py-2">
      <Plus className="mr-2 h-4 w-4" /> Novo Lead
    </Button>
  </div>
</div>

    

  {/* Card with description, calendar button, and search */}
  <Card>
    <CardHeader>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <CardTitle>Gerenciamento de Leads</CardTitle>
          <CardDescription>
            Visualize e acompanhe todos os seus leads cadastrados
          </CardDescription>
        </div>
        <Button
          variant="outline"
          className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
          onClick={handleOpenGoogleCalendarPopup}
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png"
            alt="Google Calendar"
            className="w-5 h-5"
          />
          Agendar Reunião
        </Button>
      </div>
    </CardHeader>

    <CardContent>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou membro..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
</div>


 {/* Add Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
            <DialogDescription>
              Preencha as informações para cadastrar um novo lead no sistema.
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...leadForm}>
        
            <form onSubmit={leadForm.handleSubmit(handleSubmitLead)} className="space-y-4">
              <FormField
                control={leadForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={leadForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={leadForm.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Instagram, Facebook, Indicação, etc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
            control={leadForm.control}
            name="sale_value"
            render={({ field }) => {
              const [rawValue, setRawValue] = useState(() =>
                field.value ? String(Math.round(Number(field.value) * 100)) : ""
              );

              const formatCurrency = (value: string) => {
                const cleaned = value.replace(/\D/g, "");
                const number = parseFloat(cleaned) / 100;
                return isNaN(number)
                  ? ""
                  : number.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    });
              };

              return (
                <FormItem>
                  <FormLabel>Valor da Venda</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ex: R$ 1.500,00"
                      value={formatCurrency(rawValue)}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                        setRawValue(onlyNumbers);
                        const floatValue = parseFloat(onlyNumbers) / 100;
                        field.onChange(floatValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
              <FormField
                control={leadForm.control}
                name="memberId"
                render={({ field }) => (
                 <FormItem className="space-y-1">
                <FormLabel>Membro Responsável</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
      
          </FormProvider>
        </DialogContent>
      </Dialog>
  {/* Add Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" >
          <DialogHeader>
            <DialogTitle>Adicionar Observações</DialogTitle>
            <DialogDescription>
              Adicione observações para o lead {selectedLead?.name}.
            </DialogDescription>
          </DialogHeader>
            <FormProvider {...notesForm}>
            <form onSubmit={notesForm.handleSubmit(handleAddNotes)} className="space-y-4">
              <FormField
                control={notesForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite as observações sobre este lead..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
      <DndContext
  collisionDetection={closestCorners}
  onDragStart={(event) => {
    const dragged = leads.find((lead) => lead.id === event.active.id);
    const original = document.querySelector(`[data-lead-id="${event.active.id}"]`) as HTMLElement;

    if (original) {
      setOverlaySize({
        width: original.offsetWidth,
        height: original.offsetHeight,
      });
    }

    setActiveLead(dragged || null);
  }}

  onDragEnd={(event) => {
    const { active, over } = event;
    setActiveLead(null); // Clear drag state

    if (!active || !over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;
    const draggedLead = leads.find((l) => l.id === leadId);
    if (!draggedLead || draggedLead.status === newStatus) return;

    const success = changeStatus(leadId, newStatus, Number(draggedLead.sale_value || 0));
    if (!success) toast.error("Erro ao alterar status");
  }}
>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-auto">
          {leadStatusColumns.map((status) => (
            <DroppableColumn key={status} status={status}>
              {filteredLeads
                .filter((lead) => lead.status === status)
                .map((lead) => (
           <DraggableCard
              key={lead.id}
              lead={lead}
              activeId={activeLead?.id || null}
              onClick={() => {
                setSelectedLead(lead);
                setDialogOpen(true);
              }}
              setOverlayNode={setOverlayNode}
            />

                ))}
            </DroppableColumn>
            
          ))}
        </div>
       <DragOverlay>
  {activeLead ? (
    <Card
      className="p-3 border shadow-lg"
      style={{
        width: overlaySize.width,
        height: overlaySize.height,
      }}
    >
      <p className="font-medium">{activeLead.name}</p>
      <p className="text-sm text-muted-foreground">{activeLead.phone}</p>
      <p className="text-sm mt-1">R$ {activeLead.sale_value}</p>
    </Card>
  ) : null}
</DragOverlay>


  </DndContext>
     
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="sm:max-w-lg mx-auto p-6">
    {selectedLead && (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-foreground">
            Detalhes do Lead
          </h4>
           <div className="flex items-center gap-2 mr-8">
            {/* Notes Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openNotesDialog(selectedLead)}
              title="Ver Notas"
            >
              <NotebookText className="h-4 w-4" />
            </Button>

            {/* Delete Button */}
            <DeleteLeadDialog
              onConfirm={() => handleDelete(selectedLead.id)}
              trigger={
                <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Trash size={14} />
                  Excluir
                </button>
              }
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <p>
            <span className="font-medium text-muted-foreground">Nome:</span><br />
            {selectedLead.name}
          </p>

          <p>
            <span className="font-medium text-muted-foreground">Telefone:</span><br />
            {selectedLead.phone}
          </p>

          <p>
            <span className="font-medium text-muted-foreground">Valor da Venda:</span><br />
            R$ {Number(selectedLead.sale_value).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p>
            <span className="font-medium text-muted-foreground">Status:</span><br />
            {LEAD_STATUS_MAP[selectedLead.status]}
          </p>

          <p>
            <span className="font-medium text-muted-foreground">Origem:</span><br />
            {selectedLead.source}
          </p>

          <p>
            <span className="font-medium text-muted-foreground">Criado em:</span><br />
            {new Date(selectedLead.created_at).toLocaleString("pt-BR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          <p className="sm:col-span-2">
            <span className="font-medium text-muted-foreground">Responsável:</span><br />
            {(() => {
              const member = members.find((m) => m.id === selectedLead.member_id);
              return member ? `${member.first_name} ${member.last_name}` : "N/A";
            })()}
          </p>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

    </div>
    
  );
};

export default AdminLeadsPage;
