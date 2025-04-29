"use client";

import { Button } from "@/components/ui/button";
import { ListChecks, Lightbulb } from "lucide-react";

type Page = "methods" | "mindsets";

interface HeaderProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
}

export default function Header({ currentPage, onChangePage }: HeaderProps) {
  return (
    <header className="border-b pb-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        マインドセット管理
      </h1>

      <div className="flex justify-center gap-4">
        <Button
          variant={currentPage === "methods" ? "default" : "outline"}
          onClick={() => onChangePage("methods")}
          className="flex items-center gap-2"
        >
          <ListChecks className="h-4 w-4" />
          メソッド一覧
        </Button>
        <Button
          variant={currentPage === "mindsets" ? "default" : "outline"}
          onClick={() => onChangePage("mindsets")}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          マインドセット一覧
        </Button>
      </div>
    </header>
  );
}
