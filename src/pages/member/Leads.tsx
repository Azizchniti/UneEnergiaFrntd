
import React, { useEffect, useRef, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Lead, LeadStatus, Member } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, Plus, FileEdit, NotebookText, Pencil } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MemberService } from "@/services/members.service";
import { LeadService } from "@/services/leads.service";

declare global {
  interface Window {
    calendar?: {
      schedulingButton: {
        load: (options: {
          url: string;
          color: string;
          label: string;
          target: HTMLElement;
        }) => void;
      };
    };
  }
}


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
 // sale_value: z.number().min(1, "Selecione um preço"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const notesFormSchema = z.object({
  notes: z.string().min(1, "Observações não podem estar vazias"),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;

const MemberLeads: React.FC = () => {
  const { user } = useAuth();
  const { 
    getMemberActiveLeads, 
    getMemberClosedLeads, 
    getMemberLostLeads, 
    addLead ,
    addNotes,
    fetchLeads,
    leads
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const activeLeads = getMemberActiveLeads(user?.id || "");
  const closedLeads = getMemberClosedLeads(user?.id || "");
  const lostLeads = getMemberLostLeads(user?.id || "");

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { updateLead } = useData();
 const [currentMember, setCurrentMember] = useState<Member | null>(null);
 const [loading, setLoading] = useState(true);


 useEffect(() => {
   const fetchMember = async () => {
     if (user?.id) {
       try {
         const memberData = await MemberService.getMemberById(user.id);
         setCurrentMember(memberData);
       } catch (err) {
         console.error("Failed to fetch member:", err);
       } finally {
         setLoading(false);
       }
     }
   };
 
   fetchMember();
 }, [user?.id]);

  const leadForm = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "",
     //  sale_value: 0,
    },
  });

const handleSubmitLead = async (values) => {
  const { phone, name, source } = values;

  if (!currentMember || !currentMember.id) {
    toast.error("Usuário atual não encontrado.");
    return;
  }

  try {
    const allLeads = await LeadService.getAllLeads();
    const existingLead = allLeads.find((lead) => lead.phone === phone);

    if (!existingLead) {
      await LeadService.createLead({
        name,
        phone,
        source,
        member_id: currentMember.id,
      });

      await fetchLeads(); // ✅ Refresh the list
      toast.success("Lead criado com sucesso!");
      setIsAddDialogOpen(false);
      return;
    }

    if (existingLead.member_id === currentMember.id) {
      toast.error("Este lead já está cadastrado por você.");
      return;
    }

    const createdAt = new Date(existingLead.created_at);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    if (ageInDays < 15) {
      toast.error("Lead já cadastrado por outro membro.");
      return;
    }

    const confirm = window.confirm(
      "Este lead foi criado há mais de 15 dias por outro membro. Deseja assumir esse lead?"
    );
    if (!confirm) return;

    await LeadService.updateLead(existingLead.id, {
      member_id: currentMember.id,
      created_at: new Date().toISOString(),
    });

    await fetchLeads(); // ✅ Refresh after assuming
    toast.success("Lead assumido com sucesso!");
    setIsAddDialogOpen(false);
  } catch (err) {
    console.error("Erro ao criar ou verificar lead:", err);
    toast.error("Erro ao processar o lead.");
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


const filterLeads = (status: string) => {
  if (!user?.id) return [];

  return leads.filter(lead =>
    lead.member_id === user.id &&
    lead.status === status &&
    (
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};


  const filteredActiveLeads = filterLeads('new');
  const filteredClosedLeads = filterLeads('closed');
  const filteredLostLeads = filterLeads('lost');

  const notesForm = useForm<NotesFormValues>({
  resolver: zodResolver(notesFormSchema),
  defaultValues: {
    notes: "",
  },
});

const openNotesDialog = (lead: Lead) => {
  setSelectedLead(lead);
  notesForm.setValue("notes", lead.notes || "");
  setIsNotesDialogOpen(true);
};
const handleEditLead = (lead: Lead) => {
  setEditingLead(lead);
  leadForm.setValue("name", lead.name);
  leadForm.setValue("phone", lead.phone);
  leadForm.setValue("source", lead.source);
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


const LeadTable = ({ leads, isClosed = false }: { leads: Lead[], isClosed?: boolean }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead>Valor da Venda</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isClosed ? 6 : 5} className="h-24 text-center">
              Nenhum lead encontrado.
            </TableCell>
          </TableRow>
        ) : (
          leads.map((lead) => (
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
                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
              </TableCell>
           
                <TableCell>
                  {lead.sale_value ? `R$ ${lead.sale_value.toFixed(2)}` : "N/A"}
                </TableCell>
              
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNotesDialog(lead)}
                >
                  <NotebookText />
                </Button>
                  {lead.status === "new" && (
      <Button variant="ghost" size="sm" onClick={() => handleEditLead(lead)}>
        <Pencil />
      </Button>
    )}
              </TableCell>

            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meus Leads</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
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
                placeholder="Buscar por nome, telefone ou origem..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Ativos ({filteredActiveLeads.length})</TabsTrigger>
              <TabsTrigger value="closed">Ganhos ({filteredClosedLeads.length})</TabsTrigger>
              <TabsTrigger value="lost">Perdidos ({filteredLostLeads.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <LeadTable leads={filteredActiveLeads} />
            </TabsContent>
            <TabsContent value="closed" className="mt-4">
              <LeadTable leads={filteredClosedLeads} />
            </TabsContent>
            <TabsContent value="lost" className="mt-4">
              <LeadTable leads={filteredLostLeads} />
            </TabsContent>
          </Tabs>
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
              {/* <FormField
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
          /> */}


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
                          <FormLabel>Observações: </FormLabel>
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

            <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Editar Lead</DialogTitle>
      <DialogDescription>
        Atualize as informações do lead {editingLead?.name}
      </DialogDescription>
    </DialogHeader>

    <Form {...leadForm}>
      <form
        onSubmit={leadForm.handleSubmit(async (values) => {
          if (!editingLead) return;
          await updateLead(editingLead.id, {
            name: values.name,
            phone: values.phone,
            source: values.source,
          });
          toast.success("Lead atualizado com sucesso!");
          setEditingLead(null);
        })}
        className="space-y-4"
      >
        <FormField
          control={leadForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome" {...field} />
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
                <Input placeholder="Telefone" {...field} />
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
                <Input placeholder="Origem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit">Salvar Alterações</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default MemberLeads;
