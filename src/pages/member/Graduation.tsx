import React, { useEffect, useRef, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  Plus, 
  Pencil, 
  Trash2, 
  Book, 
  ArrowRight, 
  CheckCircle2, 
  Play
} from "lucide-react";
import { generateId } from "@/utils/dataUtils";
import { EducationService } from "@/services/EducationService";
import { Course, Class, Certification, LearningPath } from "@/types/education.types";
import 'keen-slider/keen-slider.min.css'
import { useKeenSlider } from 'keen-slider/react'


const MemberGraduation: React.FC = () => {
 const [courses, setCourses] = useState<Course[]>([]);
 const [classes, setClasses] = useState<Class[]>([]);
 const [certifications, setCertifications] = useState<Certification[]>([]);
 const [paths, setPaths] = useState<LearningPath[]>([]);
 
   const [sliderRef] = useKeenSlider({
    loop: true,
  
  })
 useEffect(() => {
   EducationService.getCourses().then(setCourses);
   EducationService.getClasses().then(setClasses);
   EducationService.getCertifications().then(setCertifications);
   EducationService.getPaths().then(setPaths);
 }, []);

  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    classes: [],
    duration: 0
  });

  const [newClass, setNewClass] = useState<Partial<Class>>({
    title: "",
    description: "",
    video_url: "",
    duration: 0,
    materials: []
  });

  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    title: "",
    description: "",
    required_courses: [],
    max_attempts: 3
  });

  const [newPath, setNewPath] = useState<Partial<LearningPath>>({
    title: "",
    description: "",
    steps: []
  });

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [isEditingCertification, setIsEditingCertification] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [certificationDialogOpen, setCertificationDialogOpen] = useState(false);
  const [pathDialogOpen, setPathDialogOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseClasses, setSelectedCourseClasses] = useState<Class[]>([]);
  const [currentClassIndex, setCurrentClassIndex] = useState<number>(0);
  const courseContentRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  
  // Map of lesson title → chunk filename
const lessonFileMap: Record<string, string> = {
  "01 - TÉCNICAS DE ABORDAGEM SUTIL E CONECTIVA": "course1_lesson1_chunks.json",
  "02 – ICP (Perfil do Cliente Ideal)": "course1_lesson2_chunks.json",
  "03 – ORGANIZAÇÃO DE AGENDA": "course1_lesson3_chunks.json",
  "04 – EXPLICAÇÃO DOS SERVIÇOS DA FOCO": "course1_lesson4_chunks.json",
  "05 – FOLLOW-UP": "course1_lesson5_chunks.json",
};

  const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;

  const currentTitle = selectedCourseClasses[currentClassIndex]?.title || "";
  const chunkFile = lessonFileMap[currentTitle];

  if (!chunkFile) {
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "Não foi encontrado um conjunto de dados para esta aula." },
    ]);
    return;
  }

  const userMessage = { role: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);

  try {
    const res = await fetch("https://ThazCaniti-chatbot2.hf.space/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: input,
        file: chunkFile, // Send to backend so it loads the right JSON
      }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: data.answer || "Não entendi sua pergunta." },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "Erro ao buscar resposta." },
    ]);
  }

  setInput("");
};

  // Helper para obter nomes de cursos para exibição em trilhas e certificações
  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Curso não encontrado";
  };
function isVideoUrl(url: string): boolean {
  return (
    url.includes("youtube.com/watch?v=") ||
    url.includes("youtu.be/") ||
    url.includes("vimeo.com/") ||
    url.includes("drive.google.com/file/") || // 👈 add this
    url.toLowerCase().endsWith(".mp4")
  );
}

function getEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  } else if (url.includes("drive.google.com/file/")) {
    // Directly use preview link (works for embedding)
    return url.replace("/view", "/preview");
  } else {
    return url; // Direct .mp4 or others
  }
}

const handleViewCourse = async (course: Course) => {
  try {
    setSelectedCourse(course);
    
    if (course.classes && course.classes.length > 0) {
      const classList = await EducationService.getClassesByIds(course.classes);
      setSelectedCourseClasses(classList);
      setCurrentClassIndex(0);

      // Wait a bit to ensure layout update completes
      setTimeout(() => {
        courseContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } else {
      setSelectedCourseClasses([]);
    }
  } catch (err) {
    toast.error("Erro ao carregar aulas do curso");
  }
};



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Treinamentos</h2>
        <p className="text-muted-foreground">
          Gerencie os conteúdos educacionais para a graduação dos membros
        </p>
      </div>
      {/* <div ref={sliderRef} className="keen-slider h-[45vh] rounded-xl overflow-hidden shadow-md">
  {[
    "/Banner1.png",
    "/Banner2.png",
    "/Banner3.png"
  ].map((img, index) => (
    <div key={index} className="keen-slider__slide">
      <img src={img} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
    </div>
  ))}
</div> */}

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Cursos
          </TabsTrigger>
          {/* <TabsTrigger value="certifications">
            <GraduationCap className="mr-2 h-4 w-4" />
            Certificações
          </TabsTrigger> */}
          <TabsTrigger value="paths">
            <Book className="mr-2 h-4 w-4" />
            Trilhas
          </TabsTrigger>
        </TabsList>

        {/* Cursos */}
     <TabsContent value="courses">
  <div className="mb-6 px-4">
    <h2 className="text-3xl font-bold text-black">🎓 Cursos</h2>
    <p className="text-muted-foreground mt-1 text-sm">Explore os cursos disponíveis.</p>
  </div>

  {courses.length === 0 ? (
    <div className="text-center py-20 text-muted-foreground text-sm">
      Nenhum curso cadastrado
    </div>
  ) : (
   <div className="flex overflow-x-auto gap-4 px-4 pb-4">
  {courses.map((course) => (
  <div
    key={course.id}
    className="flex-shrink-0 w-[237px] h-[500px] rounded-xl relative group border border-border transition-all hover:shadow-xl bg-muted/10"
  >
    {/* Shadow Wrapper */}
    <div className="p-[6px] h-full w-full">
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-shadow duration-500">
        <img
          src={course.image_url || "/placeholder.jpg"}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Text */}
        <div >
          <div className="text-white text-sm font-bold leading-tight line-clamp-3">
            {course.title}
          </div>
        </div>

        {/* Optional play button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/50 text-white hover:bg-background/70"
            onClick={() => handleViewCourse(course)}
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
))}

</div>

  )}

  {/* Course content player if selected */}
  {selectedCourse && (
    <Card ref={courseContentRef} className="mt-8 scroll-mt-24">
      <CardHeader>
        <CardTitle>{selectedCourse.title} - Aulas</CardTitle>
        <CardDescription>{selectedCourse.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedCourseClasses.length === 0 ? (
          <p className="text-muted-foreground">Este curso não possui aulas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: class list */}
            <div className="space-y-2">
              {selectedCourseClasses.map((cls, index) => (
                <Button
                  key={cls.id}
                  variant={index === currentClassIndex ? "default" : "outline"}
                  onClick={() => setCurrentClassIndex(index)}
                  className="w-full justify-start break-words text-left whitespace-normal"
                >
                  {cls.title}
                </Button>
              ))}
            </div>

          
          {/* Middle: video player or link */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedCourseClasses[currentClassIndex]?.title}
          </h3>

          {(() => {
            const url = selectedCourseClasses[currentClassIndex]?.video_url;
            if (!url) {
              return <p className="text-sm text-muted-foreground">Sem recurso</p>;
            }

            if (isVideoUrl(url)) {
              return (
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(url)}
                    title="Vídeo da aula"
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full rounded-md"
                  />
                </div>
              );
            }

            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-block mt-2
                  text-primary hover:text-primary-dark
                  underline
                  break-words
                  max-w-full
                  truncate
                  hover:underline
                  transition
                  cursor-pointer
                "
                title={url}
              >
                {url}
              </a>
            );
          })()}

          <p className="text-sm text-muted-foreground">
            {selectedCourseClasses[currentClassIndex]?.description}
          </p>


          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              💬 Chatbot - Tire suas dúvidas sobre {selectedCourseClasses[currentClassIndex]?.title}
            </h4>

            <div className="flex flex-col space-y-4">
              {/* Chat history */}
              <div className="h-60 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 max-w-[80%] rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white self-start"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>

        </div>

          </div>
        )}
      </CardContent>
    </Card>
  )}
</TabsContent>


        {/* Aulas */}
        <TabsContent value="classes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Aulas</CardTitle>
            
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Vídeo</TableHead>
                      <TableHead>Materiais</TableHead>
                  
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          <p className="text-muted-foreground">Nenhuma aula cadastrada</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{cls.description}</TableCell>
                          <TableCell>{cls.duration} min</TableCell>
                         <TableCell className="max-w-sm">
  {cls.video_url ? (
    <div className="aspect-video w-full">
      <iframe
        src={getEmbedUrl(cls.video_url)}
        title="Vídeo da aula"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full rounded-md"
      ></iframe>
    </div>
  ) : (
    "Sem vídeo"
  )}
</TableCell>

                          <TableCell>
                            {cls.materials.length > 0 ? 
                              `${cls.materials.length} material(is)` : 
                              "Sem materiais"
                            }
                          </TableCell>
                  
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificações */}
        <TabsContent value="certifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Certificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tentativas Máx.</TableHead>
                      <TableHead>Cursos Necessários</TableHead>
                 
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          <p className="text-muted-foreground">Nenhuma certificação cadastrada</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      certifications.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{cert.description}</TableCell>
                          <TableCell>{cert.max_attempts}</TableCell>
                          <TableCell>
                            {cert.required_courses.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {cert.required_courses.map(courseId => (
                                  <li key={courseId} className="text-sm">{getCourseTitle(courseId)}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted-foreground">Nenhum curso necessário</span>
                            )}
                          </TableCell>
      
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trilhas */}
        <TabsContent value="paths">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Trilhas de Aprendizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paths.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhuma trilha cadastrada</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Crie uma nova trilha para organizar cursos e certificações.
                    </p>
                  </div>
                ) : (
                  paths.map(path => (
                    <Card key={path.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{path.title}</CardTitle>
                            <CardDescription className="mt-1">{path.description}</CardDescription>
                          </div>
                          <div className="flex space-x-2">
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Passos da Trilha:</h4>
                          {path.steps.sort((a, b) => a.order - b.order).map((step, index) => {
                            const isLast = index === path.steps.length - 1;
                            
                            let content;
                            let title = "";
                            
                            if (step.contentType === 'course') {
                              const course = courses.find(c => c.id === step.contentId);
                              title = course ? course.title : "Curso não encontrado";
                              content = (
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-5 w-5 text-blue-500" />
                                  <span>Curso: {title}</span>
                                </div>
                              );
                            } else {
                              const cert = certifications.find(c => c.id === step.contentId);
                              title = cert ? cert.title : "Certificação não encontrada";
                              content = (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-5 w-5 text-green-500" />
                                  <span>Certificação: {title}</span>
                                </div>
                              );
                            }
                            
                            return (
                              <div key={`${step.contentType}-${step.contentId}`} className="relative pl-8">
                                <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-xs font-bold">{step.order}</span>
                                  </div>
                                  {!isLast && (
                                    <div className="w-px h-full bg-border mt-1"></div>
                                  )}
                                </div>
                                <div className="min-h-[2rem] flex items-center">
                                  {content}
                                </div>
                              </div>
                            );
                          })}
                          
                          {path.steps.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              Esta trilha não possui passos definidos.
                            </p>
                          )}
                          
                          {path.steps.length > 0 && (
                            <div className="relative pl-8 mt-2">
                              <div className="absolute left-0 top-0 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                              </div>
                              <div className="min-h-[2rem] flex items-center text-green-600 font-medium">
                                Trilha Concluída
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberGraduation;
