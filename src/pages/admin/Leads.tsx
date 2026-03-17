
import React, { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Lead, LeadStatus, Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search, Plus, FileEdit, Trash, NotebookText, ChartPie, CalendarDays, SquareKanban,Table as TableIcon } from "lucide-react";
import { MemberService } from "@/services/members.service";
import DeleteLeadDialog from "@/components/DeleteLeadDialog";
import { useLocation, useNavigate } from "react-router-dom";

const LEAD_STATUS_MAP: Record<LeadStatus, string> = {
  "new": "Novo Lead",
  "contacted": "Primeiro Contato",
  "in-progress": "Em andamento",
  "negotiating": "Negociando",
  "closed": "Ganho",
  "lost": "Perdido"
};

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

const statusFormSchema = z.object({
  status: z.enum(["new", "contacted", "in-progress", "negotiating", "closed", "lost"]),
 saleValue: z
  .string()
  .transform((val) => {
    // Remove BRL formatting and convert to number
    const cleaned = val.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(cleaned || "0");
  })
  .refine((val) => !isNaN(val), {
    message: "Valor inválido",
  }),

});


type LeadFormValues = z.infer<typeof leadFormSchema>;
type NotesFormValues = z.infer<typeof notesFormSchema>;
type StatusFormValues = z.infer<typeof statusFormSchema>;

const AdminLeads: React.FC = () => {
  const { leads, addLead, 
    deleteLead,
    addNotes, 
    changeStatus } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isKanban = location.pathname.includes("leadsKanban");
const [members, setMembers] = useState<Member[]>([]);
const [loading, setLoading] = useState<boolean>(true);
  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "",
      memberId: "",
    },
  });
  useEffect(() => {
  const loadMembers = async () => {
    try {
      const data = await MemberService.getAllMembers();
      setMembers(data);
    } catch (error) {
      toast.error("Erro ao buscar membros");
    } finally {
      setLoading(false);
    }
  };
  loadMembers();
}, []);

  const notesForm = useForm<NotesFormValues>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: "new",
      saleValue:0
    },
  });

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


const handleChangeStatus = (values: StatusFormValues) => {
  if (!selectedLead) return;

  const success = changeStatus(selectedLead.id, values.status, Number(values.saleValue));
  if (success) {
    setIsStatusDialogOpen(false);
    statusForm.reset();
    setSelectedLead(null);
  }
};


  const openNotesDialog = (lead: Lead) => {
    setSelectedLead(lead);
    notesForm.setValue("notes", lead.notes || "");
    setIsNotesDialogOpen(true);
  };

const openStatusDialog = (lead: Lead) => {
  setSelectedLead(lead);
  statusForm.setValue("status", lead.status);
  statusForm.setValue("saleValue" as any, String(lead.sale_value ?? ""));
  setIsStatusDialogOpen(true);
};
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
        <TableIcon className="h-4 w-4 mr-1" /> Table
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
</div>

      <Card>
           <CardHeader>
           <div className="flex justify-between items-center">
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
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou membro..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Origem</TableHead>
                   <TableHead>Status</TableHead> 
                  <TableHead>Membro Responsável</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Valor em Venda</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                       <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {LEAD_STATUS_MAP[lead.status]}
                        </span>
                      </TableCell> 
                      <TableCell>
                        {(() => {
                          const member = members.find((m) => m.id === lead.member_id);
                          return member ? `${member.first_name} ${member.last_name}` : "N/A";
                        })()}
                      </TableCell>
                      <TableCell>
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>

                       <TableCell>
                          {new Intl.NumberFormat('pt-BR', 
                            { style: 'currency', currency: 'BRL' }).format(lead.sale_value)}
                        </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNotesDialog(lead)}
                          >
                            <NotebookText />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openStatusDialog(lead)}
                          >
                            <ChartPie />
                          </Button>
                        <DeleteLeadDialog
                            onConfirm={() => handleDelete(lead.id)}
                            trigger={
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                          <Trash size={14} />
                        </button>

                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Lead</DialogTitle>
            <DialogDescription>
              Preencha as informações para cadastrar um novo lead no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...leadForm}>
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
                  <FormItem>
                    <FormLabel>Membro Responsável</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                             {member.first_name} {member.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Observações</DialogTitle>
            <DialogDescription>
              Adicione observações para o lead {selectedLead?.name}.
            </DialogDescription>
          </DialogHeader>
           <Form {...notesForm}>
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
          </Form> 
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Altere o status do lead {selectedLead?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(handleChangeStatus)} className="space-y-4">
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(LEAD_STATUS_MAP).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={statusForm.control}
                name="saleValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Venda</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="Ex: 1000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
    );
  };


export default AdminLeads;
