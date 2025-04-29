"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Archive, RotateCcw, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { archiveMethod, unarchiveMethod, deleteMethod } from "@/lib/actions";
import SuccessLogList from "./success-log-list";
import SuccessLogForm from "./success-log-form";
import { useDialog } from "@/hooks/use-dialog";
import type { Method, SuccessLog, Mindset } from "@/db/schema";

interface MethodCardProps {
  method: Method;
  mindsets: Mindset[];
  successLogs: SuccessLog[];
  isArchived?: boolean;
}

export default function MethodCard({
  method,
  mindsets,
  successLogs,
  isArchived = false,
}: MethodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isOpen: isLogFormOpen,
    open: openLogForm,
    setIsOpen: setLogFormOpen,
  } = useDialog();
  const mindsetTitle =
    mindsets.find((m) => m.id === method.mindsetId)?.title || "不明";

  const handleArchiveToggle = async () => {
    try {
      if (isArchived) {
        await unarchiveMethod(method.id);
      } else {
        await archiveMethod(method.id);
      }
    } catch (error) {
      console.error(
        `Failed to ${isArchived ? "unarchive" : "archive"} method:`,
        error,
      );
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "このメソッドを削除しますか？関連するすべての成功ログも削除されます。",
      )
    ) {
      try {
        await deleteMethod(method.id);
      } catch (error) {
        console.error("Failed to delete method:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>{method.title}</CardTitle>
            <Badge variant="outline">{mindsetTitle}</Badge>
          </div>
          <div className="flex gap-1">
            {!isArchived && (
              <Button variant="outline" size="sm" onClick={openLogForm}>
                <PlusCircle className="h-4 w-4 mr-1" />
                成功ログ
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleArchiveToggle}>
              {isArchived ? (
                <RotateCcw className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            成功ログ: {successLogs.length}件
          </div>
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
              成功ログを{isExpanded ? "閉じる" : "表示"}
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <SuccessLogList logs={successLogs} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <SuccessLogForm
        methodId={method.id}
        isOpen={isLogFormOpen}
        onOpenChange={setLogFormOpen}
      />
    </Card>
  );
}
