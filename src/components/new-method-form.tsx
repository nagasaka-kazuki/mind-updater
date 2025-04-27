"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { methods } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export default function NewMethodForm({ mindsetId }: { mindsetId: string }) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await db.insert(methods).values({
        id: uuidv4(),
        title: title.trim(),
        mindsetId,
        createdAt: new Date(),
      });
      setTitle("");
      setIsFormVisible(false);
    } catch (error) {
      console.error("Failed to create method:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      {isFormVisible ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            placeholder="メソッドのタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "追加中..." : "追加"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsFormVisible(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFormVisible(true)}
        >
          新しいメソッドを追加
        </Button>
      )}
    </div>
  );
}
