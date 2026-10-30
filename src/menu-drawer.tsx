import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
import { Button } from './components/ui/button';

export default function MenuDrawer({
  children,
  onClose,
  trigger,
}: {
  children: ReactNode;
  onClose: () => void;
  trigger: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content
          className="dialog drawer"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <Dialog.Title>Menu</Dialog.Title>
          <Dialog.Description>Navegue pelo marketplace.</Dialog.Description>
          <nav className="stack">{children}</nav>
          <Dialog.Close asChild>
            <Button variant="outline" aria-label="Fechar menu">
              <X />
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
