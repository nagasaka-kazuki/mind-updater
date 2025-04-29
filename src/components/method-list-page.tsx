"use client";

import { useAtomValue } from "jotai";
import {
  activeMethodsAtom,
  allMindsetsAtom,
  allSuccessLogsAtom,
} from "@/hooks/use-live-sync";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import NewMethodDialog from "./new-method-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getSuccessLogsForMethod, getMindsetTitle } from "@/lib/actions";
import SuccessLogList from "./success-log-list";
import SuccessLogForm from "./success-log-form";
import { useDialogGroup } from "@/hooks/use-dialog";
import { archiveMethod, deleteMethod } from "@/lib/actions";
import { Archive, Trash2 } from "lucide-react";

export default function MethodListPage() {
  const activeMethods = useAtomValue(activeMethodsAtom);
  const allMindsets = useAtomValue(allMindsetsAtom);
  const allSuccessLogs = useAtomValue(allSuccessLogsAtom);

  const {
    isOpen: isNewMethodDialogOpen,
    open: openNewMethodDialog,
    setIsOpen: setNewMethodDialogOpen,
  } = useDialog();
  const {
    openDialogs: successLogDialogs,
    setOpenDialogs: setSuccessLogDialogs,
  } = useDialogGroup();

  // Sort methods by newest first
  const sortedMethods = [...activeMethods].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleArchiveMethod = async (methodId: string) => {
    try {
      await archiveMethod(methodId);
    } catch (error) {
      console.error("Failed to archive method:", error);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (
      window.confirm(
        "このメソッドを削除しますか？関連するすべての成功ログも削除されます。",
      )
    ) {
      try {
        await deleteMethod(methodId);
      } catch (error) {
        console.error("Failed to delete method:", error);
      }
    }
  };

  const openSuccessLogDialog = (methodId: string) => {
    setSuccessLogDialogs((prev) => ({ ...prev, [methodId]: true }));
  };

  if (sortedMethods.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={openNewMethodDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            新しいメソッドを追加
          </Button>
          <NewMethodDialog
            open={isNewMethodDialogOpen}
            onOpenChange={setNewMethodDialogOpen}
            mindsets={allMindsets}
          />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          メソッドがありません
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">メソッド一覧</h2>
        <Button onClick={openNewMethodDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新しいメソッドを追加
        </Button>
        <NewMethodDialog
          open={isNewMethodDialogOpen}
          onOpenChange={setNewMethodDialogOpen}
          mindsets={allMindsets}
        />
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {sortedMethods.map((method) => {
          const logs = getSuccessLogsForMethod(allSuccessLogs, method.id);
          const mindsetTitle = getMindsetTitle(allMindsets, method.mindsetId);

          return (
            <AccordionItem
              key={method.id}
              value={method.id}
              className="border rounded-lg"
            >
              <div className="flex items-center justify-between px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-medium">{method.title}</span>
                    <Badge variant="outline" className="ml-2">
                      {mindsetTitle}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSuccessLogDialog(method.id);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    成功ログ
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveMethod(method.id);
                    }}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMethod(method.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 mt-2">
                  <SuccessLogList logs={logs} />
                </div>
              </AccordionContent>

              <SuccessLogForm
                methodId={method.id}
                isOpen={!!successLogDialogs[method.id]}
                onOpenChange={(open) =>
                  setSuccessLogDialogs((prev) => ({
                    ...prev,
                    [method.id]: open,
                  }))
                }
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
