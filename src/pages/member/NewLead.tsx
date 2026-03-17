import React from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Telefone deve ter no mínimo 10 dígitos"),
  source: z.string().min(1, "Origem é obrigatória"),
  sale_value: z.number().min(1, "Selecione um preço"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

const NewLead: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addLead } = useData();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      source: "",
    },
  });

  const onSubmit = async (values: LeadFormValues) => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      const success = await addLead({
        name: values.name,
        phone: values.phone,
        source: values.source,
        status: "new",
        member_id: user.id, 
        sale_value: values.sale_value,// fix: should be member_id
      });

      if (success) {
        toast.success("Lead criado com sucesso!");
        navigate("/member/leads");
      } else {
        toast.error("Erro ao criar o lead.");
      }
    } catch (err) {
      console.error("Erro ao criar lead:", err);
      toast.error("Erro inesperado ao criar lead.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          onClick={() => navigate("/member/leads")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h1 className="text-3xl font-bold">Cadastrar Novo Lead</h1>
      </div>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Novo Lead</CardTitle>
          <CardDescription>
            Preencha as informações para cadastrar um novo lead no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="lead-form" className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                    control={form.control}
                      name="sale_value"
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Valor da Venda</FormLabel>
                             <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Ex: 1500"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            form="lead-form" 
            type="submit" 
            className="w-full sm:w-auto"
          >
            Cadastrar Lead
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewLead;
