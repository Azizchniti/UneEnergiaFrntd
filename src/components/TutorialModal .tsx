import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TutorialModalProps = {
  onClose: () => void;
  member: { first_name: string; last_name: string };
};

export default function TutorialModal({ onClose, member }: TutorialModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl shadow-lg p-6">
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-2xl font-bold text-primary">
            🎉 Bem-vindo(a), {member.first_name} {member.last_name}!
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Assista a este breve tutorial antes de começar.
          </p>
        </DialogHeader>

        <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md border">
          <iframe
            src="https://drive.google.com/file/d/1wPSfWve1vi_s6GWbhLXkGeV45MzJCKsM/preview"
            allow="autoplay"
            className="w-full h-full"
          ></iframe>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Continuar 🚀
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
