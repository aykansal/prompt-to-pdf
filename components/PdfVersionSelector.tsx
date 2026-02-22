"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Calendar,
  MessageSquare,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PDFVersion {
  id: string;
  version: number;
  spec: any;
  timestamp: number;
  messageId: string;
  filename: string;
}

interface PdfVersionSelectorProps {
  versions: PDFVersion[];
  currentVersionId: string | null;
  onSelectVersion: (id: string | null) => void;
  onDownloadVersion: (version: PDFVersion) => void;
}

export function PdfVersionSelector({
  versions,
  currentVersionId,
  onSelectVersion,
  onDownloadVersion,
}: PdfVersionSelectorProps) {
  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  if (versions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileText className="h-8 w-8" />
        <p className="text-sm text-center">
          No PDF versions yet.<br />
          Generate a PDF to create the first version.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-3 h-9 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          pdf versions
        </span>
        <Badge variant="secondary" className="text-xs px-1 py-0 ml-auto">
          {versions.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedVersions.map((version) => (
            <div
              key={version.id}
              className={cn(
                "border rounded-lg p-3 space-y-2 transition-colors",
                currentVersionId === version.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      v{version.version}
                    </Badge>
                    <span className="text-sm font-medium truncate">
                      {version.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={currentVersionId === version.id ? "default" : "ghost"}
                    className="h-7 w-7 p-0"
                    onClick={() => onSelectVersion(version.id)}
                    title="View this version"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => onDownloadVersion(version)}
                    title="Download this version"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Generated from message</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
