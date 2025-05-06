"use client";

import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAtomValue } from "jotai";
import { allMindsetsAtom, allMethodsAtom } from "@/hooks/use-live-sync";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewMethodForm from "./new-method-form";
import { deleteMindset } from "@/lib/actions";
import { MethodList } from "./method-list";
import { useDialogGroup } from "@/hooks/use-dialog";

interface MindsetListProps {
  isArchiveList: boolean;
}

export default function MindsetList({ isArchiveList }: MindsetListProps) {
  const allMindsets = useAtomValue(allMindsetsAtom);
  const allMethods = useAtomValue(allMethodsAtom);

  const { openDialogs, setOpenDialogs } = useDialogGroup();

  // Get all methods for each mindset (both active and archived)
  const allMethodsByMindset = useMemo(() => {
    return allMethods.reduce<Record<string, typeof allMethods>>(
      (acc, method) => {
        if (!acc[method.mindsetId]) {
          acc[method.mindsetId] = [];
        }
        acc[method.mindsetId].push(method);
        return acc;
      },
      {},
    );
  }, [allMethods]);

  // Filter mindsets based on their methods' archive status
  const filteredMindsets = useMemo(() => {
    return allMindsets.filter((mindset) => {
      // Get all methods for this mindset
      const mindsetMethods = allMethodsByMindset[mindset.id] || [];

      // If there are no methods, show in active view only
      if (mindsetMethods.length === 0) {
        return !isArchiveList;
      }

      // Count active and archived methods
      const archivedMethodCount = mindsetMethods.filter(
        (m) => m.archived,
      ).length;

      if (isArchiveList) {
        // For archive list: show mindsets where ALL methods are archived
        return (
          archivedMethodCount === mindsetMethods.length &&
          archivedMethodCount > 0
        );
      } else {
        // For active list: show mindsets with at least one active method
        return archivedMethodCount < mindsetMethods.length;
      }
    });
  }, [allMindsets, allMethodsByMindset, isArchiveList]);

  const handleDeleteMindset = async (mindsetId: string) => {
    if (
      window.confirm(
        "このマインドセットを削除しますか？関連するすべてのメソッドと成功ログも削除されます。",
      )
    ) {
      try {
        await deleteMindset(mindsetId);
      } catch (error) {
        console.error("Failed to delete mindset:", error);
      }
    }
  };

  const openNewMethodDialog = (mindsetId: string) => {
    setOpenDialogs((prev) => ({ ...prev, [mindsetId]: true }));
  };

  if (!filteredMindsets.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isArchiveList
          ? "アーカイブされたマインドセットはありません"
          : "マインドセットがありません"}
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="w-full space-y-4">
        {filteredMindsets.map((mindset) => (
          <AccordionItem
            key={mindset.id}
            value={mindset.id}
            className="border rounded-lg p-2 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <AccordionTrigger className="hover:no-underline py-2">
                <span className="text-lg font-medium">{mindset.title}</span>
              </AccordionTrigger>
            </div>
            <AccordionContent>
              <div className="flex items-center gap-2 mr-4 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNewMethodDialog(mindset.id)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  新しいメソッド
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteMindset(mindset.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="pt-4">
                <MethodList
                  mindsetId={mindset.id}
                  isArchiveList={isArchiveList}
                />
              </div>
            </AccordionContent>

            <Dialog
              open={openDialogs[mindset.id]}
              onOpenChange={(open) =>
                setOpenDialogs((prev) => ({ ...prev, [mindset.id]: open }))
              }
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しいメソッドを追加</DialogTitle>
                </DialogHeader>
                <NewMethodForm
                  mindsets={allMindsets}
                  preselectedMindsetId={mindset.id}
                  onSuccess={() =>
                    setOpenDialogs((prev) => ({ ...prev, [mindset.id]: false }))
                  }
                />
              </DialogContent>
            </Dialog>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
